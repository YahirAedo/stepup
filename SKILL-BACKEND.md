# StepUp Backend — SKILL

> Cargar este skill antes de crear o modificar endpoints, servicios o lógica de negocio en el backend.
> Este skill complementa (no reemplaza) el design system Zenith Vitality del frontend.

---

## Arquitectura

```
backend/
├── src/
│   ├── app.ts              # Configuración Express, rutas, middleware
│   ├── server.ts           # Entry point (inicia servidor)
│   ├── config/
│   │   ├── env.ts          # Variables de entorno (JWT_SECRET)
│   │   └── prisma.ts       # Cliente Prisma + tipo Db
│   ├── controllers/        # Lógica de request/response
│   ├── services/           # Lógica de negocio
│   ├── repositories/       # Acceso a datos (Prisma queries)
│   ├── middleware/         # Auth, idempotencia, error handler
│   ├── routes/             # Definición de rutas
│   ├── validations/        # Schemas Zod
│   ├── utils/              # Utilidades (JWT, manejo de errores)
│   ├── types/              # Tipos TypeScript (Express Request)
│   └── tests/              # Tests Jest
├── prisma/
│   ├── schema.prisma       # Modelo de datos
│   └── migrations/         # Migraciones SQL
└── .env                    # Variables de entorno (NO commitear)
```

### Flujo de una request

```
HTTP Request
    │
    ▼
Express App (app.ts)
    │
    ├──► Middleware: cors, json parser
    │
    ├──► Middleware: requireAuth (si aplica)
    │       └──► Verifica JWT, setea req.userId
    │
    ├──► Middleware: requireIdempotencyKey (si aplica)
    │       └──► Valida UUID, setea req.idempotencyKey
    │
    ▼
Controller
    │
    ├──► Valida body con Zod schema
    │
    ├──► Llama Service
    │       │
    │       ├──► Lógica de negocio
    │       │
    │       └──► Llama Repository
    │               │
    │               └──► Prisma queries
    │
    ▼
HTTP Response (o error → errorHandler)
```

---

## Convenciones de código

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Controllers | PascalCase + Controller | `TaskController`, `SyncController` |
| Services | PascalCase + Service | `AuthService`, `TaskService` |
| Repositories | PascalCase + Repository | `TaskRepository`, `StepRepository` |
| Métodos | camelCase | `findById`, `createTask`, `push` |
| Variables | camelCase | `userId`, `taskName` |
| Constantes | UPPER_SNAKE_CASE | `JWT_SECRET`, `TOKEN_TTL` |
| Schemas Zod | camelCase + Schema | `createTaskSchema`, `registerSchema` |
| Errores | UPPER_SNAKE_CASE | `EMAIL_ALREADY_REGISTERED`, `TASK_NOT_FOUND` |

### Estructura de archivos

**Controller** (`src/controllers/task.controller.ts`):
```typescript
import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { handleError } from '../utils/handle-error';

export class TaskController {
  private taskService = new TaskService();

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.create(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
```

**Service** (`src/services/task.service.ts`):
```typescript
import { TaskRepository } from '../repositories/task.repository';
import { createTaskSchema } from '../validations/schemas';

export class TaskService {
  private taskRepo = new TaskRepository();

  async create(userId: string, input: unknown) {
    const data = createTaskSchema.parse(input);
    return this.taskRepo.create(userId, data);
  }
}
```

**Repository** (`src/repositories/task.repository.ts`):
```typescript
import { prisma, Db } from '../config/prisma';

export class TaskRepository {
  async create(userId: string, data: { name: string; dueDate?: Date | null }) {
    return prisma.task.create({
      data: { userId, name: data.name, dueDate: data.dueDate ?? null },
    });
  }
}
```

---

## Patrones de creación de endpoints

### Paso a paso: Crear un nuevo endpoint

1. **Definir schema de validación** en `src/validations/schemas.ts`:
```typescript
export const newEntitySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  // ... otros campos
});
```

2. **Crear método en Repository** (si es necesario):
```typescript
// src/repositories/newEntity.repository.ts
export class NewEntityRepository {
  async create(userId: string, data: {...}) {
    return prisma.newEntity.create({ data: { userId, ...data } });
  }
}
```

3. **Crear método en Service**:
```typescript
// src/services/newEntity.service.ts
export class NewEntityService {
  private repo = new NewEntityRepository();

  async create(userId: string, input: unknown) {
    const data = newEntitySchema.parse(input);
    // Lógica de negocio
    return this.repo.create(userId, data);
  }
}
```

4. **Crear método en Controller**:
```typescript
// src/controllers/newEntity.controller.ts
export class NewEntityController {
  private service = new NewEntityService();

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.service.create(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
```

5. **Crear ruta** en `src/routes/newEntity.routes.ts`:
```typescript
import { Router } from 'express';
import { NewEntityController } from '../controllers/newEntity.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const controller = new NewEntityController();

router.post('/', requireAuth, controller.create);
// GET, PUT, DELETE...

export const newEntityRoutes = router;
```

6. **Registrar en app.ts**:
```typescript
import { newEntityRoutes } from './routes/newEntity.routes';

app.use('/api/new-entities', requireAuth, newEntityRoutes);
```

7. **Agregar tests** en `src/tests/newEntity.test.ts`

---

## Sistema de Idempotencia

### Cuándo usar idempotencia

- **POST** que modifica estado (push, migrate)
- **PATCH/PUT** que actualiza recursos
- Operaciones que pueden reintentarse por timeout de red

### Cómo implementar

1. **Middleware** `requireIdempotencyKey`:
```typescript
// En la ruta
router.post('/push', requireAuth, requireIdempotencyKey, syncController.push);
```

2. **Service** usa `IdempotencyService.runIdempotent()`:
```typescript
async push(req: Request, res: Response) {
  const result = await this.idempotencyService.runIdempotent(
    {
      userId: req.userId!,
      key: req.idempotencyKey,
      method: 'POST',
      path: '/api/sync/push',
      body: req.body,
    },
    async () => {
      const payload = await this.syncService.push(req.userId!, req.body);
      return { statusCode: 200, responseBody: JSON.stringify(payload) };
    },
  );
  return res.status(result.statusCode).type('json').send(result.responseBody);
}
```

### Scope user para migrate

El endpoint `/api/sync/migrate` usa un "scope user" dedicado para idempotencia:
```typescript
const MIGRATE_IDEMPOTENCY_SCOPE = '00000000-0000-4000-8000-000000000002';

async function ensureMigrateScopeUser(): Promise<string> {
  await prisma.user.upsert({
    where: { email: 'idempotency-migrate@internal.stepup' },
    create: {
      id: MIGRATE_IDEMPOTENCY_SCOPE,
      name: 'Idempotency Scope',
      email: 'idempotency-migrate@internal.stepup',
      password: '!',
    },
    update: {},
  });
  return MIGRATE_IDEMPOTENCY_SCOPE;
}
```

Esto permite que migrate funcione sin autenticación (el usuario aún no existe).

---

## Manejo de errores

### Lanzar errores en Services

```typescript
// En el service
if (existingUser) {
  throw new Error('EMAIL_ALREADY_REGISTERED');
}

if (!task) {
  throw new Error('TASK_NOT_FOUND');
}
```

### Mapeo automático en handleError

El archivo `src/utils/handle-error.ts` mapea errores a respuestas HTTP:

| Error lanzado | Status HTTP | Mensaje |
|---------------|-------------|---------|
| `EMAIL_ALREADY_REGISTERED` | 409 | "El email ya está registrado" |
| `INVALID_CREDENTIALS` | 401 | "Credenciales inválidas" |
| `TASK_NOT_FOUND` | 404 | "La tarea especificada no existe" |
| `STEP_NOT_FOUND` | 404 | "El paso especificado no existe" |
| `CANNOT_COMPLETE_WITH_PENDING_STEPS` | 409 | "No se puede completar una tarea con pasos pendientes" |
| `RECORD_BELONGS_TO_OTHER_USER` | 409 | "El registro pertenece a otro usuario" |
| `INVALID_SINCE` | 400 | "El parámetro since no es una fecha válida" |
| `INVALID_REORDER` | 400 | "orderedIds debe ser una permutación exacta..." |
| ZodError | 400 | Primer mensaje de validación |
| Prisma P2002 (unique) | 409 | "El email ya está registrado" o "El registro ya existe" |
| Prisma P2025 (not found) | 404 | "Registro no encontrado" |
| IdempotencyConflictError | 409 | "Idempotency-Key reutilizada con payload distinto" |
| IdempotencyNotReadyError | 503 | "Idempotency-Key en proceso de resolución; reintente" |
| IdempotencyRecordMissingError | 503 | "Idempotency-Key no encontrada; reintente" |
| Otros | 500 | "Error interno del servidor" |

### Agregar nuevos errores

1. Lanzar `Error` con mensaje en UPPER_SNAKE_CASE:
```typescript
throw new Error('NEW_ERROR_CODE');
```

2. Agregar mapeo en `KNOWN_MESSAGES` (handle-error.ts):
```typescript
const KNOWN_MESSAGES: Record<string, { status: number; message: string }> = {
  // ... existentes
  NEW_ERROR_CODE: { status: 400, message: 'Mensaje amigable para el usuario' },
};
```

---

## Schema de Prisma

### Modelos

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")

  tasks           Task[]
  dailyProgress   DailyProgress[]
  idempotencyKeys IdempotencyKey[]

  @@map("users")
}

model Task {
  id          String     @id @default(uuid())
  userId      String     @map("user_id")
  name        String
  dueDate     DateTime?  @map("due_date")
  status      TaskStatus @default(active)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  completedAt DateTime?  @map("completed_at")

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  steps Step[]

  @@index([userId, updatedAt])
  @@map("tasks")
}

model Step {
  id          String     @id @default(uuid())
  taskId      String     @map("task_id")
  name        String
  durationMin Int?       @map("duration_min")
  orderIndex  Int        @map("order_index")
  status      StepStatus @default(pending)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  completedAt DateTime?  @map("completed_at")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId, orderIndex])
  @@index([taskId, status])
  @@index([taskId, updatedAt])
  @@map("steps")
}

model DailyProgress {
  id             Int    @id @default(autoincrement())
  userId         String @map("user_id")
  date           String
  stepsCompleted Int    @default(0) @map("steps_completed")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("daily_progress")
}

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

### Relaciones

```
User (1) ──< (N) Task (1) ──< (N) Step
  │
  ├──< (N) DailyProgress
  │
  └──< (N) IdempotencyKey
```

### Índices importantes

- `Task`: `[userId, updatedAt]` → queries de sync/pull
- `Step`: `[taskId, orderIndex]` → ordenar pasos
- `Step`: `[taskId, status]` → contar pasos pendientes
- `Step`: `[taskId, updatedAt]` → sync/pull de steps
- `IdempotencyKey`: `[userId, key]` → lookup de idempotencia
- `IdempotencyKey`: `[expiresAt]` → cleanup de keys expiradas

---

## Endpoints existentes

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Crear usuario + token |
| POST | `/login` | No | Login + token |
| GET | `/me` | Sí | Obtener usuario actual |

### Tasks (`/api/tasks`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Listar tareas activas |
| GET | `/completed` | Sí | Listar tareas completadas |
| POST | `/` | Sí | Crear tarea |
| GET | `/:id` | Sí | Obtener detalle |
| PUT | `/:id` | Sí | Actualizar tarea |
| DELETE | `/:id` | Sí | Eliminar tarea |
| PATCH | `/:id/complete` | Sí | Completar tarea |

### Steps (`/api/steps`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/tasks/:taskId/steps` | Sí | Crear paso |
| PUT | `/:id` | Sí | Actualizar paso |
| DELETE | `/:id` | Sí | Eliminar paso |
| PATCH | `/:id/complete` | Sí | Completar paso |
| POST | `/reorder` | Sí | Reordenar pasos |

### Sync (`/api/sync`)

| Método | Ruta | Auth | Idempotencia | Descripción |
|--------|------|------|--------------|-------------|
| POST | `/push` | Sí | Sí | Push cambios offline |
| GET | `/pull` | Sí | No | Pull cambios desde servidor |
| POST | `/migrate` | No | Sí | Migrar datos al registrarse |

### Progress (`/api/progress`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Obtener progreso diario |

---

## Tests

### Setup

```typescript
// src/tests/helpers.ts
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

export const app = createApp();

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE idempotency_keys, steps, tasks, daily_progress, users RESTART IDENTITY CASCADE'
  );
}

export async function registerUser(
  name = 'Test User',
  email = 'test@stepup.app',
  password = 'secret123'
) {
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  expect(res.status).toBe(201);
  return res.body as { user: { id: string; name: string; email: string }; token: string };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
```

### Patrón de test

```typescript
import request from 'supertest';
import { app, resetDb, registerUser, authHeader } from './helpers';

describe('POST /api/tasks', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('crea una tarea con datos válidos', async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({ name: 'Nueva tarea' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Nueva tarea');
  });

  it('rechaza sin autenticación (401)', async () => {
    const res = await request(app).post('/api/tasks').send({ name: 'Sin auth' });
    expect(res.status).toBe(401);
  });

  it('rechaza con datos inválidos (400)', async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({ name: '' }); // vacío

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El nombre es obligatorio');
  });
});
```

### Comandos

```bash
# Correr todos los tests
npm test

# Correr un archivo específico
npm test -- auth.test.ts

# Correr con cobertura
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Variables de entorno

### `.env.example`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stepup_db"
JWT_SECRET="cambiar-por-valor-seguro-en-produccion"
NODE_ENV="development"
PORT=3000
```

### Validación de JWT_SECRET

El archivo `src/config/env.ts` valida que `JWT_SECRET` no sea un valor inseguro:

```typescript
const UNSAFE_JWT_SECRETS = new Set([
  '',
  'dev-secret-stepup',
  'cambiar-en-produccion',
  'secret',
  'jwt_secret',
  'JWT_SECRET',
]);

export const JWT_SECRET = resolveJwtSecret(process.env.JWT_SECRET, process.env.NODE_ENV);
```

En producción, si `JWT_SECRET` es uno de estos valores, la app lanza error al iniciar.

---

## Anti-patterns

### ❌ Lo que NO se hace

1. **Queries directas desde controllers**:
```typescript
// ❌ MAL
export class TaskController {
  create = async (req: Request, res: Response) => {
    const task = await prisma.task.create({ data: req.body });
    res.status(201).json(task);
  };
}

// ✅ BIEN
export class TaskController {
  private taskService = new TaskService();

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.create(req.userId!, req.body);
      res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
```

2. **Bypassar validaciones Zod**:
```typescript
// ❌ MAL
const data = req.body;
const task = await prisma.task.create({ data });

// ✅ BIEN
const data = createTaskSchema.parse(req.body);
const task = await prisma.task.create({ data });
```

3. **Hardcodear mensajes de error en controllers**:
```typescript
// ❌ MAL
if (!task) {
  return res.status(404).json({ message: 'Tarea no encontrada' });
}

// ✅ BIEN
if (!task) {
  throw new Error('TASK_NOT_FOUND');
}
```

4. **No usar transacciones para operaciones multi-entidad**:
```typescript
// ❌ MAL (si falla el step, la tarea ya se creó)
const task = await prisma.task.create({ data: taskData });
const step = await prisma.step.create({ data: stepData });

// ✅ BIEN
await prisma.$transaction(async (tx) => {
  const task = await tx.task.create({ data: taskData });
  const step = await tx.step.create({ data: stepData });
});
```

5. **Olvidar `requireAuth` en rutas protegidas**:
```typescript
// ❌ MAL
router.post('/tasks', controller.create);

// ✅ BIEN
router.post('/tasks', requireAuth, controller.create);
```

6. **No usar `handleError` en controllers**:
```typescript
// ❌ MAL
try {
  // ...
} catch (error) {
  res.status(500).json({ message: 'Error interno' });
}

// ✅ BIEN
try {
  // ...
} catch (error) {
  return handleError(res, error);
}
```

7. **Commitear `.env`**:
```bash
# ❌ MAL
git add .env

# ✅ BIEN
git add .env.example
```

---

## Checklist pre-merge para backend

- [ ] Nuevos endpoints tienen validación Zod
- [ ] Rutas protegidas usan `requireAuth`
- [ ] Operaciones que modifican estado usan `handleError`
- [ ] Transacciones para operaciones multi-entidad
- [ ] Tests cubren happy path + edge cases
- [ ] Nuevos errores están mapeados en `KNOWN_MESSAGES`
- [ ] No se commitea `.env`
- [ ] Migraciones de Prisma están aplicadas
- [ ] `npm test` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run typecheck` pasa sin errores

---

## Recursos útiles

- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com/
- **Zod Docs**: https://zod.dev/
- **JWT.io**: https://jwt.io/
- **Jest Docs**: https://jestjs.io/
