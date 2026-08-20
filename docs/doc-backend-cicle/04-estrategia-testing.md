# 04 — Estrategia de Testing Automatizado (Jest + Supertest)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `feature/backend-express-prisma-postgres`

---

## 1. Justificación

Las pruebas automatizadas son, estadísticamente, la **deuda técnica más común**
en proyectos académicos y de producción. Esta entrega no solo automatiza lo que
en Fase E1 se validaba a mano: convierte las **reglas de negocio** (doc 03) en
**casos verificables de forma determinista**. El resultado: cada `npm test`
levanta una base limpia, inyecta datos vía la API real, ejecuta la petición
HTTP y valida el resultado de punta a punta.

---

## 2. Arquitectura de la suite

### 2.1 Stack

| Herramienta | Rol |
|---|---|
| **Jest 30** | Runner y framework de aserciones |
| **ts-jest** | Transpilación de TypeScript en memoria (sin paso de build) |
| **Supertest** | Ejercita el `app` de Express **en proceso**, sin abrir un puerto |
| **Prisma CLI** | Reconstruye el esquema de la base de test |

Punto clave: los tests usan `createApp()` directamente (no `server.ts`), por lo
que **no se levanta ningún listener** y las pruebas son rápidas y aisladas del
proceso de dev.

### 2.2 Configuración (`backend/jest.config.js`)

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  globalSetup: '<rootDir>/jest.globalSetup.js',
  setupFiles: ['<rootDir>/jest.env.setup.js'],
  testTimeout: 20000,
  maxWorkers: 1,
};
```

| Opción | Por qué |
|---|---|
| `globalSetup` | Corre **una vez antes de toda la suite**: resetea el esquema de la base de test |
| `setupFiles` | Inyecta las variables de entorno antes de importar cualquier módulo |
| `maxWorkers: 1` | Ejecución **secuencial obligatoria** (ver 4) |
| `testTimeout: 20000` | Margen para la reconstrucción del esquema y la I/O a PostgreSQL |

### 2.3 Base de datos efímera `stepup_test`

El mismo contenedor PostgreSQL (doc 02) aloja una base dedicada a testing:

**`jest.globalSetup.js`** — reconstruye el esquema desde el schema una sola vez:

```js
const TEST_DATABASE_URL =
  'postgresql://stepup_user:stepup_password@localhost:5432/stepup_test?schema=public';

module.exports = async () => {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: path.join(__dirname, '.'),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
};
```

**`jest.env.setup.js`** — apunta la app bajo prueba a esa base:

```js
process.env.DATABASE_URL =
  'postgresql://stepup_user:stepup_password@localhost:5432/stepup_test?schema=public';
process.env.NODE_ENV = 'test';
```

Efecto combinado:

1. **Esquema fresco por corrida:** `db push --force-reset` garantiza que el
   estado de la base de test sea idéntico en cada ejecución (sin residuos de
   corridas anteriores).
2. **Aislamiento de dev:** ninguna prueba toca `stepup_db`; los datos de
   desarrollo quedan intactos.
3. **`NODE_ENV=test`:** semáforo para que la app no produzca efectos colaterales
   (logs, seeds, etc.).

---

## 3. Helpers (`backend/src/tests/helpers.ts`)

```ts
export const app = createApp();                       // la app real bajo test

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE steps, tasks, daily_progress RESTART IDENTITY CASCADE',
  );
}

export async function createTask(name = 'Tarea de prueba') { /* POST /api/tasks → espera 201 */ }
export async function addStep(taskId, name, durationMin) { /* POST /api/steps → espera 201 */ }
```

- **`app`**: instancia real de Express montada con los routers (misma que
  produce el server en producción).
- **`resetDb`**: `TRUNCATE ... RESTART IDENTITY CASCADE` reinicia los
  autoincrementales y limpia en cascada. Cada `beforeEach` lo ejecuta, aislando
  completamente un caso del otro.
- **`createTask` / `addStep`**: **seed a través de la API** (no insertan SQL
  directo): si el seed falla, la prueba falla, porque el seed mismo ya es una
  petición HTTP válida. Se valida el `201` esperado en el helper.

---

## 4. Determinismo y secuencialidad: `maxWorkers: 1`

Las suites comparten **una misma base de datos**. Jest por defecto ejecuta los
archivos de test en **workers paralelos**, lo que aquí produce interferencia:
mientras una suite hace `TRUNCATE`, otra está insertando y leyendo, con fallas
espurias (`500`/`404`).

> **Decisión tomada en el proyecto:** `maxWorkers: 1` fuerza la ejecución
> secuencial de las suites. El costo en tiempo es marginal para 20 tests
> (≈ 7 s) y el beneficio es **determinismo total**: una corrida verde es siempre
> verde. Alternativas (una base por worker) aumentarían la complejidad de
> infraestructura sin aportar valor a este volumen de pruebas.

El determinismo se garantiza con tres mecanismos combinados:

1. Esquema reconstruido en `globalSetup` (antes de la suite).
2. `resetDb()` en cada `beforeEach` (antes de cada caso).
3. Un solo worker (sin concurrencia entre suites).

---

## 5. Casos de prueba implementados

### 5.1 `tasks.test.ts` — el invariante (la prueba "más cara" del proyecto)

| Caso | Petición | Esperado |
|---|---|---|
| Crear tarea válida | `POST /api/tasks {name, dueDate}` | **201**, `status: active`, `dueDate` normalizado |
| Body inválido | `POST /api/tasks {}` | **400** `"El nombre es obligatorio"` (zod, español) |
| Listar activas con pasos ordenados | `GET /api/tasks` | 200, pasos por `orderIndex` |
| **Invariante 409** | `PATCH /api/tasks/:id/complete` con paso `pending` | **409** `"No se puede completar una tarea con pasos pendientes"` |
| **Happy path 200** | Mismo PATCH sobre tarea sin pasos | **200**, `status: completed`, `completedAt` seteado |
| Tarea inexistente | `PATCH /api/tasks/999/complete` | **404** |
| Actualización | `PATCH /api/tasks/:id {name}` | 200, campo actualizado |
| **Cascade** | `DELETE /api/tasks/:id` | **204** y `GET /api/steps?taskId` → `[]` |
| Completadas | `GET /api/tasks/completed` | Solo tareas `completed` |

### 5.2 `steps.test.ts` — el orquestador

| Caso | Esperado |
|---|---|
| `orderIndex` automático (max + 1) | Paso 1 → `0`, paso 2 → `1` |
| Listar en orden | `GET /api/steps?taskId` → `['A','B','C']` |
| Completar paso 1 de 2 | **200**, devuelve `nextStep` (el 2), `taskCompleted: false` |
| Completar el último paso | **200**, `nextStep: null`, `taskCompleted: true`, tarea `completed` |
| Reintentar paso completado | **400** `"El paso ya se encuentra completado"` |
| Paso inexistente | **404** |
| `PUT /api/steps/reorder` | Reordena y reindexa `orderIndex` 0..n |
| `DELETE /api/steps/:id` | **204**, elimina y **reindexa** los restantes |

### 5.3 `progress.test.ts` — métricas

| Caso | Esperado |
|---|---|
| Dos pasos completados hoy | `GET /api/progress` → una fila con `date = hoy`, `stepsCompleted = 2` |
| Sin actividad | `GET /api/progress` → `[]` |
| Tarea sin pasos completada | No genera filas de progreso (el `completeTask` directo no toca `daily_progress`) |

### 5.4 Cobertura y resultado

- **3 suites, 20 casos**, todos de **integración de extremo a extremo**
  (HTTP real → service → repository → PostgreSQL → respuesta).
- Corrida actual: **20/20 en ≈ 7 s**.
- Los casos 409/200, reintento 400, cascade y reindexado prueban
  **literalmente** los invariantes del doc 03.

---

## 6. Cómo correr la suite

```bash
docker compose up -d        # prerrequisito: PostgreSQL levantado
npm test                    # corrida única (globalSetup resetea stepup_test)
npm run test:watch          # modo watch para desarrollo
```

Si el contenedor está caído, `globalSetup` falla con error de conexión a
PostgreSQL — la suite falla ruidosamente y no pasa silenciosa a verde, lo cual
es el comportamiento deseado.

---

## 7. Por qué esto eleva el estándar del proyecto

1. **Determinismo:** esquema fresco + `TRUNCATE` + worker único = los resultados
   no dependen del estado previo de la máquina.
2. **El seed es la API:** no se fabrican datos con SQL directo; se usa el mismo
   contrato público que consume la app móvil. Si la API se rompe, lo saben los
   tests.
3. **Prueba el invariante, no el método:** `409` y `200` se validan por HTTP,
   tal como los experimenta un cliente real.
4. **Base efímera:** la suite puede correrse mil veces sin contaminar el
   entorno de desarrollo ni dejar residuos.
5. **Regresión automática:** cualquier cambio futuro en `schema.prisma`,
   validaciones u orquestación que rompa un comportamiento quedará detectado en
   el CI antes de llegar a producción.

---

## 8. Resumen

- Jest + Supertest ejercitan la app real **en proceso**, sobre una base
  **efímera** (`stepup_test`) reconstruida con `prisma db push --force-reset`.
- `maxWorkers: 1` + `resetDb()` por caso garantizan **determinismo** sobre una
  base compartida.
- 20 casos cubren el invariante 409/200, el orquestador completo, la
  integridad en cascada y las métricas diarias.
- El seed se inyecta **a través de la API**, validando el contrato de extremo a
  extremo.

**Siguiente documento:** `05-integracion-red-cliente.md` — cómo el frontend se
conecta a esta API y sobrevive a la red.
