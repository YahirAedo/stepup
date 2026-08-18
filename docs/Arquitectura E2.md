**StepUp**

*Documento de Arquitectura — Entrega 2*

Iteración 2 | Julio–Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Julio 2026*

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

### Pantallas nuevas (7)

| Pantalla | Propósito |
| --- | --- |
| OnboardingScreen1 | "Un paso a la vez" — concepto de fragmentación de metas |
| OnboardingScreen2 | "Tu flujo comienza aquí" — llamado a crear primera tarea |
| NotificationPermissionScreen v1 | "Libera tu mente" — ripple ping animation |
| NotificationPermissionScreen v2 | "Mantén el ritmo" — calm wave animation |
| LoadingScreen | "Preparando tu espacio de calma" — spinner doble anillo |
| ProfileScreen | Avatar, duración default, toggle notificaciones |
| BadgesScreen | Galería de insignias desbloqueadas/bloqueadas |
| StepCompleteScreen | Celebración con check animado y confetti |
| LoginScreen | "Bienvenido de vuelta" — email + password |
| RegisterScreen | "Comienza tu camino" — nombre + email + password |
| SyncConflictScreen | Resolución de conflictos local vs servidor |

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
| ApiClient | Wrapper de fetch con JWT, manejo de errores 401 |
| AuthService | login, register, logout, isLoggedIn, getToken |
| SyncService | push (envía dirty records), pull (trae cambios remotos), migrate (sube datos al registrarse) |

## 4.3 Capa de Datos Local

### Cambios en SQLite respecto a E1

Tablas existentes con columnas agregadas:

**tasks** (columnas nuevas):
- `server_id TEXT` — UUID del servidor (nullable si no sincronizado)
- `dirty INTEGER DEFAULT 0` — 1 si hay cambios locales pendientes de sync
- `updated_at TEXT` — timestamp ISO para last-write-wins

**steps** (columnas nuevas):
- `server_id TEXT` — UUID del servidor
- `dirty INTEGER DEFAULT 0`
- `updated_at TEXT`

**Nueva tabla sync_meta:**
- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `key TEXT UNIQUE` — identificador del metadato
- `value TEXT` — valor (ej: last_sync_at, user_id, token)

## 4.4 Capa Remota (Backend)

### Proyecto backend/

```
backend/
├── src/
│   ├── index.ts              — Entry point, Express app
│   ├── routes/
│   │   ├── auth.ts           — POST /register, /login, GET /me
│   │   ├── tasks.ts          — CRUD /tasks
│   │   ├── steps.ts          — CRUD /tasks/:id/steps, /steps/:id
│   │   └── sync.ts           — POST /push, GET /pull, POST /migrate
│   ├── middleware/
│   │   └── auth.ts           — JWT verification
│   └── lib/
│       └── prisma.ts         — Prisma client singleton
├── prisma/
│   └── schema.prisma         — User, Task, Step
├── package.json
└── tsconfig.json
```

### Modelo de datos (Prisma)

User: id (uuid), name, email (unique), password (bcrypt), createdAt, tasks[]
Task: id (uuid), userId, name, dueDate?, status, createdAt, updatedAt, completedAt?, steps[]
Step: id (uuid), taskId, name, durationMin?, orderIndex, status, createdAt, updatedAt, completedAt?

### API Endpoints

```
POST   /api/auth/register     → 201 { user, token }
POST   /api/auth/login        → 200 { user, token }
GET    /api/auth/me           → 200 { user }

GET    /api/tasks             → 200 Task[]
POST   /api/tasks             → 201 Task
PUT    /api/tasks/:id         → 200 Task
DELETE /api/tasks/:id         → 204

GET    /api/tasks/:id/steps   → 200 Step[]
POST   /api/tasks/:id/steps   → 201 Step
PUT    /api/steps/:id         → 200 Step
DELETE /api/steps/:id         → 204

POST   /api/sync/push         → 200 { tasks, steps }
GET    /api/sync/pull?since=  → 200 { tasks, steps }
POST   /api/sync/migrate      → 201 { user, token, taskMap }
```

# 5. Flujo de Sincronización

## 5.1 Sin cuenta (offline puro)

La app funciona exactamente como E1. Todo se escribe en SQLite local. No hay llamadas de red, no hay autenticación. El usuario puede crear, editar y completar tareas y pasos sin restricciones.

## 5.2 Al registrarse (migración)

1. El usuario completa el formulario de registro (nombre, email, contraseña)
2. AuthService.register() envía credenciales + SyncService.migrate() envía datos locales
3. El backend crea la cuenta, importa todas las tareas y pasos, asigna UUIDs
4. El backend retorna { user, token, taskMap: { localId: serverId } }
5. La app guarda el token, actualiza server_id en cada registro local según taskMap
6. A partir de este punto, la app opera en modo sync

## 5.3 Con cuenta (sync activo)

**Al abrir la app:**
1. SyncService.pull() pide cambios desde lastSyncAt
2. Aplica inserts y updates a SQLite local
3. Actualiza lastSyncAt

**Al crear o modificar datos:**
1. Se escribe en SQLite local con dirty=1
2. SyncService.push() encola el envío

**Al cerrar la app o periódicamente:**
1. SyncService.push() envía todos los registros dirty
2. Servidor upserts y retorna los server_ids actualizados
3. App limpia dirty=0 y actualiza server_ids

**Resolución de conflictos:** last-write-wins. Si el mismo registro fue modificado en ambos lados con timestamps cercanos, se muestra SyncConflictScreen para resolución manual.

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

(Ver documento completo en `docs/Log Decisiones Tecnicas E2.md`)

| ID | Decisión | Estado |
| --- | --- | --- |
| DT-09 | Backend: Node.js + Express + Prisma + PostgreSQL | Confirmada |
| DT-10 | Autenticación JWT con registro/login | Confirmada |
| DT-11 | Sync offline-first híbrido (sin cuenta→local, con cuenta→backend) | Confirmada |
| DT-12 | Conflictos: last-write-wins | Confirmada |
| DT-13 | Diseño visual: Sistema Zenith Vitality | En curso |
| DT-14 | Fuentes: Manrope + Plus Jakarta Sans vía @expo-google-fonts | En curso |
| DT-15 | Navegación: GlassTabBar flotante | En curso |

# 8. Evolución hacia la Entrega 3

| Cambio en E3 | Estrategia de migración |
| --- | --- |
| Notificaciones push (FCM) | Nuevo NotificationService. No afecta lógica existente. |
| Sugerencia de pasos con IA | Nuevo AIService, opcional en StepFormScreen. |
| Dashboard y estadísticas | Nuevas pantallas que consumen datos existentes. |
| Widget Android | Nuevo módulo nativo, fuera de Expo Go. |

*StepUp — Arquitectura E2 — Versión 1.0 — Julio 2026*

*Ingeniería en Sistemas de Información*
