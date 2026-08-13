# Flujo Lógico: Crear Tarea en Backend (Ejecutándose en Local)

> **Documento:** Flujo completo de `POST /api/tasks` desde la app móvil hasta el guardado en SQLite/PostgreSQL
> **Proyecto:** StepUp — Entrega 2 (E2)
> **Estado:** B3 completado — 58/58 tests passing

---

## 1. Resumen Ejecutivo

Este documento describe el flujo completo y paso a paso cuando la app móvil crea una nueva tarea, ejecutando el backend en modo desarrollo local (`http://localhost:3000`). El flujo considera tanto el modo offline (sin cuenta) como el modo online (con cuenta JWT).

**Endpoint:** `POST http://localhost:3000/api/tasks`
**Body:** `{ "name": "Estudiar para el parcial", "dueDate": "2026-12-15" }`
**Auth:** `Authorization: Bearer <jwt_token>` (puede ser omitted en modo offline)

---

## 2. Flujo Completo Paso a Paso

### Paso 1: Petición desde la app móvil

La app envía una petición `fetch` o `axios` al servidor Express:

```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body: {
  "name": "Estudiar para el parcial",
  "dueDate": "2026-12-15"
}
```

**Modo offline:** Si el usuario no tiene cuenta, el token puede omitirse o ser un token "sistema" que permita operaciones locales-only.

---

### Paso 2: Middleware de Autenticación (`middleware/auth.ts`)

Antes que el controlador, la petición pasa por el middleware de auth:

```typescript
// Extrae token del header Authorization
// Verifica firma con JWT_SECRET
// Decodifica payload → obtiene userId
// Adjunta req.userId a la petición
// Si token inválido/missing → retorna 401
```

**Dos flujos posibles:**

| Modo | Qué sucede |
|---|---|
| **Con cuenta (online)** | JWT válido → `req.userId` queda adjunto → tarea asociada al usuario |
| **Sin cuenta (offline)** | No hay token o token inválido → si el route está públicamente desprotegido, sigue; si está protegido, retorna 401 y el modo offline no está disponible |

*En B3, las routes de tasks requieren auth middleware, por lo que el usuario debe estar logueado para crear tareas online.*

---

### Paso 3: TaskController.create (`controllers/task.controller.ts:46-53`)

Express direcciona a este método luego de auth:

```typescript
create = async (req: Request, res: Response) => {
  try {
    const task = await this.taskService.createTask(req.userId!, req.body);
    return res.status(201).json(task);
  } catch (error) {
    return handleError(res, error);
  }
};
```

**Qué hace:**
1. Obtiene `req.userId` del middleware auth (usuario logueado)
2. Llama a `taskService.createTask(userId, body)`
3. Retorna **201** con el task creado en JSON

---

### Paso 4: TaskService.createTask (`services/task.service.ts`)

Aquí ocurre la lógica principal. El servicio:

```typescript
createTask(userId: string, body: CreateTaskInput) {
  // 1. Escribir en SQLite local
  const localTask = db.task.create({
    data: {
      name: body.name,
      userId,
      status: "active",
      dirty: 1,                      // ← Marca cambio pendiente de sync
      updated_at: new Date().toISOString(),
      dueDate: body.dueDate,         // ← Opcional
    }
  });
  
  // 2. Si usuario tiene token → encolar push sync
  if (hasValidToken()) {
    apiClient.post('/api/sync/push', { 
      tasks: [localTask] 
    });
  }
  
  // 3. Retornar task creada
  return localTask;
}
```

**Operaciones en SQLite local:** La tabla `tasks` tiene estas columnas (agregadas en E2 respecto a E1):

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | TEXT (UUID) | ID del servidor / auto-generado |
| `name` | TEXT | Nombre de la tarea |
| `userId` | TEXT | FK al usuario dueño |
| `status` | TEXT | `'active' | 'completed'` |
| `dueDate` | TEXT (ISO 8601) | Fecha límite opcional |
| `created_at` | TEXT | Timestamp creación |
| `updated_at` | TEXT | Timestamp última actualización |
| `server_id` | UUID | UUID del servidor (nullable hasta primer sync) |
| `dirty` | INTEGER | `1` = hay cambios pendientes, `0` = sincronizado |

---

### Paso 5: Respuesta exitosa a la app

La app móvil recibe:

```json
{
  "id": "uuid-generado-por-sqlite-o-prisma",
  "userId": "uuid-del-usuario",
  "name": "Estudiar para el parcial",
  "dueDate": "2026-12-15",
  "status": "active",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z",
  "serverId": null,          // ← Null hasta primera sincronización
  "dirty": 1,               // ← Siempre 1 recién creado
  "completedAt": null
}
```

**Interfaz TypeScript típica** (desde `src/types/index.ts`):
```typescript
interface Task {
  id: string;
  name: string;
  userId: string;
  dueDate?: string;
  status: "active" | "completed";
  createdAt: string;
  updatedAt: string;
  serverId?: string;        // ← Null si nunca sync
  dirty?: number;           // ← 0 o 1
  completedAt?: string;
}
```

---

### Paso 6: Sincronización automática (si aplica)

Si el usuario tenía cuenta y token válido, después de crear la tarea localmente, el servicio auto-detecta conexión y ejecuta:

```
POST /api/sync/push
Body: { tasks: [{ id: "...", serverId: null, dirty: 1, ... }] }
```

**Flujo sync push:**
1. App envía tarea dirty al servidor
2. Backend (`sync.controller.ts`) upsert la tarea en PostgreSQL
3. Servidor retorna `{ tasks: [{ ..., serverId: "uuid-del-servidor" }] }`
4. App actualiza registro local: `serverId = "uuid-del-servidor"`, `dirty = 0`

Si no hay conexión: la tarea queda con `dirty = 1` y se sincronizará al reabrir la app.

---

## 3. Operaciones en Base de Datos

### Inserción en SQLite local (ejecutándose en tu computadora)

```sql
INSERT INTO tasks (
  id, name, userId, status, dueDate, 
  created_at, updated_at, server_id, dirty
) VALUES (
  'c2345678-1234-5678-90ab-cdef01234567',
  'Estudiar para el parcial',
  'user-8765-four321',
  'active',
  '2026-12-15',
  '2026-01-15T10:30:00Z',
  '2026-01-15T10:30:00Z',
  null,       -- server_id: null (nunca sincronizó)
  1           -- dirty: 1 (hay cambio pendiente)
);
```

### Verificación en la consola

```bash
# Desde la terminal, en el directorio backend:
sqlite3 ./prisma/dev/database.sqlite
sqlite> SELECT * FROM tasks WHERE name = 'Estudiar para el parcial';
```

---

## 4. Manejo de Errores

| Error | Código HTTP | Causa |
|---|---|---|
| **401 Unauthorized** | 401 | Token JWT inválido o ausente (route requiere auth) |
| **400 Bad Request** | 400 | Falta el campo `name` en el body |
| **500 Internal Error** | 500 | Fallo en conexión SQLite/Prisma |
| **409 Conflict** | 409 | Tarea con mismo nombre ya existe (validación opcional) |

**Formato de error respondido por `handleError`:**
```json
{
  "error": "Nombre del error",
  "message": "Descripción legible del error"
}
```

---

## 5. Resumen Visual del Flujo

```
App Móvil
  │
  ▼ POST /api/tasks {name, dueDate?} [Auth: Bearer <jwt>]
  │
  ├─► middleware/auth.ts
  │     │
  │     ├─► JWT VÁLIDO → req.userId adjunto → continuar
  │     │
  │     └─► JWT INVÁLIDO → 401 → Fin (modo offline si route público)
  │
  ├─► TaskController.create()
  │     │
  │     └─► TaskService.createTask(userId, body)
  │          │
  │          ├─► Escribe en SQLite local
  │          │   │
  │          │   └─► INSERT INTO tasks (name, userId, status='active', dirty=1, updated_at, dueDate)
  │          │
  │          ├─► Si hay token: encolar SyncService.push()
  │          │
  │          └─► Retornar 201 JSON → App muestra "Tarea creada"
  │
  └─► App actualiza UI: tarea nueva aparece en lista
```

---

## 6. Comandos de Verificación Local

Para confirmar que el flujo funciona en tu computadora:

```bash
# 1. Levantar backend
cd backend && npm run dev

# 2. Verificar que la tabla tasks existe con columnas E2
cd backend && sqlite3 prisma/dev/database.sqlite ".schema tasks"

# 3. Probar endpoint manualmente
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{"name":"Tarea de prueba"}'

# 4. Ejecutar tests del backend (todos deberían pasar)
cd backend && npm test  # 58/58 passing

# 5. Ver task creada en SQLite
sqlite3 prisma/dev/database.sqlite "SELECT * FROM tasks WHERE name = 'Tarea de prueba';"
```

---

## 7. Diferencias Modo Offline vs Online

| Aspecto | Modo Offline (Sin Cuenta) | Modo Online (Con Cuenta) |
|---|---|---|
| **Auth** | Opcional o token "sistema" | Obligatorio JWT válido |
| **Guardado local** | ✅ Siempre en SQLite | ✅ Siempre en SQLite |
| **server_id** | `null` (nunca se setea) | `null` inicialmente, luego UUID tras sync |
| **dirty** | `1` siempre | `1` al crear, `0` después de sync exitosa |
| **Sync push** | No aplica (no hay servidor) | ✅ Automático después de crear |
| **Acceso multi-dispositivo** | No posible (solo local) | ✅ Sí, por cuenta JWT |
| **Recuperar después de perder dispositivo** | No posible | ✅ Sí, datos en PostgreSQL |

---

*Documento generado para el proyecto StepUp — Flujo B3: Task CRUD API*
*Verificar: 58/58 tests OK en backend, 75/75 tests OK en app*