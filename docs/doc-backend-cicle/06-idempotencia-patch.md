# 06 — Idempotencia segura en PATCH (Idempotency-Key)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama base: `develop2` — Agosto 2026.
> Plan de contingencia: reintentos seguros en operaciones `PATCH` no idempotentes por especificación HTTP.

---

## 1. Problema

HTTP garantiza idempotencia "natural" en `GET`, `PUT` y `DELETE`, pero **no en `PATCH`**.
Un `PATCH` con semántica de valor absoluto (ej. `status: "completed"`) es idempotente en la
práctica; uno con valores calculados en el servidor (ej. `completedAt: now()` o el `updated_at`
auto-actualizado de Prisma) **no lo es**. Ante un reintento por red, doble tap o timeout ambiguo,
la operación puede aplicarse dos veces o devolver respuestas distintas.

Objetivo: garantizar **ejecución exactly-once** (a efectos visibles) y **respuesta byte-idéntica**
en los reintentos, usando el patrón estándar de **Idempotency-Key** (el mismo que usa Stripe).

---

## 2. Diseño propuesto (evaluación previa)

> Resultado del análisis previo: el diseño es **seguro de implementar** y es el enfoque correcto,
> con 3 condiciones necesarias que el planteo base no menciona.

### 2.1 La propuesta base (correcta)

> "Para hacer PATCH robusto ante reintentos, implementaría idempotencia a nivel de API mediante una
> `Idempotency-Key`. El backend registra cada operación procesada y, si recibe nuevamente la misma
> clave, devuelve el resultado previamente generado en lugar de ejecutar nuevamente la operación.
> La persistencia de la clave y la actualización del recurso deben realizarse de forma atómica
> mediante una transacción."

Puntos correctos:
- `Idempotency-Key` es el mecanismo canónico para reintentos seguros.
- **Persistencia de la clave + actualización del recurso en transacción atómica** es exactamente lo
  correcto para evitar doble aplicación en reintentos concurrentes.
- Guardar **status + body serializado** de la primera respuesta para reproducirla byte-idéntico.

### 2.2 Las 3 condiciones necesarias que el planteo base no menciona

| # | Condición | Detalle |
|---|-----------|---------|
| a | **Fingerprint de la request** | Hash (método + path + body). Si llega la misma key con otro payload → `409 Conflict`, no rejugar ni re-ejecutar. |
| b | **Scope por usuario** | La key se indexa como `(user_id, key)`. El `User` A y el `User` B no pueden colisionar. |
| c | **Candado atómico anti-race** | `INSERT ... ON CONFLICT (user_id, key) DO NOTHING` (raw SQL) como candado; si el insert "gana" → se ejecuta la op; si "pierde" → se lee el registro y se rejuega. El unique constraint es el candado. |

### 2.3 Matices adicionales

- **Solo en mutantes** (`PATCH`/`POST`). A `GET` no le aplica; `DELETE` ya es idempotente.
- **TTL + limpieza**: la tabla crece sin límite; expirar claves (ej. 24–48h) y limpiar.
- **`updated_at`**: Prisma lo auto-modifica en cada PATCH; aunque el valor sea absoluto, la key
  garantiza que el reintento devuelva la **misma respuesta** y no duplique efectos.
- **Ortogonal al dilema PUT/PATCH**: no lo resuelve (eso es decisión de spec, checklist B1:134),
  pero hace seguro el PATCH hoy implementado en `develop2`.
- **Simplificación posible**: si todos los PATCH de la app son de valor absoluto, una versión mínima
  viable sería documentar semántica idempotente + verificar por contenido; la versión robusta (esta)
  es la recomendada para un sistema offline-first como StepUp.

---

## 3. Plan de implementación paso a paso

### Fase 0 — Preparación y rama

1. `git checkout develop2 && git pull`.
2. `git checkout -b feature/idempotency-key` (una rama por cambio, regla de `docs/CONVENCIONES.md`).

### Fase 1 — Schema y migración (Prisma → PostgreSQL)

3. Agregar modelo en `backend/prisma/schema.prisma`:

```prisma
model IdempotencyKey {
  id           Int      @id @default(autoincrement())
  userId       String   @map("user_id")
  key          String
  requestHash  String   @map("request_hash")
  method       String
  path         String
  statusCode   Int      @map("status_code")
  responseBody String   @map("response_body")
  createdAt    DateTime @default(now()) @map("created_at")
  expiresAt    DateTime @map("expires_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, key])
  @@index([expiresAt])
  @@map("idempotency_keys")
}
```

> También hay que declarar la relación inversa `idempotencyKeys IdempotencyKey[]` en `User`.

4. Generar la migración: `cd backend; npx prisma migrate dev --name idempotency_keys`.

### Fase 2 — Repositorio de idempotencia ✅ HECHA

5. `backend/src/repositories/idempotency.repository.ts` creado (compila con `npx tsc --noEmit`):
   - `findByKey(userId, key)` → registro almacenado.
   - `tryReserve(userId, key, ...)` → `INSERT ... ON CONFLICT (user_id, key) DO NOTHING`
     (raw SQL vía `prisma.$executeRaw`); devuelve si ganó (1 fila) o perdió (0 filas).
   - `storeResult(db, userId, key, { statusCode, responseBody })` → actualiza el registro
     reservado; acepta `Prisma.TransactionClient` (db) para correr dentro de la tx.
   - `deleteByKey(userId, key)` / `deleteExpired()` → borrado por fallo y limpieza TTL.
   - Detalle: el `tryReserve` inserta con valores placeholder (`status_code = 0`,
     `response_body = ''`) que `storeResult` rellena tras ejecutar la operación.
   - Convención: sigue el patrón de `repositories/task.repository.ts` (`prisma` desde
     `config/prisma.ts`); tipo `Db = Prisma.TransactionClient | typeof prisma`.

### Fase 3 — Servicio de idempotencia ✅ HECHA

6. `backend/src/services/idempotency.service.ts` creado (compila):
   - `hashRequest(method, path, body)` → SHA-256 de `${method}:${path}:${body normalizado}`.
   - `runIdempotent(ctx, operation)`:
     1. Sin key (o `GET`/`DELETE`) → ejecuta `operation(prisma)` directo.
     2. **Ganó** `tryReserve` → `prisma.$transaction(async (tx) => { op(tx) + storeResult(tx) })`;
        ante error, `deleteByKey` para permitir reintento.
     3. **Perdió** `tryReserve` → `replayOrConflict`: si `status_code = 0` (en proceso) espera
        hasta 1s (40 × 25ms); si hash coincide → **replay**; si no coincide → **`IdempotencyConflictError`**.
   - Errores propios: `IdempotencyConflictError` (key reusada con payload distinto) y
     `IdempotencyNotReadyError` (timeout esperando resultado).
   - `cleanupExpired()` → delega en `repo.deleteExpired()` (TTL 24h en `IDEMPOTENCY_TTL_MS`).
   - Detalle TS: `ctx.key` pierde narrowing tras `await` → se copia a `const key`.

### Fase 4 — Middleware ✅ HECHA

7. `backend/src/middleware/idempotency.ts` creado:
   - `requireIdempotencyKey` lee el header `Idempotency-Key`.
   - Solo actúa en `PATCH`/`POST`; `GET`/`DELETE` pasan directo.
   - Valida formato **UUID**; si no lo es → `400`.
   - Si no hay key → **passthrough** (la idempotencia es opt-in del cliente, no rompe clientes existentes).
   - Adjunta `req.idempotencyKey`; corre **después** de `requireAuth` (scoping por `req.userId`).
   - Se extendió `backend/src/types/express.d.ts` con `idempotencyKey?: string`.

### Fase 5 — Wiring en rutas/controllers/services existentes ✅ HECHA

8. `backend/src/config/prisma.ts` ahora exporta `type Db = Prisma.TransactionClient | PrismaClient`
   (tipo compartido para operaciones dentro/fuera de tx).
9. Repos `task.repository.ts` y `step.repository.ts`: `update(...)` acepta `db: Db = prisma`.
   Services `task.service.ts::updateTask` y `step.service.ts::updateStep`: aceptan `db` y lo
   reenvían al repo (permiten correr la actualización dentro de la tx de idempotencia).
10. Controllers: `task.controller.ts::update` y `step.controller.ts::update` envuelven la
    operación con `runIdempotent({ userId, key: req.idempotencyKey, method: 'PATCH', path, body })`.
    Devuelven `res.status(code).type('json').send(body)` → el **replay es byte-idéntico**.
11. Rutas: `requireIdempotencyKey` montado en los PATCH de `task.routes.ts` y `step.routes.ts`
    (corre después de `requireAuth`).
12. Alcance: los endpoints `PATCH /:id` (task y step) quedan con idempotencia. Los endpoints
    `/complete` montan el middleware pero **no** se envuelven con `runIdempotent`: siguen
    protegidos por invariantes de negocio (`STEP_ALREADY_COMPLETED` 400 / `CANNOT_COMPLETE_WITH_PENDING_STEPS` 409).
13. Verificación: `npx tsc --noEmit` OK; suite `npx jest --silent` → **45/45 passing** (sin
    romper nada existente).

### Fase 6 — Manejo de errores ✅ HECHA

10. `backend/src/utils/handle-error.ts`:
    - `IdempotencyConflictError` → **409** `{ message: "Idempotency-Key reutilizada con un payload distinto" }`.
    - `IdempotencyNotReadyError` → **503** (reintente).
    - Se usa `message` (convención existente de la API) en lugar de `error` como decía el plan
      original; decisión para mantener el shape de respuesta consistente.
    - Verificado: `npx tsc --noEmit` OK.

### Fase 7 — Tests (Jest + Supertest) ✅ HECHA

11. `backend/src/tests/idempotency.test.ts` creado (9 casos, todos pasando):
    - Misma key + mismo body dos veces → replay byte-idéntico (`updatedAt` igual, 1 solo registro).
    - Misma key + body distinto → `409` (la tarea conserva el primer valor).
    - **Concurrencia**: 2 PATCH simultáneos con la misma key → ambos 200, una sola aplicación.
    - Keys de usuarios distintos no colisionan (2 registros con la misma key).
    - **Key expirada** → se re-ejecuta (`updatedAt` cambia, 1 registro nuevo). Para esto se agregó
      `IdempotencyRepository.deleteIfExpired(userId, key)` y `runIdempotent` lo invoca antes del
      `tryReserve`.
    - Sin key → passthrough normal (no rompe clientes actuales).
    - Key no UUID en PATCH → `400`.
    - GET no aplica idempotencia (key inválida pasa igual).
    - PATCH de steps también aplica idempotencia.
    - `helpers.ts::resetDb` ahora trunca también `idempotency_keys`.
12. Verificación: `npx jest --silent` → **54/54 passing (6 suites)**; `npx tsc --noEmit` OK.

### Fase 8 — Cliente de la app (Expo RN) ✅ HECHA

> **Contexto de arquitectura:** la app es **local-first**. Los updates de tasks/steps no llaman
> a PATCH directo: se escriben en SQLite con `dirty = 1` y se envían por lote en
> `POST /api/sync/push` (LWW). Por eso el header no se usa en `TaskService.update`/`StepService.update`,
> sino que se habilita la capacidad y se wirea en los flujos POST retriables.

12. `src/services/api.ts`:
    - Nuevo tipo `ApiFetchOptions = RequestInit & { idempotencyKey?: string }`.
    - `apiFetch` agrega el header `Idempotency-Key` cuando `idempotencyKey` está presente.
13. `src/services/idempotency.ts` (nuevo): `generateIdempotencyKey()` → UUID v4 (fallback
    `Math.random`, sin `crypto` nativo en Hermes).
14. `src/services/SyncService.ts`:
    - `push(idempotencyKey = generateIdempotencyKey())` → envía key en `POST /api/sync/push`.
    - `migrate(..., idempotencyKey = generateIdempotencyKey())` → key en `POST /api/sync/migrate`.
    - Un caller puede **reutilizar la misma key en el reintento** pasándola como argumento.
15. `TaskService.delete`/`StepService.delete` (DELETE) no llevan key: DELETE ya es idempotente.
16. Verificación: `npm run typecheck` OK; `npm test` → **75/75 passing (10 files)**.
17. **Nota (follow-up):** el endpoint `POST /api/sync/push` del backend hoy **no consume**
    la `Idempotency-Key` (no está envuelto en `runIdempotent`; su upsert LWW ya es idempotente
    por id). Enviarla es inofensivo; si en el futuro se quiere exactly-once real en el push,
    se envuelve ese controller igual que en Fase 5.

### Fase 9 — Verificación ✅ HECHA

14. **Backend**: `npx jest --silent` → **54/54 passing (6 suites)**; `npm run build` OK.
15. **App**: `npm run typecheck` OK; `npm test` → **75/75 passing (10 files)**; `npm run lint`
    → **0 errores** (54 warnings pre-existentes de `no-explicit-any` en screens, ajenos al cambio).
16. **Smoke test manual** (server `node dist/server.js` local, puerto 3000):
    - `POST /api/auth/register` → crea user; `POST /api/tasks` → crea tarea.
    - `PATCH /api/tasks/:id` con `Idempotency-Key: aaaaa...` dos veces (mismo body) →
      **misma respuesta, `updatedAt` idéntico** (una sola aplicación, replay OK).
    - `PATCH` con la misma key y **body distinto** → **409**
      `{"message":"Idempotency-Key reutilizada con un payload distinto"}` (esperado).
    - Server detenido tras el smoke test.

### Fase 10 — Integración

17. Commit convencional: `feat: idempotency-keys para PATCH (reintentos seguros)`.
18. Push y PR a `develop2`. Actualizar el índice de este doc (README) y la checklist B1:134 si aplica.

---

## 4. Conclusión

El patrón `Idempotency-Key` con transacción atómica, fingerprint de request, scope por usuario y
unique constraint es el diseño correcto y **no rompe nada existente en `develop2`**. Requiere una
migración Prisma nueva, un repository + service + middleware, tests y un cambio menor en el cliente.
Es una feature aparte: **nunca tocar `develop2` directo**, siempre vía rama `feature/*` y PR.


## 5, Plan completo al detalle

- Fase 0: rama feature/idempotency-key desde develop2.
- Fase 1: modelo IdempotencyKey en schema.prisma (unique (user_id, key)) + migración.
- Fases 2–3: repositorio (tryReserve con ON CONFLICT DO NOTHING + storeResult) y servicio (runIdempotent: ganó → transacción atómica; perdió → replay o 409).
- Fases 4–6: middleware que lee el header, wiring en PATCH de tasks/steps, y mapeo de error a 409.
- Fase 7: tests (idempotency.test.ts): mismo key/body → replay; key/body distinto → 409; concurrencia; scope por usuario; TTL.
- Fase 8: cliente (api.ts agrega header; TaskService/StepService reutilizan la misma key en reintentos).
- Fases 9–10: verificación (jest, typecheck, lint, smoke test) y PR a develop2.