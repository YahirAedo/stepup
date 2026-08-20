**StepUp**

*Documento de Arquitectura — Entrega 2*

Iteración 2 | Julio–Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.1 | Agosto 2026*

> **Nota de versión (1.1):** actualiza la spec de Julio contra la **implementación
> real** (18/08/2026): endpoints finales (PATCH, `/complete`, `/reorder`,
> `/progress`), 5 modelos Prisma, estructura backend definitiva, 16 pantallas y
> el estado confirmado de las decisiones DT-13 a DT-22.

# 1. Introducción

## 1.1 Propósito del documento

Este documento describe el diseño arquitectónico de la Entrega 2 (E2) de StepUp. Actualiza el documento de Arquitectura E1 agregando las nuevas capas, componentes y decisiones correspondientes a la migración visual y la incorporación del backend.

## 1.2 Contexto de la iteración

**Período:** Julio – Agosto 2026 (entrega 18 de Agosto).

**E1 completada:** App mobile funcional con ciclo completo offline (CRUD de tareas, pasos, timer, historial).

**E2 agrega dos tracks:**
- Migración visual completa al sistema de diseño Zenith Vitality
- Backend Node.js + Express + Prisma + PostgreSQL con autenticación y sync offline-first

# 2. Visión General de la Arquitectura

StepUp E2 extiende la arquitectura en 3 capas de E1 a 4 capas, agregando la capa remota.

```
┌─────────────────────────────────────┐
│  Capa de Presentación (React Native)│
│  - Pantallas rediseñadas (13)       │
│  - Componentes reutilizables        │
│  - GlassTabBar                      │
└──────────────┬──────────────────────┘
               │ llama a
┌──────────────▼──────────────────────┐
│  Capa de Lógica de Negocio (App)    │
│  - Services (TaskService, etc.)     │
│  - SyncService (nuevo)              │
│  - AuthService (nuevo)              │
│  - ApiClient (nuevo)                │
└──────┬───────────────────┬──────────┘
       │ offline           │ online
┌──────▼──────────┐ ┌──────▼──────────────┐
│ Capa de Datos   │ │ Capa Remota (E2)    │
│ Local (SQLite)  │ │ - API REST Express  │
│ - tasks, steps  │ │ - Prisma ORM        │
│ - daily_progress│ │ - PostgreSQL        │
│ - sync_meta (nuevo)│ │ - JWT Auth         │
└─────────────────┘ └─────────────────────┘
```

**Capas:**

1. **Presentación:** pantallas y componentes React Native con diseño Zenith Vitality. Gestiona la interacción del usuario.
2. **Lógica de negocio (app):** servicios TypeScript con reglas del dominio. Se agregan SyncService, AuthService y ApiClient para operaciones online.
3. **Datos locales:** SQLite mediante expo-sqlite. Se agregan columnas server_id, dirty y updated_at para sync.
4. **Capa remota (nueva):** API REST en Node.js + Express + Prisma + PostgreSQL hosteada en Railway. URL de producción: `https://stepup-backend-api-production.up.railway.app`.

# 3. Stack Tecnológico

| Tecnología | Rol | Justificación |
| --- | --- | --- |
| React Native + Expo SDK 54 | Framework mobile | Misma base que E1. SDK 54 por compatibilidad con Expo Go. |
| TypeScript | Lenguaje | Tipado estático en toda la codebase. |
| expo-sqlite | Base de datos local | Persistencia offline. Misma que E1. |
| React Navigation | Navegación | GlassTabBar + stacks anidados. |
| Node.js + Express | Backend runtime | Entorno conocido por el equipo (JavaScript/TypeScript). |
| Prisma | ORM | Genera tipos automáticos, migraciones simples, type-safe. |
| PostgreSQL | Base de datos remota | Relacional, bien soportada por Prisma y Railway. |
| Railway | Hosting | Tier gratuito, deploy desde GitHub, PostgreSQL integrado. |
| JWT (jsonwebtoken + bcrypt) | Autenticación | Sin estado, 30 días de expiración. |
| GitHub | Control de versiones | Branching: main / develop / feature/*. |

# 4. Componentes del Sistema

## 4.1 Pantallas (Capa de Presentación)

### Pantallas existentes rediseñadas (6)

| Pantalla | Cambio respecto a E1 |
| --- | --- |
| FocusScreen | Nuevo diseño con TimerWidget glassmorpho, anillos breathing, contadores |
| TaskListScreen | Bento grid con tarjeta destacada, mini-tarjetas, gráfico semanal |
| TaskDetailScreen | Hero con metadata, checkboxes animados, botón flotante "Comenzar ahora" |
| TaskFormScreen | Glass card para pasos, validación visual, borde inferior en inputs |
| StepFormScreen | Pills de duración, drag-and-drop, glass card |
| HistoryScreen | Gráfico de línea bezier, logros XP, racha, tarjeta de hito |

### Pantallas nuevas (10)

| Pantalla | Propósito | Estado |
| --- | --- | --- |
| OnboardingScreen1 | "Un paso a la vez" — concepto de fragmentación de metas | Implementada |
| OnboardingScreen2 | "Tu flujo comienza aquí" — llamado a crear primera tarea | Implementada |
| NotificationPermissionScreen | "Libera tu mente" — permiso de notificaciones v1 (ripple ping) | Implementada |
| LoadingScreen | Splash/loading animado al arranque (splash nativo + spinner) | Implementada |
| ProfileScreen | Avatar, duración default, logout, acceso a conflictos | Implementada |
| BadgesScreen | Galería de insignias desbloqueadas/bloqueadas | Implementada |
| StepCompleteScreen | Celebración con check animado y confetti | Implementada (screen registrada en el stack de Tareas; sin wiring actual — el completado avanza inline al siguiente paso. Se prevé cablearla en E3, slice 8) |
| LoginScreen | "Bienvenido de vuelta" — email + password | Implementada |
| RegisterScreen | "Comienza tu camino" — nombre + email + password | Implementada |
| SyncConflictScreen | Resolución de conflictos local vs servidor | Implementada (issue #14 quedó en E3 para su revisión) |

## 4.2 Servicios (Capa de Lógica de Negocio)

### Servicios existentes (sin cambios funcionales)

| Servicio | Responsabilidad |
| --- | --- |
| TaskService | CRUD de tareas, completar tarea |
| StepService | CRUD de pasos, reordenar, completar paso con avance automático |
| TimerService | Cuenta regresiva/progresiva, alerta al vencer |
| ProgressService | Contador diario de pasos |

### Servicios nuevos (E2)

| Servicio | Responsabilidad |
| --- | --- |
| api.ts (`apiFetch`) | Wrapper de fetch: adjunta JWT e `Idempotency-Key`, maneja 401 (logout global), lanza `ApiError(status, message)` |
| session.ts | Persistencia de sesión (save/load/clear/has), usuario actual |
| AuthService | login, register, logout, isLoggedIn, getUser |
| SyncService | push (envía dirty records), pull (trae cambios desde lastSyncAt), migrate (sube datos al registrarse), getConflicts, resolveConflict (local/server) |
| syncLifecycle.ts | Orquesta sync automático al abrir y cerrar la app (RFN-08) |
| idempotency.ts | Generación de claves idempotentes client-side |
| dateFormat.ts | Helpers ISO `YYYY-MM-DD` + display (web y native) |

## 4.3 Capa de Datos Local

### Cambios en SQLite respecto a E1 (schema real, 4 migraciones)

**V1 — base E1** (sin cambios): tasks, steps, daily_progress.

**V2 — sync offline-first** (`OFFLINE_SYNC_V2`):
- `tasks` + `server_id TEXT`, `dirty INTEGER DEFAULT 0`, `updated_at TEXT`
- `steps` + `server_id TEXT`, `dirty INTEGER DEFAULT 0`, `updated_at TEXT`
- Nueva tabla `sync_meta` (single row, `id INTEGER CHECK (id = 1)`): `last_sync_at TEXT`

**V3 — conflictos** (`CONFLICTS_V3`):
- Nueva tabla `sync_conflicts`: `table_name`, `local_id`, `server_id`, `local_payload`, `server_payload`, `created_at`, `UNIQUE (table_name, local_id)`

**V4 — aislamiento por usuario** (`OWNER_USER_V4`):
- `sync_meta` + `owner_user_id TEXT` — identifica a qué cuenta pertenecen los datos locales; se limpia al login/logout para no migrar datos ajenos (PR #114)

## 4.4 Capa Remota (Backend)

### Proyecto backend/ (estructura real)

```
backend/
├── src/
│   ├── server.ts              — entry point (dotenv, fail-closed env, listen PORT)
│   ├── app.ts                 — Express app: cors, json, /health + /api/health, rutas, errorHandler
│   ├── config/
│   │   ├── env.ts             — JWT fail-closed (no arranca sin secret seguro)
│   │   └── prisma.ts          — Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts            — requireAuth (JWT verification)
│   │   ├── idempotency.ts     — requireIdempotencyKey (UUID o 400)
│   │   └── error-handler.ts   — errores JSON (sin HTML de Express)
│   ├── routes/                — auth / task / step / sync / progress .routes.ts
│   ├── controllers/           — capa HTTP (status codes, error mapping)
│   ├── services/              — lógica de negocio (register, push, completeStep, …)
│   ├── repositories/          — acceso a datos Prisma
│   ├── utils/                 — handle-error, jwt, schemas (zod)
│   └── tests/                 — 10 suites (94 casos)
├── prisma/
│   ├── schema.prisma          — User, Task, Step, DailyProgress, IdempotencyKey
│   └── migrations/            — 4 migraciones
├── docker-compose.yml         — Postgres local de desarrollo (stepup-postgres)
├── railway.json               — deploy Nixpacks (migrate deploy + start)
└── package.json
```

### Modelo de datos (Prisma — 5 modelos)

- **User**: id (uuid), name, email (unique), password (bcrypt), createdAt, relations
- **Task**: id (uuid), userId, name, dueDate?, status (active|completed), createdAt, updatedAt, completedAt?, steps[]
- **Step**: id (uuid), taskId, name, durationMin?, orderIndex, status (pending|completed), createdAt, updatedAt, completedAt?
- **DailyProgress**: userId, date (YYYY-MM-DD), stepsCompleted — `@@unique([userId, date])`
- **IdempotencyKey**: userId, key, requestHash, method, path, statusCode, responseBody, expiresAt — `@@unique([userId, key])`

Índices para reads de sync: `@@index([userId, updatedAt])` en Task; `@@index([taskId, orderIndex|status|updatedAt])` en Step.

### API Endpoints (final)

```
POST   /api/auth/register    Body: { name, email, password }     → 201 { user, token }
POST   /api/auth/login       Body: { email, password }           → 200 { user, token }
GET    /api/auth/me          Header: Bearer <jwt>                → 200 { user }

GET    /api/tasks                                                → 200 Task[]
GET    /api/tasks/completed                                      → 200 Task[]
GET    /api/tasks/:id                                            → 200 Task
POST   /api/tasks            Body: { name, dueDate? }            → 201 Task
PUT    /api/tasks/:id        Body: { name?, dueDate? }           → 200 Task
PATCH  /api/tasks/:id/complete                                   → 200 Task
DELETE /api/tasks/:id                                            → 204
GET    /api/tasks/:taskId/steps                                  → 200 Step[]
POST   /api/tasks/:taskId/steps                                  → 201 Step

GET    /api/steps            (alias, ?taskId=)                   → 200 Step[]
POST   /api/steps            Body: { taskId, name, durationMin?, orderIndex? } → 201
PUT    /api/steps/:id                                            → 200 Step
PATCH  /api/steps/:id/complete                                   → 200 { nextStep, taskCompleted }
PUT    /api/steps/reorder    Body: { taskId, orderedIds[] }      → 200 { ok }
DELETE /api/steps/:id                                            → 204

POST   /api/sync/push        Body: { tasks[], steps[] }          → 200 { tasks[], steps[] }
GET    /api/sync/pull?since={ISO}                                → 200 { tasks[], steps[] }
POST   /api/sync/migrate     Body: { tasks[], steps[], email, password, name } → 201 { user, token, taskMap, stepMap }

GET    /api/progress                                             → 200
```

**Protección:** JWT (`requireAuth`) en todas las rutas salvo `register`, `login`,
`migrate` y `health`. `Idempotency-Key` obligatoria en writes (POST/PUT/PATCH) —
replay byte-idéntico o 409 si el payload cambió (issue #67). Error middleware
global (issue #76).

# 5. Flujo de Sincronización

## 5.1 Sin cuenta (offline puro)

La app funciona exactamente como E1. Todo se escribe en SQLite local. No hay llamadas de red, no hay autenticación. El usuario puede crear, editar y completar tareas y pasos sin restricciones.

## 5.2 Al registrarse (migración)

1. El usuario completa el formulario de registro (nombre, email, contraseña)
2. `SyncService.migrate()` envía credenciales + el dataset local completo a `/api/sync/migrate`
3. El backend crea la cuenta, importa todas las tareas y pasos, asigna UUIDs
4. El backend retorna `{ user, token, taskMap, stepMap }` (mapeo localId → server UUID)
5. La app guarda la sesión, registra `owner_user_id` en `sync_meta` y actualiza `server_id` en cada registro según los mapas
6. A partir de este punto, la app opera en modo sync

> Si la DB local ya pertenece a otra cuenta (`owner_user_id` distinto), se limpia
> antes de migrar para no subir datos ajenos (PR #114).

## 5.3 Con cuenta (sync activo)

**Al abrir la app:** `syncLifecycle` → `pull()` desde `last_sync_at`, aplica inserts/updates y actualiza el marcador.

**Al crear o modificar datos:** se escribe en SQLite local con `dirty=1` (la app es local-first; el servidor es destino de sync).

**Al abrir/cerrar la app:** `syncLifecycle` → `push()` envía los registros dirty; el servidor hace upsert idempotente (misma `Idempotency-Key` por operación) y responde los `server_id` asignados.

**Resolución de conflictos:** last-write-wins con umbral de 1 minuto. Si un registro se modificó en ambos lados con timestamps cercanos, se persiste en `sync_conflicts` y se muestra en `SyncConflictScreen` (accesible desde Perfil) para elegir local o servidor.

# 6. Sistema de Diseño Zenith Vitality

(Ver documento completo en `stitch_stepup_design_system/zenith_vitality/DESIGN.md`)

**Principios:**
- Minimalismo funcional con acentos glassmorphos
- Calma, claridad e intencionalidad
- Grilla fluida basada en 4px

**Paleta de colores:**
- Surface: #fafaf3 (fondo papel cálido)
- Primary (verde #2D4F1E): logros, acciones principales
- Secondary (naranja #9D430A): tareas activas, urgencia
- Tertiary (azul #002F64): enfoque, timer

**Tipografía:**
- Manrope 800/700 para títulos (display, headlines)
- Plus Jakarta Sans 400/600/700 para cuerpo y etiquetas

**Componentes clave:**
- GlassTabBar: navegación inferior flotante con blur
- TimerWidget: círculo glassmorpho con anillos breathing
- Bento grid: tarjetas de distintos tamaños para task list
- StepItem: checkbox animado con 3 estados
- ProgressRing: anillo SVG para insignias

# 7. Decisiones Arquitectónicas (nuevas en E2)

(Ver documento completo en `docs/Log Decisiones Tecnicas E2.md` — DT-09 a DT-22)

| ID | Decisión | Estado |
| --- | --- | --- |
| DT-09 | Backend: Node.js + Express + Prisma + PostgreSQL | Confirmada |
| DT-10 | Autenticación JWT con registro/login | Confirmada |
| DT-11 | Sync offline-first híbrido (sin cuenta→local, con cuenta→backend) | Confirmada |
| DT-12 | Conflictos: last-write-wins | Confirmada |
| DT-13 | Diseño visual: Sistema Zenith Vitality | Confirmada |
| DT-14 | Fuentes: Manrope + Plus Jakarta Sans vía @expo-google-fonts | Confirmada |
| DT-15 | Navegación: GlassTabBar flotante | Confirmada |
| DT-16 | Rama `develop2` transitoria (unificada y eliminada 18/08) | Confirmada |
| DT-17 | JWT fail-closed (no arranca sin secret seguro) | Confirmada |
| DT-18 | Contrato de password 8–72 bytes + email trim | Confirmada |
| DT-19 | Validación ISO real de fechas | Confirmada |
| DT-20 | Idempotencia por `Idempotency-Key` en writes | Server ✅ / cliente pendiente (#124) |
| DT-21 | `completeStep` transaccional | Confirmada |
| DT-22 | GitHub: protección de ramas, Dependabot, milestones, releases | Confirmada |

# 8. Evolución hacia la Entrega 3

| Cambio en E3 | Estrategia de migración |
| --- | --- |
| Notificaciones push (FCM) | Nuevo NotificationService. No afecta lógica existente. |
| Sugerencia de pasos con IA | Nuevo AIService, opcional en StepFormScreen. |
| Dashboard y estadísticas | Nuevas pantallas que consumen datos existentes. |
| Widget Android | Nuevo módulo nativo, fuera de Expo Go. |

*StepUp — Arquitectura E2 — Versión 1.0 — Julio 2026*

*Ingeniería en Sistemas de Información*
