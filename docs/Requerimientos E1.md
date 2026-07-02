**StepUp**

*Documento de Requerimientos — Entrega 1*

Iteración 1

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Junio 2026*

# **1. Introducción**

## **1.1 Propósito del documento**

Este documento describe los requerimientos funcionales y no funcionales correspondientes a la primera entrega (E1) del proyecto StepUp. Define el alcance exacto de las funcionalidades a implementar durante los primeros tres meses, las historias de usuario con sus criterios de aceptación, y las restricciones técnicas aplicables.

Este documento es la fuente de verdad para el equipo de desarrollo durante la iteración 1 y sirve como base para los casos de prueba y el criterio de aceptación de la entrega.

## **1.2 Alcance de la Entrega 1**

La Entrega 1 es una aplicación mobile standalone que funciona completamente offline. No requiere backend, ni cuenta de usuario, ni conexión a internet. Toda la lógica y los datos residen en el dispositivo mediante SQLite.

**Incluido en E1:** gestión de tareas (CRUD), división manual en pasos, vista de solo el próximo paso, timer opcional por paso, historial de tareas completadas, y contador diario de pasos.

**Excluido de E1:** autenticación, backend, sincronización en la nube, notificaciones push, sugerencia de pasos con IA, estadísticas avanzadas.

## **1.3 Contexto del proyecto**

StepUp es una aplicación anti-procrastinación cuyo diferencial es mostrar al usuario únicamente el próximo paso concreto de 5 a 15 minutos, en lugar de la tarea completa. El objetivo es reducir la barrera cognitiva (task paralysis) que impide arrancar con tareas grandes o complejas.

# **2. Funcionalidades implementadas en E1**

Las siguientes cuatro áreas funcionales cubren el ciclo completo de uso de StepUp en la Entrega 1:

## **2.1 Módulo 1 — Gestión de Tareas**

Permite al usuario crear, visualizar, editar y eliminar tareas. Una tarea representa un objetivo que el usuario necesita completar y que puede dividirse en pasos.

* **Crear tarea:** nombre obligatorio + fecha límite opcional.
* **Listar tareas activas:** vista de todas las tareas pendientes con indicador de pasos.
* **Editar tarea:** modificar nombre y/o fecha límite.
* **Eliminar tarea:** con confirmación; elimina también todos sus pasos.
* **Completar tarea:** disponible solo cuando todos sus pasos están completados.

## **2.2 Modulo 2 — División en Pasos**

El núcleo de StepUp. Permite dividir cada tarea en pasos pequeños y accionables, con duración estimada opcional.

* **Agregar paso:** nombre obligatorio + duración en minutos (opcional).
* **Listar pasos:** en orden, con distinción clara del próximo paso pendiente.
* **Editar paso:** modificar nombre y duración.
* **Eliminar paso:** actualiza automáticamente los contadores de la tarea.
* **Reordenar pasos:** cambiar el orden de ejecución.
* **Completar paso:** solo el paso actual; avanza automáticamente al siguiente.

## **2.3 Módulo 3 — Vista Foco (pantalla principal)**

La pantalla principal de StepUp. Muestra exclusivamente el próximo paso pendiente, ocultando el resto de la lista para eliminar la sensación de aburrimiento.

* **Vista de un solo paso:** nombre y duración estimada del paso actual.
* **Timer opcional:** cuenta regresiva si hay duración estimada, cuenta progresiva si no la hay. El usuario puede completar el paso sin activar el timer.
* **Avance automático:** al confirmar un paso completado, aparece el siguiente sin navegar.
* **Estado sin pasos:** si la tarea no tiene pasos asignados, se muestra un mensaje guia.

## **2.4 Módulo 4 — Historial y Seguimiento**

Registra el progreso del usuario y permite ver lo que logro.

* **Historial de tareas:** lista de tareas completadas con fecha de completado y cantidad de pasos que tenía.
* **Contador diario:** cantidad de pasos completados en el día actual, visible en la pantalla principal.

# **3. Historias de Usuario**

Las historias están priorizadas con el método MoSCoW simplificado en Alta / Media / Baja. Los puntos de historia siguen la escala de Fibonacci (1, 2, 3, 5, 8).

## **3.1 Modulo 1 — Gestion de Tareas**

| **ID** | **Historia de Usuario** | **Criterios de Aceptacion** | **Prioridad** | **Puntos** |
| --- | --- | --- | --- | --- |
| HU-01 | Como usuario quiero crear una nueva tarea con nombre y fecha límite para registrar lo que tengo que hacer. | 1) El campo nombre es obligatorio.2) La fecha límite es opcional.3) La tarea se guarda localmente y aparece en la lista. | **Alta** | 5 |
| HU-02 | Como usuario quiero ver la lista de todas mis tareas activas para saber que tengo pendiente. | 1) Se muestran todas las tareas no completadas.2) Se indica la cantidad de pasos pendientes por tarea.3) Se puede distinguir tareas sin pasos asignados. | **Alta** | 3 |
| HU-03 | Como usuario quiero editar el nombre o la fecha limite de una tarea existente para corregir informacion. | 1) Los cambios se persisten inmediatamente.2) No se pueden dejar sin nombre. | **Media** | 2 |
| HU-04 | Como usuario quiero eliminar una tarea para quitarla de mi lista cuando ya no es relevante. | 1) Se solicita confirmacion antes de eliminar.2) Al eliminar la tarea se eliminan tambien todos sus pasos. | **Media** | 2 |
| HU-05 | Como usuario quiero marcar una tarea completa cuando todos sus pasos esten terminados para registrar el logro. | 1) Solo se puede marcar completa si todos sus pasos estan completados.2) La tarea pasa al historial al marcarse completa. | **Alta** | 3 |

## **3.2 Modulo 2 — Division en Pasos**

| **ID** | **Historia de Usuario** | **Criterios de Aceptacion** | **Prioridad** | **Puntos** |
| --- | --- | --- | --- | --- |
| HU-06 | Como usuario quiero agregar pasos a una tarea con nombre y duracion estimada para dividirla en partes manejables. | 1) El nombre del paso es obligatorio.2) La duracion estimada es opcional (en minutos).3) El paso queda asociado a la tarea y aparece en la lista de pasos. | **Alta** | 5 |
| HU-07 | Como usuario quiero ver los pasos de una tarea en orden para saber la secuencia de trabajo. | 1) Los pasos se muestran en orden de creacion.2) Se distingue claramente el proximo paso pendiente. | **Alta** | 3 |
| HU-08 | Como usuario quiero reordenar los pasos de una tarea para ajustar la secuencia segun mis necesidades. | 1) Se puede cambiar el orden arrastrando o con controles.2) El nuevo orden se persiste. | **Baja** | 3 |
| HU-09 | Como usuario quiero editar o eliminar un paso existente para corregirlo o quitarlo. | 1) Se puede editar nombre y duracion.2) Al eliminar un paso se actualiza el contador de la tarea.3) No se puede eliminar el unico paso de una tarea en progreso. | **Media** | 2 |
| HU-10 | Como usuario quiero marcar un paso como completado para registrar mi avance. | 1) Solo se puede completar el paso actual (el primero pendiente).2) Al completarlo aparece el siguiente paso automaticamente.3) Se muestra animacion o feedback visual de confirmacion. | **Alta** | 5 |

## **3.3 Modulo 3 — Vista Foco**

| **ID** | **Historia de Usuario** | **Criterios de Aceptacion** | **Prioridad** | **Puntos** |
| --- | --- | --- | --- | --- |
| HU-11 | Como usuario quiero ver una pantalla que me muestre unicamente el proximo paso pendiente para no abrumarme con todo lo que falta. | 1) La pantalla principal muestra solo el nombre y duracion del paso actual.2) No se muestra la lista de pasos restantes.3) Si no hay pasos pendientes se indica el estado. | **Alta** | 5 |
| HU-12 | Como usuario quiero iniciar un timer opcional para el paso actual para llevar el tiempo de trabajo. | 1) El timer muestra cuenta regresiva basada en la duracion estimada del paso.2) Si el paso no tiene duracion, el timer cuenta hacia arriba.3) Al vencer el timer se emite una alerta.4) El usuario puede completar el paso sin usar el timer. | **Media** | 5 |
| HU-13 | Como usuario quiero que al completar un paso la app me muestre el siguiente automaticamente para mantener el flujo de trabajo. | 1) Luego de confirmar el paso completo aparece el siguiente sin navegar.2) Si era el ultimo paso, se sugiere marcar la tarea completa. | **Alta** | 3 |

## **3.4 Modulo 4 — Historial y Seguimiento**

| **ID** | **Historia de Usuario** | **Criterios de Aceptacion** | **Prioridad** | **Puntos** |
| --- | --- | --- | --- | --- |
| HU-14 | Como usuario quiero ver el historial de tareas completadas para registrar lo que logre. | 1) Se muestran las tareas completadas con fecha de completado.2) Se indica la cantidad de pasos que tenia cada tarea. | **Media** | 3 |
| HU-15 | Como usuario quiero ver cuantos pasos complete hoy para tener nocion de mi productividad diaria. | 1) En la pantalla principal se muestra un contador de pasos completados en el dia.2) El contador se reinicia a las 0hs. | **Baja** | 2 |

## **3.5 Resumen de estimacion**

| **Categoria** | **Detalle** |
| --- | --- |
| Historias de prioridad Alta | 10 historias — 38 puntos |
| Historias de prioridad Media | 4 historias — 14 puntos |
| Historias de prioridad Baja | 1 historia — 5 puntos |
| Total E1 | 15 historias — 57 puntos |
| Velocidad estimada por sprint (2 semanas) | ~14-18 puntos |
| Sprints estimados para E1 | 3-4 sprints |

# **4. Requerimientos No Funcionales**

| **Requerimiento** | **Descripcion** |
| --- | --- |
| RFN-01 — Persistencia local | Todos los datos se almacenan en SQLite en el dispositivo. No se requiere conexion a internet. |
| RFN-02 — Rendimiento | Las pantallas deben cargar en menos de 1 segundo en un dispositivo Android de gama media. |
| RFN-03 — Plataforma | La app corre en Android 10 o superior. Compatibilidad iOS es secundaria en E1. |
| RFN-04 — Offline-first | La app funciona completamente sin conexion. Toda la logica esta en el cliente. |
| RFN-05 — Usabilidad | Las acciones principales (crear tarea, agregar paso, completar paso) deben realizarse en 3 toques o menos. |
| RFN-06 — Datos | La base de datos no debe exceder 50MB en uso normal. Los datos persisten al cerrar y reabrir la app. |

# **5. Modelo de Datos — SQLite E1**

La base de datos local de E1 tiene tres tablas principales. Las relaciones son simples: una tarea tiene muchos pasos, y muchos registros de completado.

## **5.1 Tabla: tasks**

| **Campo** | **Descripcion** |
| --- | --- |
| id | INTEGER PRIMARY KEY AUTOINCREMENT |
| name | TEXT NOT NULL — nombre de la tarea |
| due\_date | TEXT (ISO 8601, nullable) — fecha limite |
| status | TEXT — 'active' | 'completed' |
| created\_at | TEXT (ISO 8601) — fecha de creacion |
| completed\_at | TEXT (ISO 8601, nullable) — fecha de completado |

## **5.2 Tabla: steps**

| **Campo** | **Descripcion** |
| --- | --- |
| id | INTEGER PRIMARY KEY AUTOINCREMENT |
| task\_id | INTEGER NOT NULL — FK a tasks.id (CASCADE DELETE) |
| name | TEXT NOT NULL — descripcion del paso |
| duration\_min | INTEGER (nullable) — duracion estimada en minutos |
| order\_index | INTEGER NOT NULL — posicion en la secuencia |
| status | TEXT — 'pending' | 'completed' |
| completed\_at | TEXT (ISO 8601, nullable) |

## **5.3 Tabla: daily\_progress**

| **Campo** | **Descripcion** |
| --- | --- |
| id | INTEGER PRIMARY KEY AUTOINCREMENT |
| date | TEXT (ISO 8601) — fecha del registro (YYYY-MM-DD) |
| steps\_completed | INTEGER NOT NULL DEFAULT 0 — pasos completados en esa fecha |

*Nota: daily\_progress puede reemplazarse en E2 por una query sobre steps.completed\_at. En E1 se usa tabla separada para simplicidad.*

# **6. Criterios de Aceptacion de la Entrega 1**

La Entrega 1 se considera exitosa si cumple todos los criterios de la siguiente lista. Los criterios obligatorios deben cumplirse al 100%. Los deseables son opcionales pero suman valor.

## **6.1 Criterios obligatorios**

1. **Funcionalidad core completa:** el usuario puede crear una tarea, dividirla en pasos y completar pasos desde la vista foco sin errores.
2. **Persistencia:** los datos sobreviven al cierre y reapertura de la app.
3. **Sin conexion:** la app funciona al 100% en modo avion.
4. **Fecha limite:** el usuario puede asignar y editar una fecha limite a cualquier tarea.
5. **Timer opcional:** el timer puede activarse o ignorarse sin afectar la capacidad de completar el paso.
6. **Historial:** las tareas completadas aparecen en la seccion de historial.
7. **Android:** la app corre sin errores en un dispositivo fisico Android 10 o superior.
8. **Repositorio:** el codigo esta en GitHub en la rama main con README funcional.

## **6.2 Criterios deseables**

* **iOS:** la app corre sin crashes criticos en iOS (Expo go o build).
* **Reordenar pasos:** la historia HU-08 esta implementada.
* **Contador diario:** la historia HU-15 esta implementada.
* **Feedback visual:** animacion al completar un paso.

# **7. Cambios y Ajustes Respecto al Plan Original**

| **Elemento** | **Descripcion** | **Estado** |
| --- | --- | --- |
| Autenticacion en E1 | Se decidio eliminar el registro/login de E1. La app arranca directo con un perfil local unico. Se incorporara en E2 con el backend. | Confirmado |
| Timer por paso | Se cambio de obligatorio a opcional. El usuario puede completar cualquier paso sin activar el timer, lo que reduce friction y mejora la UX. | Confirmado |
| Fecha limite | Se incorporo a E1 (estaba en discusion). Agrega valor sin complejidad significativa. | Confirmado |
| Foco del producto | El profesor indicó que la app debe enfocarse mas en el organizar/dividir tareas que en el aspecto de recordatorios. El pivot quedó reflejado en el Inception Deck reformulado. | Confirmado |

# **8. Glosario**

| **Termino** | **Definicion** |
| --- | --- |
| Tarea | Objetivo de alto nivel que el usuario quiere completar. Contiene uno o mas pasos. |
| Paso | Unidad de trabajo concreta, accionable, de 5 a 15 minutos estimados. Pertenece a una tarea. |
| Vista Foco | Pantalla principal de StepUp. Muestra exclusivamente el proximo paso pendiente. |
| Task Paralysis | Estado cognitivo en que una tarea grande parece tan abrumadora que el usuario no puede empezarla. |
| Proximo paso | El primer paso con status 'pending' de la tarea activa, en orden de order\_index. |
| Timer | Cuenta regresiva (con duracion estimada) o progresiva (sin duracion) asociada a un paso. |
| Historial | Lista de tareas cuyo status es 'completed', ordenadas por completed\_at descendente. |
| E1 / E2 / E3 / E4 | Entregas del proyecto. E1 cubre los meses 1 a 3. |
| SQLite | Motor de base de datos relacional embebido en el dispositivo, sin servidor. |
| Offline-first | Principio de diseno donde la app funciona completamente sin conexion a internet. |

*StepUp — Requerimientos E1 — Version 1.0 — Junio 2026*

*Ingenieria en Sistemas de Informacion*