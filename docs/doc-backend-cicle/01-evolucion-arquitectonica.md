# 01 — Evolución Arquitectónica: Transición de E1 a E2

> Documento técnico para defensa de arquitectura de software.
> Proyecto: **StepUp** — Rama: `feature/backend-express-prisma-postgres`

---

## 1. Propósito

Este documento describe el **cambio de paradigma** entre dos entregas:

- **Fase E1 (Entregable 1):** aplicación *offline-first* con base de datos **SQLite embebida** en el dispositivo (`expo-sqlite`).
- **Fase E2 (Entregable 2):** arquitectura **distribuida cliente-servidor**, con un backend de **3 capas** en Node.js + Express y una base de datos relacional **PostgreSQL** contenerizada en Docker.

El argumento central es que la migración se realizó **sin alterar la capa de presentación**: las pantallas de React Native no sufrieron cambios estructurales porque el acceso a datos estaba correctamente abstraído detrás de los servicios. Esto es una demostración práctica de los principios de **Separación de Responsabilidades (SoC)** y **Sustitución de Liskov (LSP)** aplicados a una base de datos real.

---

## 2. El paradigma E1: offline-first con SQLite

En E1, cada dispositivo era un **sistema autocontenido**:

```
┌───────────────────────────────────────────────┐
│                   Dispositivo                  │
│ ┌──────────┐   ┌──────────────┐   ┌─────────┐ │
│ │   UI RN  │ → │  Servicios   │ → │  SQLite │ │
│ │ (screens)│   │ (TaskService │   │(expo-   │ │
│ │          │   │  StepService │   │ sqlite) │ │
│ └──────────┘   │  ProgressSvc)│   └─────────┘ │
│                └──────────────┘               │
└───────────────────────────────────────────────┘
```

El esquema vivía dentro de la app en `src/database/migrations.ts` y se abría con
`SQLite.openDatabaseAsync('stepup.db')` en `src/database/db.ts:8`.

Características que definían el modelo E1:

| Característica | Implementación E1 |
|---|---|
| Persistencia | Archivo `.db` dentro del sandbox de la app |
| Lugar de la verdad | El dispositivo del usuario |
| Integridad de datos | Confianza implícita en el código de la app |
| Reglas de negocio | Duplicadas en el cliente (`TaskService.complete`, `StepService.complete`) |
| Concurrencia | Un solo usuario, un solo dispositivo, sin contienda |
| Alcance | Imposible de compartir entre dispositivos o auditar centralmente |

**Limitación estructural:** con E1, el invariante más importante del producto
("una tarea con pasos pendientes no puede completarse") vivía únicamente en el
cliente. Cualquier usuario con acceso al código (o una app modificada) podía
violarlo, y los datos quedaban aislados en el dispositivo.

---

## 3. El paradigma E2: cliente-servidor de 3 capas

En E2, la aplicación móvil se convierte en un **cliente de una API REST** y toda
la lógica de negocio se centraliza en el servidor:

```
┌───────────────────────┐         ┌──────────────────────────────────────────────┐
│       Móvil (RN)      │  HTTP   │                   Backend                    │
│ ┌────┐  ┌───────────┐ │ ──────> │ ┌────────┬───────────┬───────────┬─────────┐ │
│ │ UI │→ │ Servicios │ │  JSON   │ │ Routes │Controller │  Service  │ Repo    │ │
│ │    │← │ (HTTP)    │ │ <────── │ │ /api/* │ (HTTP)    │ (negocio) │ (Prisma)│ │
│ └────┘  └───────────┘ │         │ └────────┴───────────┴───────────┴─────────┘ │
└───────────────────────┘         │                    │                         │
                                  │               PostgreSQL (Docker)             │
                                  └──────────────────────────────────────────────┘
```

La cadena de invocación en el servidor es estrictamente descendente
(`backend/src/app.ts:17-19`):

```
routes → controller → service (reglas de negocio) → repository → Prisma → PostgreSQL
```

- **Routes** (`backend/src/routes/*.routes.ts`): definen el contrato HTTP y delegan en el controller.
- **Controllers** (`backend/src/controllers/*.controller.ts`): manejan request/response y traducen excepciones a códigos HTTP (vía `handle-error.ts`). **Nunca tocan la base de datos.**
- **Services** (`backend/src/services/*.service.ts`): contienen la **lógica de negocio** (invariantes, orquestación, métricas).
- **Repositories** (`backend/src/repositories/*.repository.ts`): único punto de acceso a datos vía Prisma.

Esta es la separación de responsabilidades exigida para que cada capa sea
reemplazable y testeable de forma aislada.

---

## 4. La prueba de Sustitución: la UI no cambió

### 4.1 El contrato público de los servicios

Los servicios móviles mantuvieron **firmas públicas idénticas** entre E1 y E2.
La pantalla de tareas (`src/screens/TaskListScreen.tsx`) sigue llamando
exactamente lo mismo que en E1:

| Método | Firma pública (sin cambios) | E1 (SQLite) | E2 (HTTP) |
|---|---|---|---|
| `TaskService.getAll()` | `() => Promise<Task[]>` | Query SQL `SELECT ...` | `GET /api/tasks` |
| `TaskService.create(input)` | `(input) => Promise<Task>` | `INSERT INTO tasks ...` | `POST /api/tasks` |
| `StepService.getByTask(id)` | `(id) => Promise<Step[]>` | `SELECT ... WHERE task_id` | `GET /api/steps?taskId=` |
| `StepService.complete(id)` | `(id) => Promise<{nextStep, taskCompleted}>` | Update local + lógica | `PATCH /api/steps/:id/complete` |
| `ProgressService.getToday()` | `() => Promise<number>` | `SELECT ... daily_progress` | `GET /api/progress` |

### 4.2 ¿Qué cambió realmente?

| Capa | E1 | E2 |
|---|---|---|
| **Screens** (`src/screens/`) | Sin cambios | **Sin cambios** (cero diffs funcionales) |
| **Servicios** (`src/services/`) | Queries SQLite directas | Cliente HTTP (`apiFetch`) |
| **Mapeo de datos** | — | camelCase (API) ⇄ snake_case (tipos locales `src/types`) |
| **Lógica de negocio** | En el cliente | **En el servidor** |
| **Persistencia** | `expo-sqlite` | PostgreSQL vía Prisma |

### 4.3 Argumento de diseño (SoC + LSP)

La UI depende de la **interfaz** de los servicios, no de su **implementación**.
Esto habilita lo siguiente:

1. **Sustitución:** se reemplazó el backend de almacenamiento (SQLite → REST) sin
   tocar un solo consumidor. Si la interfaz (`getAll`, `create`, `complete`, ...)
   se respeta, cualquier implementación es intercambiable.
2. **Testing:** al desacoplar la UI de la persistencia, las pruebas de
   integración del backend ejercitan la misma interfaz que consume la app
   (ver documento `04-estrategia-testing.md`).
3. **Evolución:** el mismo contrato permitirá en fases futuras añadir
   autenticación JWT y sincronización *last-write-wins* sin rediseñar pantallas.

> **Conclusión técnica:** la inexistencia de cambios en la UI no es casualidad;
> es consecuencia directa de haber abstraído el acceso a datos en una capa de
> servicios con contratos bien definidos en E1.

---

## 5. Cambio del modelo de confianza

El cambio más profundo no es tecnológico sino **de confianza**:

| Aspecto | E1 | E2 |
|---|---|---|
| ¿Quién valida el invariante? | El cliente (modificable) | **El servidor** (autoridad) |
| ¿Quién incrementa la métrica diaria? | El cliente | **El servidor** (al completar un paso) |
| ¿Dónde se verifica la existencia de un registro? | Local | En la base de datos (FK + Prisma) |
| ¿Qué pasa si un cliente envía una petición maliciosa? | — | El servidor la rechaza con `409`/`400`/`404` |

En E2 el servidor es la **fuente única de verdad (single source of truth)**.
El documento `03-orquestador-invariantes.md` detalla cómo se defienden las
reglas de negocio con códigos HTTP.

---

## 6. Costos y mitigaciones del nuevo paradigma

| Costo introducido | Mitigación implementada |
|---|---|
| Dependencia de la red (latencia, caídas) | Estados de carga (`ActivityIndicator`), manejo de errores de red y botón de reintento en las pantallas (ver `05-integracion-red-cliente.md`) |
| Pérdida del modo offline | SQLite se conserva en `src/database/` para la futura fase de sincronización; el modo offline queda suspendido deliberadamente |
| Infraestructura adicional | Docker Compose levanta PostgreSQL con un solo comando; config versionada en `backend/docker-compose.yml` |

---

## 7. Resumen

- E1 era **oficina local en cada dispositivo**; E2 es un **sistema distribuido** donde el servidor concentra el estado y la lógica.
- La migración demuestra **SoC y Sustitución**: la UI quedó intacta porque los servicios definen el contrato.
- El servidor pasa a ser la **fuente de verdad**, capaz de defender los invariantes incluso ante un cliente hostil.

**Siguiente documento:** `02-infraestructura-modelo-relacional.md` — cómo Docker,
PostgreSQL y Prisma materializan la nueva capa de datos.
