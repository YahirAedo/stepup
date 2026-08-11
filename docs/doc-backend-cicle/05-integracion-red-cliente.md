# 05 — Integración y Manejo de Red en el Cliente (Frontend)

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `feature/backend-express-prisma-postgres`

---

## 1. De SQLite a HTTP: el reemplazo en el cliente

En E1 los servicios móviles ejecutaban queries SQLite directas
(`expo-sqlite`). En E2 usan **`fetch` contra la API REST**. El módulo central
es el cliente HTTP `src/services/api.ts`, que expone:

- `API_BASE_URL`: la base resuelta (env → auto-detección).
- `apiFetch<T>(path, options)`: wrapper tipado con manejo de errores.
- `ApiError`: error con `status`, para que las pantallas distingan causas.
- `ENDPOINTS`: **única fuente de verdad** de las rutas (doc 01, §4).

Las firmas públicas de los servicios (`TaskService`, `StepService`,
`ProgressService`) no cambiaron: internamente, cada método traduce su llamada a
un endpoint. Por ejemplo, `TaskService.getAll()` se convirtió de un `SELECT` a
`apiFetch<ApiTask[]>(ENDPOINTS.tasks.list)`. El mapeo `camelCase` (API) ⇄
`snake_case` (tipos locales `src/types`) ocurre dentro del servicio, de modo que
**las pantallas siguen trabajando con el modelo local sin cambios**.

---

## 2. Resolución de la URL base: variables de entorno

### 2.1 Prioridad de resolución (`src/services/api.ts`)

```ts
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${API_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}
```

| Orden | Fuente | Cuándo aplica |
|---|---|---|
| 1 | `EXPO_PUBLIC_API_URL` (`.env`) | Configuración explícita por entorno (dev/LAN/producción) |
| 2 | `Constants.expoConfig.hostUri` | Desarrollo: la IP LAN del dev server de Expo (funciona en **teléfono físico**) |
| 3 | `10.0.2.2:3000` | Emulador Android (alias del host desde la VM) |
| 4 | `localhost:3000` | Último recurso (web/iOS simulador) |

### 2.2 Variables de entorno en Expo

Expo inyecta en tiempo de bundle toda variable con prefijo **`EXPO_PUBLIC_`**
proveniente de archivos `.env`:

| Archivo | Git | Contenido |
|---|---|---|
| `.env` | **ignorado** | Valores locales de cada desarrollador (p. ej. `EXPO_PUBLIC_API_URL=http://192.168.100.123:3000`) |
| `.env.example` | versionado | Plantilla documentada con ejemplos (LAN, emulador, etc.) |

**Regla práctica documentada en el proyecto:** cambiar `.env` exige reiniciar el
dev server (`npx expo start`), porque las variables se embeben al compilar el
bundle.

**Por qué funciona en el teléfono físico:** `hostUri` (y el valor de `.env`) es
la IP LAN del PC dentro de la misma red Wi-Fi; Express escucha en todas las
interfaces (0.0.0.0), así que la app alcanza el backend por `http://<ip-pc>:3000`.

---

## 3. Errores de red: resiliencia del cliente

Al depender de la red, la app queda expuesta a **latencia** y **caídas**. El
error que originó este apartado fue el clásico `ERR_CONNECTION_REFUSED`: el
backend no estaba corriendo y todas las peticiones GET fallaban. El análisis
reveló dos problemas y se resolvieron ambos.

### 3.1 Error de red tipificado (`src/services/api.ts`)

Antes, una conexión rechazada lanzaba un `TypeError: Network request failed`
crudo, imposible de distinguir en las pantallas. Ahora `apiFetch` envuelve el
fallo de red en un error tipificado y con mensaje accionable:

```ts
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { ... }
}

try {
  res = await fetch(...);
} catch {
  throw new ApiError(
    0,
    'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.',
  );
}
```

Convención del proyecto: `status = 0` = **fallo de red** (sin respuesta HTTP),
mientras `status = 4xx/5xx` = error del servidor. Así la UI puede reaccionar
distinto según la causa.

### 3.2 Estados de carga y de error en las pantallas

| Pantalla | Carga | Error |
|---|---|---|
| `TaskListScreen` | `ActivityIndicator` | Pantalla "No se pudo cargar" + mensaje + botón **Reintentar** |
| `FocusScreen` | `ActivityIndicator` | `try/catch` → estado vacío (sin cuelgue) |
| `TaskDetailScreen` | `ActivityIndicator` | `try/catch` → mensaje de tarea no encontrada |
| `HistoryScreen` | `ActivityIndicator` | `try/catch` → no rompe la carga |

**El caso que se corrigió:** `TaskListScreen.loadData` no tenía `try/catch`, por
lo que con el backend caído `setLoading(true)` quedaba pegado y la pantalla
mostraba un **spinner infinito** sin explicación. La corrección añadió:

```ts
try {
  const raw = await TaskService.getAll();
  ...
} catch (err) {
  setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
} finally {
  setLoading(false);
}
```

y un bloque de render que ante `error` muestra el `EmptyState` con CTA
"Reintentar" (que re-ejecuta `loadData`). Ciclo de UX completo:

```
carga → éxito (datos) | error (mensaje + retry)
```

### 3.3 Costo del modelo: N+1

`TaskListScreen` hace `1 + 2×N` peticiones (`getAll` + `getStepCounts` por
tarea). Es un tradeoff consciente para esta fase (el backend ya devuelve los
pasos embebidos en `GET /api/tasks`); se deja registrado como optimización
futura (un único endpoint con conteos agregados) sin afectar la corrección.

---

## 4. El contrato de red de extremo a extremo

```
Pantalla (snake_case)  →  Servicio (traduce)  →  API (camelCase)  →  PostgreSQL
```

| Operación del negocio | Servicio móvil | Endpoint | Método |
|---|---|---|---|
| Listar tareas activas | `TaskService.getAll` | `/api/tasks` | GET |
| Crear tarea | `TaskService.create` | `/api/tasks` | POST |
| Completar tarea (invariante) | `TaskService.complete` | `/api/tasks/:id/complete` | PATCH → **409** si pasos pendientes |
| Pasos de una tarea | `StepService.getByTask` | `/api/steps?taskId=` | GET |
| Completar paso (orquestador) | `StepService.complete` | `/api/steps/:id/complete` | PATCH → `{nextStep, taskCompleted}` |
| Métrica del día | `ProgressService.getToday` | `/api/progress` | GET |

`ProgressService.increment()` quedó como **no-op intencional**: la métrica la
escribe el servidor al completar un paso (doc 03, §4.2); el cliente solo la
**lee**. Esto elimina la duplicación de lógica de negocio en el cliente.

---

## 5. Offline: decisión consciente

El reemplazo de `expo-sqlite` por HTTP **suspendió deliberadamente el modo
offline-first**. `src/database/` (esquema SQLite + seed) se conserva
versionado para reutilizarlo en la futura fase de **sincronización** (pull/push
con *last-write-wins*), cuando el cliente vuelva a necesitar un cache local.
Hasta entonces, la app exige conectividad — y lo hace con estados de UX que lo
comunican (carga, error, reintento) en lugar de fallar silenciosamente.

---

## 6. Resumen

- El cliente migró de SQLite a un **cliente HTTP tipado** con la URL base
  configurable por **variables de entorno** (`EXPO_PUBLIC_API_URL`) y
  auto-detección por `hostUri`/plataforma.
- Las rutas viven en un **único objeto `ENDPOINTS`** (sin rutas sueltas).
- Los **errores de red se tipifican** (`ApiError` con `status 0`) y las
  pantallas muestran **spinner → datos / error + reintento**, cerrando el ciclo
  de experiencia de usuario ante una API caída (`ERR_CONNECTION_REFUSED`).
- La métrica diaria es **solo lectura** en el cliente; el servidor la escribe.
- El modo offline queda suspendido y documentado, listo para la fase de sync.
