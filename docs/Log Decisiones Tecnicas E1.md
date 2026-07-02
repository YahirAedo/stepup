**StepUp**

*Log de Decisiones Técnicas — Entrega 1*

Iteración 1 | Marzo – Mayo 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Mayo 2026*

# **Introducción**

Este documento registra las decisiones técnicas tomadas durante la Entrega 1 de StepUp. Cada entrada sigue el formato de Architectural Decision Record (ADR) adaptado: contexto, decisión, razonamiento, alternativas descartadas y consecuencias.

El propósito es triple: servir de referencia para el equipo durante el desarrollo, documentar el razonamiento detrás de cada elección para la evaluación académica, y facilitar la incorporación de nuevos integrantes en futuras iteraciones.

# **Resumen de decisiones**

| **ID** | **Decisión** | **Fecha** | **Estado** |
| --- | --- | --- | --- |
| **DT-01** | React Native + Expo como framework mobile | Marzo 2026 | **Confirmada** |
| **DT-02** | TypeScript en lugar de JavaScript puro | Marzo 2026 | **Confirmada** |
| **DT-03** | SQLite local via expo-sqlite (sin backend en E1) | Marzo 2026 | **Confirmada** |
| **DT-04** | Arquitectura en 3 capas: Presentación / Lógica / Datos | Marzo 2026 | **Confirmada** |
| **DT-05** | Estrategia de navegación: por definir en Sprint 1 | Marzo 2026 | **Pendiente** |
| **DT-06** | Timer opcional: sin bloqueo para completar el paso | Abril 2026 | **Confirmada** |
| **DT-07** | Fecha límite de tarea incluida en E1 | Marzo 2026 | **Confirmada** |
| **DT-08** | Android como plataforma de demo principal en E1 | Marzo 2026 | **Confirmada** |

# **Decisiones detalladas**

| **DT-01 React Native + Expo como framework mobile** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | El equipo necesitaba elegir una plataforma de desarrollo mobile para construir StepUp. Los tres integrantes tienen experiencia en JavaScript y React web, pero ninguno tiene experiencia previa en desarrollo mobile nativo. |  |
| **Decisión** | Usar React Native con Expo como framework principal para la aplicación mobile. |  |
| **Razonamiento** | React Native permite usar conocimiento existente de JavaScript y React. Expo elimina la complejidad del build nativo: no se necesita Xcode ni Android Studio para desarrollar y testear. Una sola codebase cubre Android e iOS, y Expo Go permite probar en el dispositivo físico escaneando un QR sin generar APK. |  |
| **Alternativas descartadas** | Flutter (descartado por curva de aprendizaje alta en Dart, lenguaje que ningún integrante conoce). Desarrollo Android nativo en Kotlin (descartado por no tener soporte iOS y mayor complejidad de setup). Ionic/Capacitor (descartado por peor rendimiento en apps con UI compleja). |  |
| **Consecuencias** | Positivo: el equipo puede arrancar a desarrollar sin aprender un lenguaje nuevo.  Positivo: Expo Go acelera el ciclo de prueba en un dispositivo físico.  Positivo: la misma base de codigo funciona en Android e iOS.  Negativo: algunas capacidades nativas avanzadas requieren Expo bare workflow o eject.  A monitorear: el tamaño del APK generado puede ser mayor que una app nativa pura. |  |

| **DT-02 TypeScript en lugar de JavaScript puro** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | Al iniciar el proyecto había que decidir si usar JavaScript o TypeScript. Todos los integrantes conocen JavaScript; TypeScript tiene una curva inicial de configuración pero ofrece tipado estático. |  |
| **Decisión** | Usar TypeScript en toda la codebase desde el inicio del proyecto. |  |
| **Razonamiento** | El tipado estático reduce errores en tiempo de desarrollo, especialmente al trabajar con las interfaces de datos (Task, Step, DailyProgress) que se usan en múltiples capas. El autocompletado mejora la productividad en el IDE. Expo tiene soporte nativo para TypeScript sin configuración adicional significativa. En un equipo de 3 personas trabajando en paralelo, el compilador actúa como documentación viva de las interfaces entre módulos. |  |
| **Alternativas descartadas** | JavaScript puro (descartado por mayor riesgo de bugs en runtime al pasar datos entre servicios y pantallas, y por menor claridad de las interfaces entre módulos del equipo). |  |
| **Consecuencias** | Positivo: errores de tipo detectados en tiempo de compilación, no en runtime.  Positivo: las interfaces (Task, Step) funcionan como documentación del modelo de datos.  Positivo: mejor experiencia de autocompletado en VS Code.  Negativo: overhead inicial de ~1-2 horas para configurar tsconfig y tipar las interfaces base.  A monitorear: algunas librerías de terceros pueden no tener tipos bien definidos. |  |

| **DT-03 SQLite local via expo-sqlite (sin backend en E1)** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | La Entrega 1 necesita persistencia de datos. Las opciones eran: base de datos local en el dispositivo, backend propio desde el inicio, o un BaaS (Backend as a Service) como Supabase. |  |
| **Decisión** | Usar SQLite local mediante expo-sqlite para toda la persistencia de E1. Sin backend, sin servidor, sin conexión a internet. |  |
| **Razonamiento** | Elimina toda la complejidad de infraestructura en la primera entrega, que es la mas crítica en términos de demostrar funcionalidad. La app es 100% deployable sin servidor, funciona en cualquier condición de red, y no tiene costos de hosting. El riesgo de bugs de infraestructura en la demo es cero. Además, SQLite es relacional, lo que permite queries estructuradas sobre las relaciones tasks-steps que AsyncStorage no soportaría bien. |  |
| **Alternativas descartadas** | Supabase desde E1 (descartado: introduce dependencia de internet, autenticación y complejidad de configuración innecesaria para E1). AsyncStorage (descartado: no es relacional, no apto para queries sobre relaciones tasks-steps). Firebase Realtime Database (descartado: mismas razones que Supabase, además de vendor lock-in). |  |
| **Consecuencias** | Positivo: app 100% funcional sin internet, ideal para la demo de E1.  Positivo: cero costos de infraestructura durante el desarrollo.  Positivo: setup inmediato, sin cuentas ni configuraciones externas.  Negativo: los datos no se sincronizan entre dispositivos (por diseño en E1).  A gestionar: la migración a backend en E2 requiere reimplementar los servicios para llamadas HTTP, aunque las interfaces TypeScript están diseñadas para facilitarlo. |  |

| **DT-04 Arquitectura en 3 capas: Presentación / Lógica / Datos** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | Al definir la estructura del proyecto había que decidir como organizar el código: lógica inline en los componentes, o separación en capas bien definidas. |  |
| **Decisión** | Separar el código en tres capas lógicas: pantallas (React Native), servicios de negocio (TypeScript puro), y capa de datos (expo-sqlite). Ningún componente de presentación accede directamente a SQLite. |  |
| **Razonamiento** | La separación permite testear los servicios (TaskService, StepService, etc.) de forma unitaria sin necesidad de renderizar componentes. También facilita enormemente la migración en E2: los servicios se reimplementan para llamar a una API REST sin tocar las pantallas. En un equipo de 3 trabajando en paralelo, la separación de capas reduce los conflictos de merge porque cada integrante trabaja en su capa. |  |
| **Alternativas descartadas** | Lógica inline en componentes (descartado: difícil de testear, difícil de mantener, alta probabilidad de conflictos al trabajar en paralelo). Redux o Zustand para estado global (considerado pero descartado para E1 por agregar complejidad innecesaria; Context API de React es suficiente para la escala de E1). |  |
| **Consecuencias** | Positivo: servicios testeables de forma aislada con Jest.  Positivo: migración a backend en E2 no requiere reescribir las pantallas.  Positivo: menor cantidad de conflictos de merge al trabajar en paralelo.  Negativo: overhead inicial de definir bien las interfaces entre capas.  A monitorear: pasar datos entre capas puede introducir boilerplate; evaluar si Context API es suficiente o si conviene Zustand en E2. |  |

| **DT-05 Estrategia de navegación: por definir en Sprint 1** *Marzo 2026 — Por definir* | | |
| --- | --- | --- |
| **Estado** | **Pendiente** |  |
| **Contexto** | React Navigation soporta múltiples estrategias: bottom tab navigation (tabs fijos abajo), stack navigation (pantallas apiladas), o una combinación de ambas. La elección afecta directamente la UX de la app. |  |
| **Decisión** | Pendiente. Se decide en el primer sprint, después de prototipar el flujo en papel. |  |
| **Razonamiento** | La decisión requiere prototipar primero para evaluar cual estrategia sirve mejor al flujo central de StepUp. La Vista Foco es la pantalla principal; si el usuario tiene que navegar muchos pasos para llegar a ella, la propuesta de valor se pierde. El prototipo en papel resolverá si bottom tabs o stack navigation atiende mejor ese requisito. |  |
| **Alternativas descartadas** | Bottom tab navigation: acceso directo a Vista Foco, Lista y Historial desde cualquier punto. Stack navigation: flujo lineal más natural para crear tarea → agregar pasos → vista foco. Combinación (tabs + stack anidado): más flexible pero más complejo de implementar. |  |
| **Consecuencias** | A definir según el resultado del prototipo en papel del Sprint 1.  Esta decisión impacta directamente en DEV-B1 (configuración de navegación en App.tsx).  Bloquea el inicio de DEV-B1 hasta estar resuelta; prioridad máxima en la primera semana. |  |

| **DT-06 Timer opcional: sin bloqueo para completar el paso** *Abril 2026 — Sprint 2* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | El diseño original consideraba el timer como un elemento central de la Vista Foco. Durante la planificación del Sprint 2 se discutió si el timer debía ser obligatorio (el usuario debía iniciarlo para poder completar el paso) u opcional. |  |
| **Decisión** | El timer es completamente opcional. El usuario puede completar un paso en cualquier momento sin necesidad de iniciar o completar el timer. |  |
| **Razonamiento** | Hacer el timer obligatorio agrega fricción al flujo mas critico de la app: completar un paso. Si el objetivo es reducir la barrera para arrancar, agregar un paso obligatorio antes de poder marcar algo como completo va en contra de la propuesta de valor. El timer es una herramienta de apoyo, no un requisito. Un usuario que quiere completar algo rápido no debería verse forzado a interactuar con el timer. |  |
| **Alternativas descartadas** | Timer obligatorio (descartado: agrega fricción innecesaria y va contra el principio de reducir barreras). Timer inexistente en E1 (considerado y descartado: el timer aporta valor real para usuarios que quieren trabajar en bloques de tiempo). |  |
| **Consecuencias** | Positivo: el flujo de completar un paso es más rápido y natural.  Positivo: usuarios con poco tiempo pueden marcar pasos sin interactuar con el timer.  Positivo: reduce la complejidad de DEV-C1 (FocusScreen) al desacoplar timer de completado.  A monitorear: evaluar en el feedback de E1 si los usuarios usan el timer o lo ignoran. |  |

| **DT-07 Fecha limite de tarea incluida en E1** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | Durante la definición del alcance de E1 había dudas sobre si incluir la fecha límite como campo de la tarea o postergarlo a E2. El campo agrega contexto pero su implementación tiene cierta complejidad (date picker, formato de fecha, visualización). |  |
| **Decisión** | Incluir la fecha limite como campo opcional en la creación y edición de tareas desde E1. |  |
| **Razonamiento** | La fecha límite es uno de los datos más naturales que un usuario quiere asociar a una tarea ('tengo que entregar esto el viernes'). Sin ella, la app pierde contexto de urgencia que es fundamental para priorizar. El costo de implementación es bajo (un date picker y un campo TEXT en SQLite) y no introduce dependencias de backend. Es opcional, por lo que no agrega fricción a usuarios que no la necesitan. |  |
| **Alternativas descartadas** | Postergar a E2 (descartado: la fecha límite es un dato central del modelo de tareas y su ausencia hace la E1 menos útil para usuarios reales). Fecha límite obligatoria (descartado: no todas las tareas tienen una deadline clara). |  |
| **Consecuencias** | Positivo: la app es más útil para usuarios reales desde la primera entrega.  Positivo: el modelo de datos queda completo desde E1 (no requiere migración de schema en E2).  Negativo: aumenta marginalmente el scope de TaskFormScreen en DEV-B3.  A considerar en E2: mostrar indicadores visuales de urgencia (ej: tareas que vencen hoy destacadas en rojo). |  |

| **DT-08 Android como plataforma de demo principal en E1** *Marzo 2026 — Sprint 1* | | |
| --- | --- | --- |
| **Estado** | **Confirmada** |  |
| **Contexto** | El equipo necesitaba definir en que plataforma se garantiza el funcionamiento correcto para la demo de E1, dado que el comportamiento de React Native puede variar entre Android e iOS en algunos aspectos (especialmente notificaciones y navegación). |  |
| **Decisión** | Android es la plataforma de demo principal en E1. iOS es secundario: se apunta a que funcione, pero no se garantiza paridad total en esta entrega. |  |
| **Razonamiento** | Los tres integrantes tienen dispositivos Android físicos disponibles, lo que facilita el testing en dispositivo real sin depender de emuladores. Las notificaciones push (que se incorporan en E2) tienen un comportamiento más predecible en Android. Expo Go funciona igual de bien en ambas plataformas para desarrollo, pero el APK de Android es más fácil de generar y distribuir que un build iOS (que requiere cuenta de Apple Developer de 99 USD/año). |  |
| **Alternativas descartadas** | iOS como plataforma principal (descartado: requiere cuenta Apple Developer, build más complejo, el equipo no tiene Macs dedicadas para build). Paridad completa Android + iOS en E1 (descartado: duplica el esfuerzo de testing y puede generar bugs específicos de plataforma que consuman tiempo de desarrollo crítico). |  |
| **Consecuencias** | Positivo: el equipo puede testear en dispositivos físicos reales sin costo adicional.  Positivo: el APK para la demo es generado fácilmente con EAS Build de Expo.  Negativo: iOS queda como plataforma secundaria; algunos bugs específicos de iOS pueden no detectarse en E1.  A gestionar en E2: cuando se incorporen notificaciones push, el testing en iOS se vuelve prioritario. |  |