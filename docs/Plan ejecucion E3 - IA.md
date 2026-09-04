# Plan de ejecución — Entrega 3: Integración de IA

*Análisis del repo, issues y camino a la integración de IA + ejecución en dev*

---

## 1. Estado actual de las dependencias

| Slice | Issue | Estado | Bloqueado por |
|-------|-------|--------|---------------|
| 1 — `description` persistente | #153 | **WIP** (rama `feature/153`) | — |
| 2 — Endpoint IA backend | #154 | **Implementado** (rama `feature/154-ai-suggest-steps`, PR a `develop`) | — |
| 3 — Sugerir pasos al crear | #155 | Sin asignar | #153, #154 |
| 4 — Generar pasos desde detalle | #157 | Sin asignar | #153, #154 |
| 5 — Dashboard consistencia | #156 | Sin asignar | #122 (PR #167 ✅ verde) |

**Deuda E2 (pre-requisitos):**

| Issue | PR | Estado |
|-------|-----|--------|
| #122 (UTC) | #167 | ✅ CI verde, pidiendo review |
| #123 (IDOR) | #174 | ✅ CI verde, pidiendo review |
| #124 (idempotencia) | #175 | ✅ CI verde, pidiendo review |

---

## 2. Lo que ya existe en el código

### Backend (patrón a seguir)

| Archivo | Qué hace |
|---------|----------|
| `config/env.ts` | Fail-closed para secrets (JWT_SECRET) |
| `routes/` | Router + controller |
| `controllers/` | Clase con métodos `async (req, res)` + `handleError` |
| `services/` | Lógica de negocio |
| `validations/schemas.ts` | Zod schemas (ya tiene `optionalDescription`) |
| `middleware/auth.ts` | `requireAuth` para rutas protegidas |
| `app.ts` | Monta rutas con `app.use('/api/...', requireAuth, routes)` |
| `tests/` | Tests con supertest |

### Frontend

| Archivo | Qué hace |
|---------|----------|
| `src/services/api.ts` | `apiFetch()` con JWT + `ENDPOINTS` const |
| `src/types/index.ts` | **NO tiene `description`** todavía (WIP #153) |
| `src/database/migrations.ts` | 4 migraciones, **no tiene `description`** todavía |
| `src/services/ProgressService.ts` | `getWeek()` ya devuelve datos para el dashboard |
| `src/components/LineChart.tsx` | Existe, reutilizable para tendencia |

### Schema Prisma

Ya tiene `description String?` (WIP #153 lo agregó).

---

## 3. Pre-requisitos para ejecutar en dev

| Necesidad | Estado | Acción |
|-----------|--------|--------|
| Gemini API key | ❌ No configurada | Crear key en [AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_API_KEY` en backend `.env` | ❌ No existe | Agregar a `.env` + `.env.example` |
| `GEMINI_API_KEY` en Railway | ❌ No configurada | Agregar en dashboard de Railway |
| Migración SQLite `description` | ❌ No existe (WIP) | Completar migración V5 en #153 |
| Migración Prisma `description` | ✅ Schema actualizado | Falta generar migration file |
| Merge de PRs de deuda (#122-#124) | ⏳ Pidiendo review | Esperar aprobación del equipo |

---

## 4. Camino propuesto (orden de ejecución)

### FASE A — Cerrar deuda E2 (bloquea dashboard)

- **A1.** Merge PRs #167, #174, #175 → develop (review del equipo)
  - Cierra #122, #123, #124

### FASE B — Slice 1: description persistente (#153)

- **B1.** Migración SQLite V5: `ALTER TABLE tasks ADD COLUMN description TEXT`
- **B2.** Migración Prisma: ya está en schema, falta generar migration file
- **B3.** Tipos frontend: agregar `description` a `Task`, `CreateTaskInput`, `UpdateTaskInput`
- **B4.** TaskService (local): soportar `description` en create/update
- **B5.** SyncService: ya WIP (description en push/pull/migrate)
- **B6.** TaskFormScreen: campo description (UI)
- **B7.** TaskDetailScreen: mostrar description
- **B8.** Tests backend + frontend en verde
- **B9.** PR → develop

### FASE C — Slice 2: endpoint IA backend (#154) ✅ completada

> Nota de implementación: Google deprecó `gemini-2.5-flash` para keys nuevas (404 al
> implementar). El default quedó en `gemini-3.5-flash`, configurable vía `GEMINI_MODEL`.
> Timeout default 90 s (el free tier responde lento en horas pico).

- **C1.** ✅ Agregar `GEMINI_API_KEY` a `config/env.ts` (fail-closed como JWT_SECRET)
- **C2.** ✅ Agregar `GEMINI_API_KEY` a `.env.example` (Railway: pendiente del deploy)
- **C3.** ✅ Crear `backend/src/services/ai.service.ts`
  - `validateInput(zod)` → `fetch` Gemini REST → `sanitize response`
  - Retry con backoff en 429/5xx
  - Prompt fijo (verbo concreto, 5-25 min, 3-8 pasos)
- **C4.** ✅ Crear `backend/src/controllers/ai.controller.ts`
  - `POST /api/ai/suggest-steps` (taskName + description)
  - `POST /api/ai/describe-help` (asistente de descripción)
- **C5.** ✅ Crear `backend/src/routes/ai.routes.ts`
- **C6.** ✅ Montar en `app.ts`: `app.use('/api/ai', requireAuth, aiRoutes)`
- **C7.** ✅ Zod schema: `suggestStepsSchema` (taskName required, description optional)
- **C8.** ✅ Tests: mock fetch a Gemini (válido, inválido 400, caído 502, 429 retry)
- **C9.** PR → develop

### FASE D — Ejecución en dev para pruebas

- **D1.** `docker compose up -d` (Postgres local)
- **D2.** `npx prisma migrate deploy` (aplica description)
- **D3.** Agregar `GEMINI_API_KEY` al `.env` local del backend
- **D4.** `npm run dev` (backend)
- **D5.** `EXPO_PUBLIC_API_URL=http://localhost:3000 npx expo start` (app)
- **D6.** Probar endpoint IA directo:

```bash
curl -X POST localhost:3000/api/ai/suggest-steps \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"Estudiar para el parcial","description":"SO, temas: memoria, procesos"}'
```

- **D7.** Verificar respuesta: 3-8 pasos con `name` + `duration_min` (5-25)

### FASE E — Slices 3+4+5 (frontend, después de B+C mergeados)

- **E1.** #155: TaskForm con IA (borrador editable + sugerir pasos)
- **E2.** #157: TaskDetail con botón "Generar pasos con IA"
- **E3.** #156: Dashboard consistencia (`calculateStreak` + `LineChart`)

---

## 5. Decisiones técnicas clave

| Decisión | Valor |
|----------|-------|
| Modelo Gemini | `gemini-3.5-flash` (gratis; `gemini-2.5-flash` deprecado para keys nuevas) |
| Llamada a Gemini | `fetch` directo (sin SDK), `responseMimeType: application/json` |
| Key de Gemini | SOLO en backend (env var), nunca en el bundle |
| Fail-closed | Si `GEMINI_API_KEY` falta → el server no arranca |
| Retry | Backoff exponencial en 429/5xx, máximo 3 intentos; timeout 90 s |
| Prompt | Fijo en código, codifica reglas del dominio |
| Borrador frontend | Estado temporal de pantalla, no se persiste hasta confirmar |
| Offline | Botón IA oculto si no hay conexión; flujo manual intacto |

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Gemini free tier: ~10 RPM | Backoff + mensaje claro al usuario |
| Respuesta IA inválida | Sanitizar en backend: descartar pasos vacíos, clamp duration 5-25 |
| Key expuesta | Solo en backend env; secret scanning en GitHub ya activo |
| Migración description rompe datos existentes | `ALTER TABLE ADD COLUMN` es seguro, nullable |

---

## 7. Próximo paso inmediato

Terminar el **Slice 1 (#153)** — rama `feature/153-descripcion-tarea`. El backend ya tiene el WIP (schema, repository, sync, service, schemas). Falta:

1. Migración SQLite V5 (agregar a `src/database/migrations.ts`)
2. Tipos frontend (`src/types/index.ts` → agregar `description`)
3. TaskService local (soportar `description`)
4. TaskFormScreen + TaskDetailScreen (UI)
5. Tests

---

*StepUp — Plan de ejecución E3 — Septiembre 2026*
