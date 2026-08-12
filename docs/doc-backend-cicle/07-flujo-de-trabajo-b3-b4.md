# 07 — Flujo de trabajo B3 y B4 (análisis previo en develop2)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `develop2` — Agosto 2026.
> Proceso: una rama `feature/*` por issue, encargada de analizar, verificar y completar lo que
> pide la issue contra lo que ya existe en el proyecto.

---

## 1. Flujo de trabajo acordado

```
develop2
  └── feature/b3-<issue>     ← analiza #19: qué pide vs. qué ya existe en develop2
  └── feature/b4-<issue>     ← analiza #20: igual
```

- Una rama por issue (regla de `docs/CONVENCIONES.md`).
- Cada rama: se crea desde `develop2`, hace el **análisis y verificación** del estado de la issue,
  completa lo que falta y termina en PR a `develop2`.
- Antes de crear ramas se hace un **análisis previo en `develop2`** para conocer el estado real.

Issues:
- **#19 → B3: Task CRUD + Step CRUD API** (`ready-for-agent, backend, epic`).
- **#20 → B4: Sync push/pull + migrate (backend + app)** (`ready-for-agent, backend, auth, epic`).

---

## 2. Análisis previo de B3 (#19) — Task CRUD + Step CRUD API

Lo que pide la issue: endpoints CRUD de tasks y steps protegidos por JWT, scoped al userId.

| Criterio (issue) | Estado en develop2 |
|---|---|
| GET /api/tasks scoped | ✅ |
| POST /api/tasks → 201 | ✅ |
| **PUT** /api/tasks/:id | ⚠️ es **PATCH** |
| DELETE /api/tasks/:id → 204 + cascade | ✅ |
| **GET /api/tasks/:taskId/steps** (anidada, ordenados por orderIndex) | ⚠️ es **plana** `GET /api/steps?taskId=` |
| **POST /api/tasks/:taskId/steps** (anidada, orderIndex al final) | ⚠️ es **plana** `POST /api/steps` con `{taskId}` |
| **PUT** /api/steps/:id | ⚠️ es **PATCH** |
| DELETE /api/steps/:id → 204 + reindexa | ✅ |
| 401 sin token | ✅ |
| 404 si no pertenece al usuario | ✅ |

**Resultado: la funcionalidad existe, pero hay 4 desvíos de spec** (los mismos
"decisiones pendientes del equipo" documentados en `docs/B1 - Railway deploy checklist.md:134`):

1. `PUT /api/tasks/:id` → hoy `PATCH`.
2. `PUT /api/steps/:id` → hoy `PATCH`.
3. `GET /api/tasks/:taskId/steps` (anidada) → hoy `GET /api/steps?taskId=` (plana).
4. `POST /api/tasks/:taskId/steps` (anidada) → hoy `POST /api/steps` con `{taskId}` (plana).

Detalle importante: alinear a la spec implica tocar también la **app** (`src/services/api.ts`,
`ENDPOINTS.steps.list/update`) y los **tests** del backend.

Endpoints extra (no pedidos por la issue, hay que decidir si se mantienen): `PATCH /api/tasks/:id/complete`,
`PATCH /api/steps/:id/complete`, `PUT /api/steps/reorder`.

---

## 3. Análisis previo de B4 (#20) — Sync push/pull + migrate

Lo que pide la issue: sincronización offline-first (backend con endpoints de sync + SyncService en la app).

| Criterio (issue) | Estado en develop2 |
|---|---|
| POST /api/sync/push (upsert LWW + server_ids) | ✅ |
| GET /api/sync/pull?since= | ✅ |
| POST /api/sync/migrate → user+token+taskMap | ✅ |
| App: SyncService.push() envía dirty y actualiza server_ids | ✅ |
| App: SyncService.pull() aplica cambios remotos | ✅ |
| App: SyncService.migrate() envía todos los datos al registrarse | ✅ |
| Registros creados offline marcados como dirty | ✅ |
| Sync al abrir/cerrar app | ✅ (`syncLifecycle.ts` wired en `App.tsx:162`) |
| SyncConflictScreen (opcional) | ✅ existe |

**Resultado: B4 está completo** — no le falta código; la rama de B4 sería de
verificación/cierre (tests + checklist + cerrar issue).

Notas:
- B4 está "blocked by" #18 (B2) y #19 (B3). B2 está cerrado; B3 existe funcionalmente con los
  4 desvíos de spec → B3 desbloquea formalmente a B4.

---

## 4. Conclusión del análisis previo

- **B4**: completo → rama de análisis/cierre.
- **B3**: le faltan decisiones + 4 alineaciones de spec → rama con trabajo real.

Orden sugerido de trabajo: **B3 primero** (desbloquea formalmente B4), luego B4.

> El resultado de cada rama (verificación, cambios, checklist y cierre) se documentará como
> sección anexa a este documento a medida que se ejecuten.

---

## 5. Anexo — Ejecución de B3 (#19) en `feature/b3-task-step-crud` (12/08/2026)

### 5.1 Decisiones tomadas

| Decisión | Detalle |
|---|---|
| **PATCH → PUT** en updates | `PUT /api/tasks/:id` y `PUT /api/steps/:id` (spec). Se mantiene semántica tolerante de update parcial (`name`/`dueDate` opcionales). |
| **Endpoints anidados como API primaria** | `GET /api/tasks/:taskId/steps` y `POST /api/tasks/:taskId/steps` (spec). |
| **Aliases planos conservados** | `GET /api/steps?taskId=` y `POST /api/steps` se mantienen como compatibilidad — no rompe clientes existentes. |
| **Idempotencia extendida a PUT** | `middleware/idempotency.ts` ahora acepta PUT (antes solo PATCH/POST), para conservar el replay seguro en los updates. |
| **404 en GET anidado** | Si la tarea no existe o no pertenece al usuario → `404` (scoping). El endpoint plano devolvía `[]`. |
| **Endpoints extra mantenidos** | `PATCH /:id/complete` (tasks y steps) y `PUT /api/steps/reorder`: funcionales y con tests. |

### 5.2 Checklist contra la issue #19

| Criterio | Antes | Después |
|---|---|---|
| GET /api/tasks scoped | ✅ | ✅ |
| POST /api/tasks → 201 | ✅ | ✅ |
| **PUT** /api/tasks/:id | ⚠️ PATCH | ✅ PUT |
| DELETE /api/tasks/:id → 204 + cascade | ✅ | ✅ |
| **GET /api/tasks/:taskId/steps** (anidada) | ⚠️ plana | ✅ anidada |
| **POST /api/tasks/:taskId/steps** (anidada) | ⚠️ plana | ✅ anidada |
| **PUT** /api/steps/:id | ⚠️ PATCH | ✅ PUT |
| DELETE /api/steps/:id → 204 + reindexa | ✅ | ✅ |
| 401 sin token | ✅ | ✅ |
| 404 si no pertenece al usuario | ✅ | ✅ |

### 5.3 Archivos tocados

- `backend/src/routes/task.routes.ts` — `put('/:id')`, `get('/:taskId/steps')`, `post('/:taskId/steps')`
- `backend/src/routes/step.routes.ts` — `put('/:id')`
- `backend/src/controllers/task.controller.ts` — método idempotencia `PUT` + handlers `listSteps`/`createStep`
- `backend/src/controllers/step.controller.ts` — método idempotencia `PUT`
- `backend/src/middleware/idempotency.ts` — acepta `PUT`
- `backend/src/validations/schemas.ts` — extraído `createStepToTaskSchema`
- `backend/src/services/step.service.ts` — `addStepToTask(userId, taskId, input)`
- `src/services/api.ts` — `ENDPOINTS.steps.list/create` → anidados
- Tests: `helpers.ts`, `tasks.test.ts`, `steps.test.ts`, `idempotency.test.ts` — alineados a spec

### 5.4 Verificación

- Backend: **58/58 tests OK** (`npm test` en `backend/`).
- App: **75/75 tests OK** (`npm test` en raíz).
- `tsc --noEmit` OK en backend y raíz.
- Lint app: 0 errores (54 warnings preexistentes en screens, ninguno introducido por B3).

### 5.5 Pendiente

- PR `feature/b3-task-step-crud` → `develop2` (con 1 aprobación de otro integrante).
- Ejecutar B4 (#20) como rama de verificación/cierre (ya completo en `develop2`).
