**StepUp**

*Documento de Arquitectura — Entrega 1*

Iteración 1 | Meses 1-3 | Abril–Mayo 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Mayo 2026*

# **1. Introducción**

## **1.1 Propósito del documento**

Este documento describe el diseño arquitectónico de la Entrega 1 (E1) de StepUp. Registra las decisiones técnicas tomadas, los componentes del sistema, las capas de la aplicación, y la estructura del proyecto. Sirve como referencia para el equipo durante el desarrollo y como entregable formal ante la catedra.

## **1.2 Contexto de la iteración**

**Periodo:** Marzo – Mayo 2026 (Meses 1 a 3 del proyecto).

**Estado del repositorio:** a crear durante el primer sprint de la iteración.

**Plataforma objetivo:** Android 10 o superior (dispositivo físico). iOS es secundario en E1.

**Conectividad:** la aplicación es completamente offline. No existe backend, servidor ni conexión a internet en esta iteración.

# **2. Visión General de la Arquitectura**

StepUp E1 sigue una arquitectura en tres capas dentro de una aplicación mobile de una sola codebase. La separación de capas es lógica, no física, ya que todo corre en el mismo dispositivo del usuario.

![](data:image/gif;base64...)

*Figura 1 — Arquitectura de capas de StepUp E1*

Las tres capas son:

• **Capa de Presentación:** pantallas y componentes React Native. Gestiona la interacción del usuario y el estado visual.

• **Capa de Lógica de Negocio:** servicios TypeScript con las reglas del dominio (crear tareas, completar pasos, calcular progreso). No tiene conocimiento de la UI ni de la base de datos directamente.

• **Capa de Datos:** acceso a SQLite mediante expo-sqlite. Centraliza todas las operaciones de lectura y escritura persistente.

*Nota: En E2 se incorporará un backend Node.js + PostgreSQL como cuarta capa. La arquitectura de E1 está pensada para que esa incorporación no requiera reescribir la lógica de negocio existente.*

# **3. Stack Tecnológico**

| **Tecnología** | **Rol** | **Justificación** |
| --- | --- | --- |
| React Native + Expo | Framework mobile | Permite desarrollar para Android y iOS desde una sola codebase en JavaScript/TypeScript. Expo simplifica el build, el acceso a hardware y las dependencias nativas. |
| TypeScript | Lenguaje | Tipado estático sobre JavaScript. Reduce errores en tiempo de desarrollo y mejora el autocompletado en el IDE. |
| expo-sqlite | Base de datos local | Librería oficial de Expo para acceder a SQLite desde React Native. Sin configuración de servidor, sin dependencias externas. |
| React Navigation | Navegación | Librería estándar del ecosistema para manejar pantallas y transiciones. La estrategia de navegación (tabs / stack) se definirá en el primer sprint. |
| GitHub | Control de versiones | Repositorio remoto con branching strategy: main (estable) / develop / feature-\*. |
| Expo Go / EAS Build | Distribución | Expo Go para desarrollo y pruebas rápidas. EAS Build para generar APK demostrable al cliente/docentes. |

# **4. Componentes del Sistema**

## **4.1 Pantallas (Capa de Presentación)**

| **Pantalla** | **Responsabilidad** | **HU relacionadas** |
| --- | --- | --- |
| FocusScreen | Pantalla principal. Muestra el próximo paso pendiente de la tarea activa, el timer opcional y el botón de completar. | HU-11, HU-12, HU-13 |
| TaskListScreen | Lista todas las tareas activas con nombre, fecha límite y cantidad de pasos pendientes. | HU-02 |
| TaskDetailScreen | Detalle de una tarea: lista de pasos en orden, opciones de editar, reordenar y agregar pasos. | HU-06, HU-07, HU-08, HU-09 |
| HistoryScreen | Lista de tareas completadas con fecha de completado y contador de pasos del día. | HU-14, HU-15 |
| TaskFormScreen | Formulario de creación/edición de tarea (nombre + fecha límite). | HU-01, HU-03 |
| StepFormScreen | Formulario de creación/edición de paso (nombre + duración estimada). | HU-06, HU-09 |

## **4.2 Servicios (Capa de Lógica de Negocio)**

| **Servicio** | **Responsabilidad** |
| --- | --- |
| TaskService | Crear, leer, actualizar y eliminar tareas. Verificar si todos los pasos de una tarea están completados para marcarla como completada. |
| StepService | Agregar, editar, eliminar y reordenar pasos. Marcar el paso actual como completado y determinar el siguiente paso pendiente. |
| TimerService | Manejar la cuenta regresiva o progresiva del timer por paso. Emitir alerta al vencer el tiempo. No persiste datos. |
| ProgressService | Incrementar el contador de pasos completados del día. Consultar el historial de tareas completadas. |

## **4.3 Capa de Datos**

Todos los accesos a SQLite se realizan a través de un módulo centralizado (db.ts) que expone la conexión y ejecuta las migraciones al iniciar la app. Ningún componente de presentación accede directamente a la base de datos; lo hace siempre a través de un servicio.

| **Archivo** | **Responsabilidad** |
| --- | --- |
| db.ts | Inicializa la conexión SQLite y ejecuta migrations.ts al primer arranque. |
| migrations.ts | Define el schema inicial: CREATE TABLE tasks, steps, daily\_progress. Maneja versiones para futuras migraciones en E2. |

# **5. Flujo de Datos — Caso de Uso Principal**

El siguiente diagrama muestra el flujo completo cuando el usuario completa un paso desde la Vista Foco, que es la acción más frecuente y crítica de la aplicación.

![](data:image/gif;base64...)

*Figura 2 — Flujo de datos: completar un paso*

El flujo completo en palabras:

• El usuario toca el botón Completar en la Vista Foco.

• StepService actualiza el status del paso actual a 'completed' y registra el timestamp.

• ProgressService incrementa el contador de daily\_progress para la fecha actual.

• TaskService verifica si todos los pasos de la tarea tienen status 'completed'.

• Si quedan pasos pendientes: la Vista Foco muestra automáticamente el siguiente paso (el de menor order\_index con status 'pending').

• Si era el último paso: TaskService marca la tarea como 'completed' y sugiere al usuario confirmar el cierre de la tarea. La tarea pasa al historial.

# **6. Estructura del Repositorio**

El repositorio se creará en GitHub durante el primer sprint de la iteración. La estructura de carpetas propuesta es la siguiente:

![](data:image/gif;base64...)

*Figura 3 — Estructura de carpetas del proyecto*

## **6.1 Branching strategy**

| **Rama** | **Uso** |
| --- | --- |
| main | Rama de producción. Solo recibe merges desde develop cuando hay una versión estable y demostrable. Esta es la rama que se entrega al docente. |
| develop | Rama de integración. Todo el desarrollo se integra aquí antes de pasar a main. |
| feature/\* | Una rama por historia de usuario o tarea técnica. Ejemplo: feature/HU-01-crear-tarea. Se abre desde develop y se mergea de vuelta a develop vía Pull Request. |

**Regla de oro:** nunca commitear directamente a main. Todo cambio entra por feature → develop → main.

# **7. Decisiones Arquitectónicas**

Esta sección registra las decisiones de diseño tomadas hasta el inicio de la E1, el razonamiento detrás de cada una y las alternativas descartadas.

| **ID** | **Decisión** | **Razonamiento** | **Alternativas descartadas** | **Estado** |
| --- | --- | --- | --- | --- |
| DA-01 | React Native + Expo como stack mobile | El equipo tiene experiencia en JavaScript y React. Expo elimina la complejidad del build nativo (sin Xcode ni Android Studio para el desarrollo inicial). Una sola codebase para Android y iOS. | Flutter (curva de aprendizaje alta en Dart), desarrollo nativo Android puro (sin soporte iOS). | Confirmada |
| DA-02 | SQLite local vía expo-sqlite en E1 (sin backend) | Elimina toda la complejidad de infraestructura en la primera entrega. La app E1 es deployable sin servidor, sin costos, y funciona en cualquier condición de red. La primera entrega es la más critica en terminos de demostrar funcionalidad. | Supabase desde E1 (introduce dependencia de internet y complejidad de auth), AsyncStorage (no relacional, no apto para queries complejas). | Confirmada |
| DA-03 | Arquitectura en 3 capas (presentación / lógica / datos) | Separar la lógica de negocio de la UI facilita el testing unitario de los servicios sin necesidad de renderizar componentes. También facilita el reemplazo de SQLite por llamadas a API en E2 sin tocar las pantallas. | Lógica inline en los componentes (difícil de testear y mantener). | Confirmada |
| DA-04 | TypeScript en lugar de JavaScript puro | El tipado estático reduce bugs en tiempo de desarrollo especialmente con las interfaces de datos (Task, Step). El overhead de configuración es mínimo con Expo. | JavaScript puro (menos seguro, peor experiencia de autocompletado). | Confirmada |
| DA-05 | Navegación a definir en el primer sprint | Bottom tab navigation y stack navigation tienen diferentes implicancias de UX. La decisión se tomará después de prototipar en papel el flujo completo, que es el primer paso del sprint 1. | — | Pendiente — Sprint 1 |

# **8. Ambiente de Desarrollo**

## **8.1 Requisitos para correr el proyecto**

| **Herramienta** | **Versión / Detalle** | **Verificación** |
| --- | --- | --- |
| Node.js | v18 o superior | node --version |
| npm | v9 o superior (incluido con Node) | npm --version |
| Expo CLI | Instalación global vía npm | npm install -g expo-cli |
| Expo Go | App en el dispositivo físico Android | Play Store: 'Expo Go' |
| Git | Para clonar el repositorio | git --version |
| IDE recomendado | Visual Studio Code | Con extensión 'Expo Tools' |

## **8.2 Pasos para levantar el proyecto (draft del README)**

El README definitivo se redactara en la Parte 3 del proceso de entrega. Este es el borrador de los pasos principales:

• **1. Clonar el repo:** git clone https://github.com/[org]/stepup.git

• **2. Instalar dependencias:** npm install

• **3. Iniciar el servidor Expo:** npx expo start

• **4. Escanear el QR:** con la app Expo Go en el dispositivo Android físico.

• **5. La base de datos:** se inicializa automáticamente al primer arranque. No requiere ninguna configuración manual.

## **8.3 Variables de entorno**

En E1 no existen variables de entorno. No hay API keys, URLs de backend ni configuración sensible. Todo es local al dispositivo.

# **9. Evolución hacia la Entrega 2**

La arquitectura de E1 está diseñada para crecer en E2 sin reescrituras. Las siguientes extensiones están previstas:

| **Cambio en E2** | **Estrategia de migración** |
| --- | --- |
| SQLite → PostgreSQL | Los servicios (TaskService, StepService, etc.) exponen interfaces TypeScript. En E2 se crea una implementación alternativa que llama a la API REST en lugar de SQLite. La UI no cambia. |
| Sin auth → JWT | Se agrega una pantalla de login y un interceptor HTTP. El resto del flujo no se modifica. |
| Sin notificaciones → Firebase FCM | Se agrega NotificationService como un nuevo servicio. No afecta la lógica existente. |
| Sin IA → API de IA | Se agrega AIService que llama a Claude Haiku o GPT-4o mini para sugerir pasos. Se incorpora como opción en StepFormScreen. |

*StepUp — Arquitectura E1 — Versión 1.0 — Mayo 2026*

*Ingeniería en Sistemas de Información*