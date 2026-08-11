# Backend StepUp — Progreso de implementación

> Documento vivo que registra lo que se construyó en `backend/` hasta ahora (Agosto 2026).
> Rama de trabajo: `feature/backend-express-prisma-postgres` → Fase E3 en
> `feature/backend-auth-sync`.

---

## Qué se hizo

Se construyó la base del **Track B (Backend + Auth + Sync)** de la E2:
infraestructura de base de datos contenerizada, proyecto Node.js + Express + Prisma,
modelo relacional mapeado al SQLite local y API REST de tareas y pasos con la
regla de oro del negocio en el servidor.

### Fases cubiertas

| Fase | Contenido | Estado |
|---|---|---|
| 1 | PostgreSQL contenerizado con Docker | ✅ |
| 2 | Proyecto Node.js + TypeScript + Prisma | ✅ |
| 3 | Modelo relacional en Prisma + migración `init` | ✅ |
| 4 | Arquitectura Express en 3 capas (tareas) | ✅ |
| 5 | Módulo de Pasos + Métricas diarias | ✅ |
| 6 | Pruebas de integración manuales | ✅ |
| 7 | CRUD completo + validación zod + `GET /api/progress` | ✅ |
| 8 | App móvil conectada a la API (servicios HTTP) | ✅ |
| 9 | Pruebas de integración automatizadas (Jest + Supertest) | ✅ |
| 10 | Auth JWT (register / login / me) + CRUD scopeado por usuario | ✅ |
| 11 | Endpoints de sync (push / pull / migrate) con last-write-wins | ✅ |

---

## Estructura del backend

```
backend/
├── docker-compose.yml          # PostgreSQL 16 (contenedor stepup-postgres)
├── .env                        # PORT, DATABASE_URL y JWT_SECRET (no se commitea)
├── .env.example                # plantilla con las variables del backend
├── .gitignore
├── package.json                # scripts dev/build/start/prisma
├── tsconfig.json
├── prisma/
│   ├── schema.prisma           # modelo relacional (User, Task, Step, DailyProgress)
│   └── migrations/             # init + auth_and_sync (UUIDs, userId, updatedAt)
└── src/
    ├── config/
    │   ├── prisma.ts           # singleton PrismaClient
    │   └── env.ts              # JWT_SECRET (env con fallback dev)
    ├── middleware/
    │   └── auth.ts             # requireAuth: valida Bearer JWT → req.userId
    ├── repositories/
    │   ├── task.repository.ts
    │   ├── step.repository.ts
    │   └── progress.repository.ts
    ├── services/
    │   ├── task.service.ts
    │   ├── step.service.ts
    │   ├── progress.service.ts
    │   ├── auth.service.ts     # register/login (bcrypt + JWT)
    │   └── sync.service.ts     # push (upsert LWW), pull, migrate
    ├── controllers/
    │   ├── task.controller.ts
    │   ├── step.controller.ts
    │   ├── progress.controller.ts
    │   ├── auth.controller.ts
    │   └── sync.controller.ts
    ├── routes/
    │   ├── task.routes.ts
    │   ├── step.routes.ts
    │   ├── progress.routes.ts
    │   ├── auth.routes.ts      # register, login, me
    │   └── sync.routes.ts      # push, pull, migrate
    ├── validations/
    │   └── schemas.ts            # schemas zod (CRUD + auth + sync)
    ├── types/
    │   └── express.d.ts          # Request.userId tipado
    ├── utils/
    │   ├── handle-error.ts       # mapeo de errores (zod, Prisma P2025, reglas)
    │   └── jwt.ts                # signToken / verifyToken
    ├── app.ts                  # createApp(): monta routers (auth global en CRUD)
    ├── server.ts               # entry point, arranca el listener
    ├── jest.config.js          # Jest (ts-jest, un solo worker, DB de test)
    ├── jest.env.setup.js       # setea DATABASE_URL → stepup_test + JWT_SECRET test
    ├── jest.globalSetup.js     # npx prisma db push --force-reset (test DB)
    └── src/tests/
        ├── helpers.ts          # app, resetDb, registerUser, authHeader, createTask, addStep
        ├── tasks.test.ts       # invariante 409/200 + validación + CRUD
        ├── steps.test.ts       # nextStep, auto-finalización, reorder, reindex
        ├── progress.test.ts    # métricas diarias
        ├── auth.test.ts        # register, login, me, 401 del middleware
        └── sync.test.ts        # push (LWW), pull, migrate, aislamiento
```

---

## 1. Infraestructura de base de datos

`backend/docker-compose.yml` levanta PostgreSQL 16 Alpine:

- Host: `localhost:5432` — DB: `stepup_db`
- User: `stepup_user` — Password: `stepup_password`
- Volumen persistente `postgres_data`

Comandos:

```bash
docker compose up -d          # levantar el contenedor
docker compose down           # detener (no borra el volumen)
```

Se puede inspeccionar con **DBeaver** (PostgreSQL → localhost:5432) o por consola:

```bash
docker exec -it stepup-postgres psql -U stepup_user -d stepup_db
```

---

## 2. Modelo relacional (Prisma)

`prisma/schema.prisma` replica la estructura del SQLite local de la app
(`src/database/migrations.ts`): mismas tablas, mismos nombres de columna en
snake_case (`@map`), mismos enums y la misma FK en cascada.

| Tabla | Columnas | Notas |
|---|---|---|
| `tasks` | id, name, due_date, status, created_at, completed_at | enum `TaskStatus` (active/completed) |
| `steps` | id, task_id, name, duration_min, order_index, status, completed_at | FK `task_id → tasks.id` **ON DELETE CASCADE** |
| `daily_progress` | id, date, steps_completed | `date` único (YYYY-MM-DD) |

La migración inicial fue aplicada con:

```bash
npx prisma migrate dev --name init
```

Regenerar el cliente cuando cambie el schema:

```bash
npx prisma generate
```

---

## 3. Arquitectura en 3 capas

La API sigue el mismo principio que la app móvil: los controllers nunca tocan la
base de datos; todo pasa por el servicio (lógica de negocio) y el repositorio
(acceso a datos con Prisma).

```
routes → controller → service (reglas de negocio) → repository → Prisma → PostgreSQL
```

### Endpoints actuales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check del servidor |
| POST | `/api/auth/register` | Crear cuenta `{ name, email, password }` → 201 `{ user, token }` |
| POST | `/api/auth/login` | Iniciar sesión → 200 `{ user, token }` |
| GET | `/api/auth/me` | Usuario autenticado (Bearer) → 200 `{ user }` |
| GET | `/api/tasks` | Tareas activas con sus pasos ordenados (scope por usuario) |
| GET | `/api/tasks/completed` | Tareas completadas (ordenadas por `completedAt`) |
| GET | `/api/tasks/:id` | Detalle de una tarea con sus pasos |
| POST | `/api/tasks` | Crear tarea `{ name, dueDate? }` → 201 |
| PATCH | `/api/tasks/:id` | Actualizar tarea `{ name?, dueDate? }` |
| DELETE | `/api/tasks/:id` | Eliminar tarea (cascade a pasos) → 204 |
| PATCH | `/api/tasks/:id/complete` | Completar tarea (409 si quedan pasos) |
| GET | `/api/steps?taskId=N` | Pasos de una tarea en orden |
| POST | `/api/steps` | Crear paso `{ taskId, name, durationMin? }` (orderIndex auto) |
| PATCH | `/api/steps/:id` | Actualizar paso `{ name?, durationMin? }` |
| PUT | `/api/steps/reorder` | Reordenar pasos `{ taskId, orderedIds }` |
| DELETE | `/api/steps/:id` | Eliminar paso (reindexa los restantes) → 204 |
| PATCH | `/api/steps/:id/complete` | Completar paso + métrica diaria + cierre automático |
| GET | `/api/progress` | Historial de `daily_progress` del usuario (ordenado por fecha) |
| POST | `/api/sync/push` | Upsert atómico `{ tasks[], steps[] }` con last-write-wins → 200 `{ tasks[], steps[] }` |
| GET | `/api/sync/pull?since={ISO}` | Tareas y pasos del usuario modificados después de `since` → 200 `{ tasks[], steps[] }` |
| POST | `/api/sync/migrate` | Crear cuenta + importar datos locales → 201 `{ user, token, taskMap, stepMap }` |

**Auth:** todas las rutas de datos exigen `Authorization: Bearer <jwt>` (middleware `requireAuth`), excepto
`/api/auth/register`, `/api/auth/login` y `/api/sync/migrate`. Token JWT de 30 días, contraseñas con bcrypt (cost 10).

Los bodies de entrada se validan con **zod** (errores → HTTP 400 con mensaje en español).

### Regla de oro (invariante)

**No se puede completar una tarea si tiene pasos pendientes.** El servidor lo
valida con `pendingCount > 0 → HTTP 409`. La regla vive en el backend, inmune a
manipulación desde el cliente.

### Flujo al completar un paso (`step.service.ts`)

1. Verifica que el paso exista (404) y no esté ya completado (400).
2. Marca el paso como `completed` con `completed_at`.
3. Incrementa el contador diario (`upsert` atómico por fecha en `daily_progress`).
4. Busca el próximo paso pendiente (`orderIndex` asc).
5. Si no queda ninguno, cierra la tarea automáticamente (`taskCompleted: true`).

---

## 4. Pruebas de integración manuales (validadas en vivo)

### Invariante de tareas (HTTP 409 vs 200)

| Paso | Acción | Resultado |
|---|---|---|
| 1 | Seed: tarea + paso `pending` | — |
| 2 | `PATCH /api/tasks/1/complete` | **409** `{"message":"No se puede completar una tarea con pasos pendientes"}` |
| 3 | `UPDATE steps SET status='completed'` | — |
| 4 | Reintento del mismo PATCH | **200** con la tarea `completed` |

### Módulo de pasos

| Caso | Resultado |
|---|---|
| Completar paso 1 de 2 | **200**, devuelve `nextStep` y `taskCompleted: false` |
| Reintentar el mismo paso | **400** "El paso ya se encuentra completado" |
| Paso inexistente | **404** "El paso especificado no existe" |
| Completar el último paso | **200** `nextStep: null`, `taskCompleted: true` |
| Métrica diaria | `daily_progress` incrementa en 1 por paso, por fecha |

### CRUD completo (validado en vivo)

| Caso | Resultado |
|---|---|
| `POST /api/tasks` `{name, dueDate}` | **201**, tarea creada con `status: active` |
| `POST /api/steps` x2 | **201**, `orderIndex` auto 0 y 1 (max + 1) |
| `GET /api/tasks` | Lista activas con `steps` embebidos y ordenados |
| `GET /api/tasks/:id` | Detalle con pasos |
| `GET /api/steps?taskId=1` | Pasos ordenados por `orderIndex` |
| `PATCH /api/tasks/:id` | Actualiza campos |
| `PATCH /api/steps/:id` | Actualiza campos |
| `POST /api/tasks {}` | **400** "El nombre es obligatorio" (zod, español) |
| `PATCH /api/tasks/1/complete` (con pasos pendientes) | **409** invariante |
| `GET /api/progress` | `[{date, stepsCompleted}]` |
| `PUT /api/steps/reorder` | Reordena (`orderedIds` → `orderIndex` 0..n) |
| `DELETE /api/steps/:id` | **204** y reindexa los restantes |
| `DELETE /api/tasks/:id` | **204**, cascade a pasos |

### Smoke test del flujo de la app (última pasada)

Simulando lo que hace la app móvil: crear tarea → 2 pasos → listar → completar
paso 1 (`nextStep` devuelto, `taskCompleted: false`) → completar paso 2
(`nextStep: null`, `taskCompleted: true`) → `GET /api/tasks/completed` devuelve la
tarea cerrada → `GET /api/progress` marca `stepsCompleted: 2`. Todo validado con
el servidor corriendo en `localhost:3000`.

---

## 5. Pruebas de integración automatizadas (Jest + Supertest)

Lo que antes se validaba a mano con curl ahora está codificado en la suite:

- **5 suites / 39 casos**, contra una base dedicada `stepup_test` (PostgreSQL en
  el mismo contenedor Docker). El backend real (`createApp`) se ejercita en
  proceso vía Supertest, sin levantar listener ni tocar la DB de desarrollo.
- **`jest.globalSetup.js`** hace `prisma db push --force-reset --skip-generate`
  contra `stepup_test` antes de la suite → esquema fresco en cada corrida.
- **`jest.env.setup.js`** apunta `DATABASE_URL` a `stepup_test` y `NODE_ENV=test`.
- **`helpers.ts`** expone `resetDb()` (TRUNCATE con restart de identidades) que
  cada `beforeEach` ejecuta para aislar los casos.

Lo que queda cubierto y por qué importa:

| Suites / casos | Invariante de negocio que protege |
|---|---|
| `tasks.test.ts` | **409** con pasos pendientes vs **200** sin pasos, validación zod (400), cascade en DELETE, listado activas/completadas |
| `steps.test.ts` | `nextStep` devuelto en orden, auto-finalización al cerrar el último paso, reintento → **400**, `orderIndex` auto y reindexado tras delete |
| `progress.test.ts` | Métrica diaria incrementa por paso completado; tareas sin pasos no inflan el contador |
| `auth.test.ts` | Registro → 201, email repetido → **409**, login OK → 200, credenciales inválidas → **401**, `/me` y rutas de datos sin token → **401** |
| `sync.test.ts` | push crea tareas y devuelve server ids, LWW (versión vieja ignorada), pasos por `taskLocalId`, registro ajeno → **409**, pull por `since`, aislamiento entre usuarios, migrate importa + `taskMap`, email repetido → **409** |

Correr la suite (requiere el contenedor Docker levantado):

```bash
cd backend
npm test              # corrida única (globalSetup resetea stepup_test)
npm run test:watch    # modo watch
```

Nota de configuración: **`maxWorkers: 1`** es obligatorio porque las suites
comparten la misma base de datos; en paralelo los `TRUNCATE` de una suite pisan
los datos de otra y producen fallas 500/404 espurias (visto y corregido).

---

## 6. Decisiones técnicas tomadas

| Decisión | Detalle |
|---|---|
| **Prisma 6.19** (no 7) | Prisma 7 genera un cliente ESM-only incompatible con `ts-node-dev` (CommonJS). Se usó la versión estable que asume la guía. |
| **TypeScript 5.9** (no 7) | TS 7 es el compilador nativo y no expone la API que usa `ts-node-dev`. |
| `moduleResolution: "node10"` | `"node"` está deprecado en TS 5.x; `node10` es el mismo comportamiento con el nombre actual. |
| Prefijo `/api` en rutas | Los routers se montan bajo `/api/*` para agrupar la API REST. |
| Named exports en routers | `taskRoutes` y `stepRoutes` se importan con nombre en `app.ts`. |

---

## 7. Cómo correr el backend

```bash
cd backend
npm install                # primera vez
docker compose up -d       # base de datos
npm run prisma:migrate     # aplicar migraciones (si cambió el schema)
npm run dev                # servidor en http://localhost:3000
```

Scripts disponibles: `dev`, `build` (tsc → dist/), `start`, `prisma:migrate`,
`prisma:generate`, `prisma:studio`.

---

## Pendiente (próximos pasos de E2)

- [x] CRUD completo de tareas y pasos (create / update / delete)
- [x] Validación de entrada con zod
- [x] Conexión de la app móvil al backend (servicios refactorizados a HTTP)
- [x] Autenticación JWT (register + login) + modelo `User`
- [x] Endpoints de sync (pull / push) con last-write-wins
- [ ] Sincronización del lado app (`SyncService` + columnas `server_id`/`dirty`/`updated_at` + `sync_meta`)
- [ ] Hosting en Railway

---

## 8. Conexión de la app móvil (refactor a HTTP)

Los servicios móviles dejaron de usar `expo-sqlite` y ahora hablan con la API:

| Archivo móvil | Antes | Ahora |
|---|---|---|
| `src/services/api.ts` | — (nuevo) | Cliente HTTP con base URL derivada de Expo (`hostUri` → IP del host en LAN / `10.0.2.2` en emulador Android) |
| `src/services/TaskService.ts` | Queries SQLite | CRUD vía `apiFetch` (GET/POST/PATCH/DELETE) |
| `src/services/StepService.ts` | Queries SQLite | CRUD + reorder + complete vía API |
| `src/services/ProgressService.ts` | SQLite local | `increment()` pasa a no-op (el backend lo hace al completar un paso); `getToday()` y `getWeek()` leen `GET /api/progress` |

**Mapeo de nombres:** la API responde en camelCase (`dueDate`, `taskId`, `orderIndex`)
y los servicios lo traducen a los tipos locales snake_case (`due_date`, `task_id`,
`order_index`) para que las pantallas no cambien. Las firmas públicas de los
servicios se mantuvieron idénticas → las screens no requirieron cambios.

**Nota (offline):** este cambio reemplaza el almacenamiento local. El modo
offline-first híbrido (SQLite sin cuenta) queda suspendido hasta implementar la
sincronización; `src/database/` se conserva para reutilizarlo en la fase de sync.

### Configuración del cliente HTTP (variables de entorno)

- **`.env`** (ignorado por git) y **`.env.example`** (commiteado) definen
  `EXPO_PUBLIC_API_URL` con la URL base del backend.
- `src/services/api.ts` resuelve la base en este orden de prioridad:
  1. `process.env.EXPO_PUBLIC_API_URL` (si está definida);
  2. `hostUri` de Expo (IP LAN del dev server, útil en teléfono físico);
  3. `10.0.2.2:3000` en emulador Android; `localhost:3000` como último recurso.
- Los endpoints están **centralizados** en el objeto `ENDPOINTS` de `api.ts` y
  los tres servicios (`TaskService`, `StepService`, `ProgressService`) los usan —
  no hay rutas hardcodeadas sueltas en los servicios.
- Cambiar `.env` requiere reiniciar el dev server de Expo (`npx expo start`).

---

## 9. Fase E3 — Autenticación y sincronización (Rama `feature/backend-auth-sync`)

### 9.1 Auth JWT + scopeo por usuario

- Modelo `User` (`id` UUID, `name`, `email` único, `password` hash bcrypt).
- `Task.userId` → relación 1:N; **todo el CRUD queda scopeado por usuario**
  (repositorios filtran por `userId`, incluido el progreso diario con
  `@@unique([userId, date])`).
- `POST /api/auth/register` y `POST /api/auth/login` devuelven `{ user, token }`;
  `GET /api/auth/me` requiere Bearer.
- Middleware `requireAuth` (JWT 30d, `JWT_SECRET` vía env, fallback dev).
- **Ruptura de contrato para la app E2:** las rutas de datos ahora exigen
  `Authorization: Bearer <token>`. La app sin cuenta devuelve 401 hasta que se
  implemente la fase frontend (AuthService + ApiClient).

### 9.2 Sync offline-first (push / pull / migrate)

- **IDs UUID** en `Task`/`Step` (evita colisión con el autoincrement de SQLite).
  El UUID que genera la app localmente es el mismo `id` que persiste el servidor
  → el push es **idempotente** (re-envío no duplica).
- **`updatedAt`** (`@updatedAt`) como base del **last-write-wins**: en el push,
  solo se aplica el registro si su `updatedAt` es estrictamente más nuevo; si no,
  responde `applied: false`.
- `POST /api/sync/push`: upserts atómicos en `$transaction`. Los pasos referencian
  su tarea por `taskId` (UUID) o por `taskLocalId` cuando la tarea es nueva dentro
  del mismo batch. Rechaza **409** si el id pertenece a otro usuario.
- `GET /api/sync/pull?since={ISO}`: tareas y pasos del usuario con
  `updatedAt > since` (orden ascendente). `since` inválido → 400.
- `POST /api/sync/migrate`: crea la cuenta e importa los datos locales en una sola
  transacción; devuelve `{ user, token, taskMap, stepMap }` donde
  `taskMap = { localId: serverId }` permite a la app reescribir sus IDs locales.
- Schema: `prisma/migrations/20260810183756_auth_and_sync/` (cambio destructivo de
  PK `Int → UUID`; en dev se aplicó `prisma migrate reset` antes).

### 9.3 Cómo correr la suite

```bash
cd backend
docker compose up -d        # PostgreSQL
npm test                    # 5 suites / 39 casos (reset automático de stepup_test)
```
