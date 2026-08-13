# Backend API REST — StepUp E2

**PRD — Julio 2026**

## Problem Statement

StepUp actualmente funciona 100% offline con SQLite local. El usuario no tiene cuenta, no puede recuperar sus datos si pierde el dispositivo, ni acceder a sus tareas desde otro teléfono. Para la Entrega 2 se necesita un backend que permita autenticación, persistencia remota y sincronización básica — sin romper la experiencia offline que ya funciona.

## Solution

Agregar un backend Node.js + Express + Prisma + PostgreSQL que permita registro e inicio de sesión con JWT, almacene tareas y pasos en el servidor, sincronice datos entre el dispositivo local y la nube, y mantenga compatibilidad: el usuario puede usar la app sin cuenta (modo E1) y migrar sus datos al registrarse.

## User Stories

1. As a user, I want to create an account with my name, email and password, so that my tasks are saved in the cloud.
2. As a user, I want to log in with my email and password, so that I can access my tasks from any device.
3. As a user, I want my existing local tasks to be uploaded to the server when I register, so that I don't lose what I already created.
4. As a user, I want to create tasks while offline, so that I can still use the app without internet.
5. As a user, I want my offline-created tasks to sync to the server when I reconnect, so that everything stays backed up.
6. As a user, I want to see my tasks from the server when I log in on a new device, so that I can pick up where I left off.
7. As a user, I want my steps to sync along with their parent task, so that the full task structure is preserved.
8. As a user, I want to stay logged in between sessions, so that I don't have to enter my password every time.
9. As a developer, I want a clear API contract, so that the mobile app and server can be developed independently.
10. As a developer, I want the sync mechanism to use last-write-wins, so that conflict resolution is simple and predictable.

## Implementation Decisions

### Project Structure

Nuevo directorio `backend/` en la raíz del repo, separado de la app React Native. TypeScript con tipos compartidos.

```
stepup/
├── backend/
│   ├── src/
│   │   ├── index.ts           — entry point, Express app
│   │   ├── routes/
│   │   │   ├── auth.ts        — register, login, me
│   │   │   ├── tasks.ts       — CRUD de tareas
│   │   │   ├── steps.ts       — CRUD de pasos
│   │   │   └── sync.ts        — push, pull, migrate
│   │   ├── middleware/
│   │   │   └── auth.ts        — JWT verification
│   │   └── lib/
│   │       └── prisma.ts      — Prisma client singleton
│   ├── prisma/
│   │   └── schema.prisma      — modelo de datos
│   ├── package.json
│   └── tsconfig.json
├── src/                       — app React Native (existente)
└── docs/
    └── Backend E2 PRD.md      — este documento
```

### Schema — Prisma (PostgreSQL) — versión implementada

El schema real en `backend/prisma/schema.prisma` es: `User` (id uuid, name, email unique, password, createdAt), `Task` (id uuid, userId, name, dueDate `DateTime?`, status enum `active|completed`, createdAt, updatedAt, completedAt), `Step` (id uuid, taskId, name, durationMin?, orderIndex, status enum `pending|completed`, timestamps), `DailyProgress` (userId, date, stepsCompleted, `@@unique([userId, date])`) e `IdempotencyKey` (userId, key, requestHash, method, path, statusCode, responseBody, expiresAt, `@@unique([userId, key])`).

Frente a la primera versión de este PRD cambió: IDs UUID del lado servidor (se mantiene la decisión de evitar colisiones con los IDs enteros de SQLite local), `dueDate` como `DateTime?` (no string), se agregaron los modelos `DailyProgress` e `IdempotencyKey`, enums tipados en lugar de strings, e índices compuestos (`userId, updatedAt`) para el pull de sync.

Se planea el backfill seguro de la migración (issue #69) y los índices adicionales de `Step` (`taskId + orderIndex/status/updatedAt`, issue #77).

### API Endpoints — versión implementada (ciclo 2026)

```
POST   /api/auth/register    Body: { name, email, password }     → 201 { user, token }
POST   /api/auth/login       Body: { email, password }           → 200 { user, token }
GET    /api/auth/me          Header: Authorization: Bearer <jwt> → 200 { user }

GET    /api/tasks                                                → 200 Task[]
POST   /api/tasks            Body: { name, dueDate? }            → 201 Task
PATCH  /api/tasks/:id        Body: { name?, dueDate? }           → 200 Task
PATCH  /api/tasks/:id/complete                                   → 200 Task
DELETE /api/tasks/:id                                            → 204

GET    /api/tasks/:taskId/steps                                  → 200 Step[]
POST   /api/steps            Body: { taskId, name, durationMin?, orderIndex? } → 201 Step
PATCH  /api/steps/:id        Body: { name?, durationMin? }       → 200 Step
PUT    /api/steps/reorder    Body: { taskId, orderedIds[] }      → 200 { ok }
PATCH  /api/steps/:id/complete                                   → 200 { nextStep, taskCompleted }
DELETE /api/steps/:id                                            → 204

POST   /api/sync/push        Body: { tasks[], steps[] }          → 200 { tasks[], steps[] }
GET    /api/sync/pull?since={ISO timestamp}                      → 200 { tasks[], steps[] }
POST   /api/sync/migrate     Body: { tasks[], steps[], email, password, name }
                                                                 → 201 { user, token, taskMap }
```

Diferencias frente al diseño original: PATCH en vez de PUT en `tasks/:id`/`steps/:id`, `POST /api/steps` plano (no anidado bajo `tasks/:taskId/steps`), endpoints nuevos `/complete`, reordenamiento propio con `PUT /api/steps/reorder`, y `Idempotency-Key` obligatoria (UUID, 400 si inválida) en POST/PUT/PATCH para writes (ver issue #67).

**Auth middleware** en todas las rutas excepto `/api/auth/register`, `/api/auth/login` y `/api/sync/migrate`. Retorna 401 si el token falta o es inválido. JWT fail-closed: el backend no arranca sin `JWT_SECRET` seguro (issue #65).

### Sync: Cómo conecta con la app actual

**App-side changes:**

1. **SQLite schema** — agregar columnas a `tasks` y `steps`:
   - `server_id TEXT` — UUID del servidor (nullable si nunca se sincronizó)
   - `dirty INTEGER DEFAULT 0` — 1 si hay cambios locales no sincronizados
   - `updated_at TEXT` — timestamp ISO para last-write-wins

2. **Nuevo módulo `SyncService`** — orquesta push/pull:
   - `push()`: envía todos los registros dirty al servidor. Servidor responde con los server_ids asignados. Se actualiza localmente.
   - `pull()`: pide cambios desde `lastSyncAt`. Aplica inserts/updates locales.
   - `migrate()`: envía todo el dataset local a `/sync/migrate` junto con credenciales. Servidor crea cuenta e importa datos. App guarda token y mapea IDs.

3. **Nuevo módulo `ApiClient`** — wrapper de fetch:
   - Adjunta automáticamente el token JWT desde AsyncStorage
   - Maneja errores 401 (token expirado → logout)
   - Expone métodos: `get`, `post`, `put`, `delete`

4. **Nuevo módulo `AuthService`**:
   - `login(email, password)` → guarda token + user en AsyncStorage
   - `register(name, email, password)` → igual + migra datos locales
   - `logout()` → limpia token + server_ids (datos locales se conservan)
   - `isLoggedIn()` → checkea si hay token guardado
   - `getToken()` → retorna token guardado

5. **Navegación** — al arrancar la app:
   - Si `isLoggedIn()` → va a MainTabs
   - Si no → va a LoginScreen (con opción de "Saltar y usar offline")

### Flujo offline-first híbrido

```
Estado: Sin cuenta
  → Todo escribe en SQLite local (exactamente como E1)
  → App funciona 100% offline

Estado: Con cuenta (recién registrado desde la app)
  → SyncService.migrate() envía todos los datos locales al servidor
  → Servidor crea cuenta + importa tareas/pasos
  → App guarda mapeo de IDs locales → server UUIDs
  → A partir de ahí, SyncService opera en modo normal

Estado: Con cuenta (sesión iniciada)
  → Al crear/modificar: escribe local + marca dirty + encola push
  → Al abrir app: SyncService.pull() trae cambios remotos
  → Al cerrar app o periódicamente: SyncService.push() envía dirty
  → Si no hay conexión: opera offline, datos se sincronizan después
```

## Testing Decisions

- Buenos tests verifican comportamiento externo: un endpoint retorna el status code y body correctos, un push de sync almacena datos en el servidor, una request sin token recibe 401.
- Testear en la capa de API: usar supertest para pegarle a Express con una base de prueba (SQLite via Prisma o mock).
- No testear Prisma — confiar en el ORM.
- Del lado app: testear SyncService mockeando ApiClient. Verificar que la DB local se actualiza correctamente después de un pull y que los registros dirty se incluyen en un push.

Módulos a testear:
- `backend/src/routes/auth.test.ts` — register, login, me, credenciales inválidas
- `backend/src/routes/tasks.test.ts` — CRUD con auth middleware
- `backend/src/routes/steps.test.ts` — CRUD scopeado por tarea
- `backend/src/routes/sync.test.ts` — push crea/actualiza, pull retorna cambios, migrate importa todo
- `src/services/SyncService.test.ts` (app-side) — orquestación local con API mockeada

## Out of Scope

- Notificaciones push (Firebase FCM) — planificado para E3
- Refresh tokens / token rotation — JWT de 30 días alcanza
- Rate limiting — no crítico para demo
- Paginación — volumen de datos académico no lo requiere
- WebSockets — sync pull/push al abrir la app es suficiente
- Roles de usuario — todos son regulares
- Dashboard web — solo app mobile

## Further Notes

- Backend hosteado en Railway (tier gratuito). URL base como env var en la app.
- PostgreSQL provisionado desde Railway dashboard. Prisma Migrate corre en deploy.
- Puerto via `PORT` env var (default 3000).
- `JWT_SECRET` via env var, obligatorio y fail-closed: el servidor **no arranca** si falta o es un placeholder conocido (issue #65). En desarrollo hay que definir uno propio.
- Pantallas de Login, Register y SyncConflict tienen prototipos en `stitch_stepup_design_system/` — implementar en la app.
