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

### Schema — Prisma (PostgreSQL)

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          String   @id @default(uuid())
  userId      String
  name        String
  dueDate     String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  steps       Step[]
}

model Step {
  id           String   @id @default(uuid())
  taskId       String
  name         String
  durationMin  Int?
  orderIndex   Int
  status       String   @default("pending")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  completedAt  DateTime?
  task         Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

Se usan UUIDs como IDs del lado servidor para evitar colisiones con los IDs enteros autoincrementales de SQLite local.

### API Endpoints

```
POST   /api/auth/register    Body: { name, email, password }     → 201 { user, token }
POST   /api/auth/login       Body: { email, password }           → 200 { user, token }
GET    /api/auth/me          Header: Authorization: Bearer <jwt> → 200 { user }

GET    /api/tasks                                                → 200 Task[]
POST   /api/tasks            Body: { name, dueDate? }            → 201 Task
PUT    /api/tasks/:id        Body: { name?, dueDate? }           → 200 Task
DELETE /api/tasks/:id                                            → 204

GET    /api/tasks/:taskId/steps                                  → 200 Step[]
POST   /api/tasks/:taskId/steps Body: { name, durationMin? }     → 201 Step
PUT    /api/steps/:id        Body: { name?, durationMin? }       → 200 Step
DELETE /api/steps/:id                                            → 204

POST   /api/sync/push        Body: { tasks[], steps[] }          → 200 { tasks[], steps[] }
GET    /api/sync/pull?since={ISO timestamp}                      → 200 { tasks[], steps[] }
POST   /api/sync/migrate     Body: { tasks[], steps[], email, password, name }
                                                                 → 201 { user, token, taskMap }
```

**Auth middleware** en todas las rutas excepto `/api/auth/register` y `/api/auth/login`. Retorna 401 si el token falta o es inválido.

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

- Backend hosteado en Railway (tier gratuito). URL de producción: `https://stepup-backend-api-production.up.railway.app`. En la app se usa como `EXPO_PUBLIC_API_URL`.
- PostgreSQL provisionado desde Railway dashboard. Prisma Migrate corre en deploy (`startCommand: npx prisma migrate deploy && node dist/server.js`).
- Puerto via `PORT` env var (default 3000).
- `JWT_SECRET` via env var. En desarrollo, valor fijo.
- Pantallas de Login, Register y SyncConflict tienen prototipos en `stitch_stepup_design_system/` — implementar en la app.
