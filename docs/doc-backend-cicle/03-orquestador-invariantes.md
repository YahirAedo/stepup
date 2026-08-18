# 03 — El Orquestador y los Invariantes de Negocio (Capa de Servicios)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `feature/backend-express-prisma-postgres`

---

## 1. El corazón de StepUp

Este documento detalla la **capa de servicios** del backend, donde vive la
verdadera lógica de negocio: el invariante de tareas, el flujo de completar un
paso y la actualización idempotente de métricas diarias. El argumento central:
**el servidor es la fuente de verdad** y rechaza operaciones ilegales con
códigos HTTP estándar, inmune a las fallas o manipulaciones del cliente móvil.

---

## 2. Arquitectura en capas y flujo de una petición

```
HTTP Request
   │
   ▼
Routes (definen el contrato: /api/tasks, /api/steps, /api/progress)
   │
   ▼
Controller (parámetros + status codes + traduce errores)
   │
   ▼
Service  ◄── REGLAS DE NEGOCIO (este documento)
   │
   ▼
Repository (acceso a datos con Prisma)
   │
   ▼
PostgreSQL
```

Los routers se montan bajo `/api/*` en `backend/src/app.ts:17-19`:

```ts
app.use('/api/tasks', taskRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/progress', progressRoutes);
```

Los controllers **nunca tocan la base de datos**; delegan todo en el service.
Esto permite que las reglas de negocio sean testeables sin HTTP (aunque aquí se
testean de extremo a extremo, ver doc 04).

---

## 3. El invariante: "no se puede completar una tarea con pasos pendientes"

### 3.1 Definición y por qué es un invariante

Un **invariante de negocio** es una condición que debe cumplirse en todo
momento en el estado del sistema. El de StepUp:

> **Regla de oro:** una tarea con al menos un paso en estado `pending` no puede
> marcarse como `completed`.

En E1 esta regla vivía en el cliente (`TaskService.complete` del móvil), donde
cualquiera podía eludirla. En E2 se valida **en el servidor**, de modo que
incluso una petición directa a la API (`PATCH /api/tasks/:id/complete`) es
rechazada si el estado no lo permite.

### 3.2 Implementación (`backend/src/services/task.service.ts:45-59`)

```ts
async completeTask(taskId: number) {
  const task = await this.taskRepo.findById(taskId);
  if (!task) {
    throw new Error('TASK_NOT_FOUND');          // → 404
  }

  const pendingCount = await this.taskRepo.findPendingStepsCount(taskId);

  // Regla de Negocio: Invariante (espejo de TaskService.complete del app móvil)
  if (pendingCount > 0) {
    throw new Error('CANNOT_COMPLETE_WITH_PENDING_STEPS');   // → 409
  }

  return this.taskRepo.completeTask(taskId);    // → 200
}
```

1. **Existencia:** si la tarea no existe → `TASK_NOT_FOUND` → HTTP **404**.
2. **Validación del invariante:** se cuentan los pasos `pending`
   (`findPendingStepsCount`, un `count` sobre `steps WHERE task_id AND status='pending'`).
   Si `pendingCount > 0` → `CANNOT_COMPLETE_WITH_PENDING_STEPS` → HTTP **409 Conflict**.
3. **Transición válida:** solo si `pendingCount === 0` se escribe `completed_at` y `status = 'completed'`.

### 3.3 El mapeo a HTTP (`backend/src/utils/handle-error.ts`)

El controller envuelve la llamada al service en un `try/catch` y deriva todo a
`handleError`, que centraliza la traducción excepción → respuesta HTTP:

```ts
const KNOWN_MESSAGES = {
  CANNOT_COMPLETE_WITH_PENDING_STEPS: { status: 409, message: 'No se puede completar una tarea con pasos pendientes' },
  TASK_NOT_FOUND:   { status: 404, message: 'La tarea especificada no existe' },
  STEP_NOT_FOUND:   { status: 404, message: 'El paso especificado no existe' },
  STEP_ALREADY_COMPLETED: { status: 400, message: 'El paso ya se encuentra completado' },
};
```

| Condición detectada | HTTP | Significado |
|---|---|---|
| Invariante violado | **409 Conflict** | Conflicto con el estado actual del recurso |
| Registro inexistente | **404 Not Found** | Recurso no existe (o excepción Prisma `P2025`) |
| Paso ya completado | **400 Bad Request** | Operación ilegal sobre el estado del paso |
| `ZodError` (validación) | **400 Bad Request** | Body inválido, mensaje en español |
| Error no previsto | **500 Internal Server Error** | Último recurso, nunca expone internals |

El **409** es la elección semántica correcta: la petición es válida, pero
**entra en conflicto con el estado actual** del recurso (RFC 7231). No es un
error del cliente (`400`) ni del servidor (`500`).

---

## 4. El orquestador: `StepService.completeStep`

### 4.1 El flujo (`backend/src/services/step.service.ts:50-81`)

Completar un paso dispara una **secuencia atómica de efectos** que el servidor
orquesta. Este es el "corazón" del producto:

```ts
async completeStep(stepId: number) {
  const step = await this.stepRepo.findById(stepId);
  if (!step) throw new Error('STEP_NOT_FOUND');        // ① guarda de existencia
  if (step.status === 'completed') throw new Error('STEP_ALREADY_COMPLETED'); // ② idempotencia

  // 1. Marcar el paso como completado
  await this.stepRepo.completeStep(stepId);

  // 2. Incrementar métrica diaria (idempotente por fecha)
  const todayStr = new Date().toISOString().split('T')[0];
  await this.stepRepo.upsertDailyProgress(todayStr);

  // 3. Buscar el próximo paso pendiente para esa tarea
  const nextStep = await this.stepRepo.findNextPending(step.taskId);
  let taskCompleted = false;

  // 4. Si no quedan pasos pendientes, cerrar la tarea automáticamente
  if (!nextStep) {
    const pendingCount = await this.taskRepo.findPendingStepsCount(step.taskId);
    if (pendingCount === 0) {
      await this.taskRepo.completeTask(step.taskId);
      taskCompleted = true;
    }
  }

  return { nextStep, taskCompleted };
}
```

Paso a paso:

| Paso | Operación | Efecto | Garantía |
|---|---|---|---|
| ① | `findById` | — | 404 si el paso no existe |
| ② | chequeo de estado | — | **Idempotencia:** un paso ya completado no se re-completa (400) |
| 1 | `completeStep` | `status = 'completed'`, `completed_at = now()` | Registro de hecho consumado |
| 2 | `upsertDailyProgress` | `daily_progress` +1 para la fecha | **Atómico e idempotente** (ver 4.2) |
| 3 | `findNextPending` | Devuelve el siguiente paso pendiente | El cliente puede pre-navegar al siguiente paso |
| 4 | chequeo `pendingCount` | Si `0` → `completeTask` | **Auto-finalización** de la tarea |

El método **no** verifica explícitamente si hay pasos siguientes para decidir;
verifica con un `count` real contra la base (`findPendingStepsCount`). Esa
doble comprobación (paso siguiente no encontrado **y** contador en cero) hace el
cierre a prueba de condiciones de carrera entre peticiones concurrentes.

### 4.2 El incremento atómico de la métrica (`step.repository.ts:75-81`)

```ts
async upsertDailyProgress(dateStr: string) {
  return prisma.dailyProgress.upsert({
    where: { date: dateStr },
    update: { stepsCompleted: { increment: 1 } },
    create: { date: dateStr, stepsCompleted: 1 },
  });
}
```

`upsert` + `date UNIQUE` (doc 02) entregan tres propiedades críticas:

1. **Atómico:** el `increment: 1` es una operación del motor (`UPDATE ... SET steps_completed = steps_completed + 1`), no un *read-modify-write* del servidor. Dos completaciones concurrentes no se pisan entre sí.
2. **Idempotente:** no importa cuántas veces se ejecute contra la misma fila; cada ejecución representa exactamente un paso completado (la guarda ② del orquestador evita el re-completado).
3. **Sin condición de carrera en el `create`:** si dos peticiones crean la fila del día a la vez, la unicidad de `date` hace que una falle y el `upsert` la reconvierta en `update`.

En E1 la métrica se incrementaba desde el cliente; ahora **el backend es el
único autorizado** a escribirla. El móvil ni siquiera expone un endpoint de
escritura (`ProgressService.increment()` quedó como no-op, ver doc 05).

### 4.3 ¿Por qué el servidor y no el cliente?

| Ataque/fallo del cliente | Respuesta del servidor |
|---|---|
| `PATCH /api/tasks/:id/complete` directo con pasos pendientes | **409** (invariante validado en servidor) |
| `PATCH /api/steps/:id/complete` repetido | **400** (paso ya completado) |
| `PATCH` a un id inexistente | **404** |
| Body inválido (zod) | **400** con mensaje en español |
| App móvil "olvida" incrementar la métrica | Imposible: la incrementa el servidor al completar el paso |

El servidor **no confía en el cliente**: cada petición se revalida en su
totalidad (zod + existencia + invariante) antes de tocar la base de datos.

---

## 5. Validación de entrada con zod (`backend/src/validations/schemas.ts`)

Todos los bodies que ingresan a los services se parsean con **zod** antes de
cualquier operación (`createStepSchema.parse(input)` en `addStep`,
`createTaskSchema.parse(input)` en `createTask`, etc.). Beneficios:

- Tipado inferido: el dato que sale del `parse` está tipado como valor seguro.
- Rechazo temprano: peticiones malformadas nunca llegan al repositorio.
- Mensajes en español, reutilizados por el cliente para mostrar al usuario
  (p. ej. `POST /api/tasks {}` → `400 "El nombre es obligatorio"`).

---

## 6. Resumen

- La capa de **servicios** es el único lugar donde se evalúan las reglas de negocio.
- El **409 Conflict** expresa semánticamente la violación del invariante.
- `completeStep` orquesta cuatro efectos (completar paso, métrica, siguiente paso, auto-cierre) con doble comprobación anti-carrera.
- La métrica diaria se incrementa con un `upsert` **atómico** del motor.
- El backend es la **fuente de verdad**: inmune a clientes manipulados o fallidos.

**Siguiente documento:** `04-estrategia-testing.md` — cómo se verifica
automáticamente todo lo descrito aquí con una suite de integración.
