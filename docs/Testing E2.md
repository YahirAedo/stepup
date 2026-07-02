**StepUp**

*Documento de Testing — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Julio 2026*

# 1. Introducción

## 1.1 Propósito

Este documento describe la estrategia de testing para la Entrega 2 de StepUp. Incluye los casos de prueba clave (automatizados y manuales), los módulos bajo prueba, el plan de ejecución y el registro de bugs detectados.

## 1.2 Alcance

Se testean dos tracks:
- **Track A — Migración visual:** pruebas manuales de las pantallas rediseñadas y nuevas
- **Track B — Backend:** tests automatizados de los endpoints de la API

# 2. Estrategia de Testing

Se priorizan dos niveles:

**Tests automatizados (backend):**
- Tests de integración sobre la API usando supertest
- Cada endpoint se prueba con casos felices y casos de error
- Base de datos de prueba separada (PostgreSQL test database en Railway o SQLite local para tests)

**Tests manuales (app mobile):**
- Prueba de flujo completo en dispositivo físico Android
- Verificación visual de cada pantalla contra los prototipos del design system
- Prueba de sync offline-first en avión mode

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

## 3.5 App — Flujo manual offline-first

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-MAN-01 | Uso offline sin cuenta | Abrir app, crear tarea, agregar pasos, completar paso | Todo funciona sin conexión | Manual |
| TC-MAN-02 | Registro con migración | Estando offline con datos, registrarse | Datos aparecen en Railway | Manual |
| TC-MAN-03 | Sync automático | Con cuenta, crear tarea offline → reconectar | Tarea aparece en Railway | Manual |
| TC-MAN-04 | Pull al abrir app | Desde otro dispositivo, crear tarea → abrir app en primer dispositivo | Tarea aparece | Manual |
| TC-MAN-05 | Persistencia de sesión | Cerrar y reabrir app | Sesión activa, mismo usuario | Manual |

## 3.6 App — Prueba visual (migración)

| ID | Caso | Pasos | Resultado esperado | Tipo |
| --- | --- | --- | --- | --- |
| TC-VIS-01 | Onboarding primera vez | Instalar app, abrir primera vez | Se muestran 2 pantallas de onboarding | Manual |
| TC-VIS-02 | Onboarding no se repite | Cerrar y reabrir app | No se muestra onboarding | Manual |
| TC-VIS-03 | FocusScreen con timer | Tocar "Iniciar Cronómetro" | Timer corre, botón cambia a "Pausar" | Manual |
| TC-VIS-04 | TaskList bento grid | Tener 3+ tareas activas | Se ven tarjetas de distintos tamaños | Manual |
| TC-VIS-05 | Completar paso con celebración | Completar paso desde FocusScreen | Aparece StepCompleteScreen con confetti | Manual |
| TC-VIS-06 | GlassTabBar | Navegar entre tabs | Barra flotante, tab activo resaltado | Manual |
| TC-VIS-07 | Perfil y configuración | Ir a Perfil, cambiar duración default | Selector funcional, cambio persiste | Manual |
| TC-VIS-08 | Insignias | Ir a Insignias desde Historial | Galería con desbloqueadas/bloqueadas | Manual |

# 4. Bugs Conocidos (E1 → E2)

| ID | Descripción | Severidad | Estado | Módulo |
| --- | --- | --- | --- | --- |
| BUG-01 | El timer no persiste al cerrar la app | Baja | Abierto — por diseño | Timer |
| BUG-02 | Fecha límite se ingresa manualmente (YYYY-MM-DD), no hay date picker | Media | Abierto — mejora UX | TaskForm |
| BUG-03 | Sin feedback visual al completar paso (E1) | Baja | Resuelto en E2 — celebración | FocusScreen |
| BUG-04 | No hay confirmación visual al crear tarea | Baja | Abierto — mejora UX | TaskForm |

# 5. Bugs Detectados en E2

| ID | Descripción | Severidad | Estado | Módulo |
| --- | --- | --- | --- | --- |
| — | — | — | Sin detectar | — |

*Este espacio se completa durante el desarrollo de E2.*

# 6. Resultados de Ejecución

*Este espacio se completa después de ejecutar los tests.*

| Fecha | TC ejecutados | Pasaron | Fallaron | % Éxito |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

*StepUp — Testing E2 — Versión 1.0 — Julio 2026*

*Ingeniería en Sistemas de Información*
