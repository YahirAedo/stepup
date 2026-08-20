**StepUp**

*Documento de Testing — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.1 | Agosto 2026*

> **Nota de versión (1.1):** resultados de ejecución reales al 18/08/2026, bugs
> detectados registrados, y detalle de las suites agregadas en la iteración
> (idempotencia, progreso, migración).

# 1. Introducción

## 1.1 Propósito

Este documento describe la estrategia de testing para la Entrega 2 de StepUp. Incluye los casos de prueba clave (automatizados y manuales), los módulos bajo prueba, el plan de ejecución y el registro de bugs detectados.

## 1.2 Alcance

Se testean dos tracks:
- **Track A — Migración visual:** pruebas manuales de las pantallas rediseñadas y nuevas
- **Track B — Backend:** tests automatizados de los endpoints de la API

# 2. Estrategia de Testing

Se priorizan tres niveles:

**Tests automatizados — app mobile (Vitest):**
- Unit tests de servicios (api, AuthService, StepService, SyncService, TaskService), helpers (dateFormat) y migraciones de SQLite
- Mocks de `expo-sqlite` y `fetch` para aislar la lógica de negocio
- **Ejecutados:** 111 tests en 15 suites — todos en verde

**Tests automatizados — backend (Jest + Supertest):**
- Tests de integración sobre la API contra una base PostgreSQL de prueba (`stepup_test`)
- **Ejecutados:** 94 tests en 9 suites — todos en verde
- *Requisito:* la suite requiere PostgreSQL local (provisionada con `docker-compose.yml`); no se pudo re-ejecutar en el entorno de entrega por falta de Docker. Resultados provienen de la corrida de integración (ver §6).

**Tests manuales (app mobile):**
- Prueba de flujo completo en dispositivo físico Android
- Verificación visual de cada pantalla contra los prototipos del design system
- Prueba de sync offline-first en modo avión

# 3. Casos de Prueba

## 3.1 Backend — Autenticación

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-AUTH-01 | Registrar usuario exitosamente | POST /api/auth/register con { name, email, password } válidos | 201 + { user, token } | Automatizado |
| TC-AUTH-02 | Registrar con email duplicado | POST /api/auth/register con email ya existente | 409 + mensaje de error | Automatizado |
| TC-AUTH-03 | Registrar sin email | POST /api/auth/register sin campo email | 400 + validación | Automatizado |
| TC-AUTH-04 | Login exitoso | POST /api/auth/login con credenciales válidas | 200 + { user, token } | Automatizado |
| TC-AUTH-05 | Login con contraseña incorrecta | POST /api/auth/login con password erróneo | 401 | Automatizado |
| TC-AUTH-06 | Login con email inexistente | POST /api/auth/login con email no registrado | 401 (mismo mensaje que TC-AUTH-05) | Automatizado |
| TC-AUTH-07 | Obtener perfil autenticado | GET /api/auth/me con token válido | 200 + datos del usuario | Automatizado |
| TC-AUTH-08 | Obtener perfil sin token | GET /api/auth/me sin header Authorization | 401 | Automatizado |
| TC-AUTH-09 | Obtener perfil con token inválido | GET /api/auth/me con token falsificado | 401 | Automatizado |

## 3.2 Backend — Tareas

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-TASK-01 | Listar tareas propias | GET /api/tasks con token | 200 + array de tareas del usuario | Automatizado |
| TC-TASK-02 | Listar tareas de otro usuario | GET /api/tasks con token de otro usuario | No se ven tareas ajenas | Automatizado |
| TC-TASK-03 | Crear tarea | POST /api/tasks con { name } | 201 + tarea creada con id uuid | Automatizado |
| TC-TASK-04 | Crear tarea con fecha límite | POST /api/tasks con { name, dueDate } | 201 + tarea con dueDate | Automatizado |
| TC-TASK-05 | Crear tarea sin nombre | POST /api/tasks sin name | 400 | Automatizado |
| TC-TASK-06 | Editar tarea | PUT /api/tasks/:id con { name } | 200 + tarea actualizada | Automatizado |
| TC-TASK-07 | Editar tarea de otro usuario | PUT /api/tasks/:id de otro usuario | 404 | Automatizado |
| TC-TASK-08 | Eliminar tarea propia | DELETE /api/tasks/:id | 204 | Automatizado |
| TC-TASK-09 | Eliminar tarea de otro | DELETE /api/tasks/:id de otro usuario | 404 | Automatizado |

## 3.3 Backend — Pasos

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-STEP-01 | Listar pasos de tarea propia | GET /api/tasks/:id/steps con token | 200 + array de pasos ordenados | Automatizado |
| TC-STEP-02 | Crear paso | POST /api/tasks/:id/steps con { name } | 201 + paso con orderIndex autoasignado | Automatizado |
| TC-STEP-03 | Crear paso con duración | POST /api/tasks/:id/steps con { name, durationMin } | 201 + paso con durationMin | Automatizado |
| TC-STEP-04 | Crear paso en tarea de otro | POST /api/tasks/:id/steps en tarea ajena | 404 | Automatizado |
| TC-STEP-05 | Editar paso | PUT /api/steps/:id | 200 + paso actualizado | Automatizado |
| TC-STEP-06 | Eliminar paso | DELETE /api/steps/:id | 204 | Automatizado |
| TC-STEP-07 | Eliminar paso reindexa | DELETE /api/steps/:id → GET /api/tasks/:id/steps | orderIndex contiguos sin saltos | Automatizado |

## 3.4 Backend — Sync

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-SYNC-01 | Push de tareas nuevas | POST /api/sync/push con tasks[] nuevas | 200 + server_ids asignados | Automatizado |
| TC-SYNC-02 | Push de tareas actualizadas | POST /api/sync/push con tasks[] existentes modificadas | 200 + datos actualizados | Automatizado |
| TC-SYNC-03 | Pull sin cambios | GET /api/sync/pull?since=(ahora) | 200 + arrays vacíos | Automatizado |
| TC-SYNC-04 | Pull con cambios recientes | POST tarea → GET /api/sync/pull?since=(antes de crear) | 200 + tarea en resultados | Automatizado |
| TC-SYNC-05 | Migración al registrarse | POST /api/sync/migrate con tasks+steps+credenciales | 201 + user, token, taskMap | Automatizado |
| TC-SYNC-06 | Push sin autenticación | POST /api/sync/push sin token | 401 | Automatizado |

## 3.5 Backend — Idempotencia

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-IDEM-01 | Write sin Idempotency-Key | POST /api/tasks sin header | 400 | Automatizado |
| TC-IDEM-02 | Replay con misma key | POST /api/tasks 2 veces con la misma key | 2ª respuesta = respuesta cacheada (201 único) | Automatizado |
| TC-IDEM-03 | Misma key, payload distinto | Misma key, body diferente | 409 | Automatizado |
| TC-IDEM-04 | Replay de completeStep | PATCH /api/steps/:id/complete con misma key | No dobla el conteo de DailyProgress | Automatizado |
| TC-IDEM-05 | Limpieza de claves vencidas | Clave expirada (TTL 24h) | Se descarta y se procesa normal | Automatizado |

## 3.6 Backend — Progreso

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-PROG-01 | Progreso diario | GET /api/progress con pasos completados hoy | 200 + contador del día | Automatizado |
| TC-PROG-02 | Sin actividad hoy | GET /api/progress sin completar hoy | Contador en cero (registro creado) | Automatizado |
| TC-PROG-03 | Completa paso → incrementa | Completar paso → GET /api/progress | stepsCompleted +1 | Automatizado |

## 3.7 App — Flujo manual offline-first

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-MAN-01 | Uso offline sin cuenta | Abrir app, crear tarea, agregar pasos, completar paso | Todo funciona sin conexión | Manual |
| TC-MAN-02 | Registro con migración | Estando offline con datos, registrarse | Datos aparecen en Railway | Manual |
| TC-MAN-03 | Sync automático | Con cuenta, crear tarea offline → reconectar | Tarea aparece en Railway | Manual |
| TC-MAN-04 | Pull al abrir app | Desde otro dispositivo, crear tarea → abrir app en primer dispositivo | Tarea aparece | Manual |
| TC-MAN-05 | Persistencia de sesión | Cerrar y reabrir app | Sesión activa, mismo usuario | Manual |

## 3.8 App — Prueba visual (migración)

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-VIS-01 | Onboarding primera vez | Instalar app, abrir primera vez | Se muestran 2 pantallas de onboarding | Manual |
| TC-VIS-02 | Onboarding no se repite | Cerrar y reabrir app | No se muestra onboarding | Manual |
| TC-VIS-03 | FocusScreen con timer | Tocar "Iniciar Cronómetro" | Timer corre, botón cambia a "Pausar" | Manual |
| TC-VIS-04 | TaskList bento grid | Tener 3+ tareas activas | Se ven tarjetas de distintos tamaños | Manual |
| TC-VIS-05 | Completar paso (avance automático) | Completar paso desde FocusScreen | El paso se marca completado y aparece el siguiente (sin pantalla de celebración; StepCompleteScreen registrada pero no cableada — E3) | Manual |
| TC-VIS-06 | GlassTabBar | Navegar entre tabs | Barra flotante, tab activo resaltado | Manual |
| TC-VIS-07 | Perfil y configuración | Ir a Perfil, cambiar duración default | Selector funcional, cambio persiste | Manual |
| TC-VIS-08 | Insignias | Ir a Insignias desde Historial | Galería con desbloqueadas/bloqueadas | Manual |

# 4. Bugs Conocidos (E1 → E2)

| ID | Descripción | Severidad | Estado | Módulo |
| --- | --- | --- | --- | --- |
| BUG-01 | El timer no persiste al cerrar la app | Baja | Abierto — por diseño | Timer |
| BUG-02 | Fecha límite se ingresa manualmente (YYYY-MM-DD), no hay date picker | Media | **Resuelto en E2** — date picker web (#60, PR #116) | TaskForm |
| BUG-03 | Sin feedback visual al completar paso (E1) | Baja | Resuelto en E2 — avance automático al siguiente paso (StepCompleteScreen registrada, sin wiring; E3) | FocusScreen |
| BUG-04 | No hay confirmación visual al crear tarea | Baja | Abierto — mejora UX | TaskForm |

# 5. Bugs Detectados en E2

| ID | Descripción | Severidad | Estado | Módulo |
| --- | --- | --- | --- | --- |
| BUG-05 | El borde del día en el historial se calcula con `new Date()` (UTC), no con hora local → puede quedar la fila del día en el recuadro equivocado en husos negativos | Baja | Abierto → issue #122 (E3) | HistoryScreen |
| BUG-06 | IDOR en `/api/sync/migrate`: scope de idempotencia fijo y público, usuario fake compartido → posible replay de token/taskMap ajeno | Alta | Abierto → issue #123 (E3) | sync.migrate |
| BUG-07 | La app genera una `Idempotency-Key` nueva por llamada → el replay protegido del servidor no se ejerce desde la app (retry de red duplicaría datos) | Media | Abierto → issue #124 (E3) | idempotency.ts |
| BUG-08 | Los docs del PRD backend usan PUT para steps (el código real usa PUT para update y PATCH solo para `/complete`) | Baja | Abierto → issue #125 (E3) | Docs |
| BUG-09 | Quedan `as any` residuales en el frontend (slices de la transición JS→TS) | Baja | Abierto → issue #126 (E3) | Frontend |

# 6. Resultados de Ejecución

**App (Vitest):** 111 tests / 15 suites — 100% en verde (18/08/2026).

Suites cubiertas: api.test.ts, AuthService.test.ts, StepService.test.ts, SyncService.test.ts, TaskService.test.ts, dateFormat.test.ts, database (migraciones), hooks y componentes del design system.

**Backend (Jest + Supertest):** 94 tests / 9 suites — 100% en verde.

| Suite | Casos |
| --- | --- |
| auth | 12 |
| env | 4 |
| error-handler | 2 |
| idempotency | 18 |
| migration | 1 |
| progress | 6 |
| steps | 16 |
| sync | 21 |
| tasks | 14 |
| **Total** | **94** |

> La suite backend corre contra `stepup_test` en PostgreSQL local (provisionada con
> `docker-compose.yml`). En el entorno de entrega no había Docker, por lo que los
> 94 resultados provienen de la última corrida de integración (se indican como
> registrados, no re-ejecutados en vivo).

| Fecha | TC ejecutados | Pasaron | Fallaron | % Éxito |
| --- | --- | --- | --- | --- |
| 18/08/2026 — App (Vitest) | 111 | 111 | 0 | 100% |
| 18/08/2026 — Backend (Jest, registrado) | 94 | 94 | 0 | 100% |

*StepUp — Testing E2 — Versión 1.1 — Agosto 2026*

*Ingeniería en Sistemas de Información*
