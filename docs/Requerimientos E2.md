**StepUp**

*Documento de Requerimientos — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Julio 2026*

# 1. Introducción

## 1.1 Propósito del documento

Este documento describe los requerimientos funcionales y no funcionales correspondientes a la segunda entrega (E2) del proyecto StepUp. Define el alcance de las funcionalidades a implementar entre Julio y Agosto 2026, las historias de usuario con sus criterios de aceptación, y los cambios respecto a la Entrega 1.

Este documento complementa al documento de Requerimientos E1. Las funcionalidades de E1 siguen vigentes; E2 agrega nuevas capacidades sobre esa base.

## 1.2 Alcance de la Entrega 2

La Entrega 2 agrega dos tracks principales sobre la base funcional de E1:

**Track A — Migración visual al sistema de diseño Zenith Vitality:**
- Rediseño completo de la interfaz con nueva paleta de colores, tipografía y componentes
- Nuevas pantallas: onboarding, notificaciones, perfil, insignias, loading, celebración
- Navegación con GlassTabBar flotante
- Animaciones y micro-interacciones

**Track B — Backend + Autenticación + Sincronización:**
- API REST con Node.js + Express + Prisma + PostgreSQL
- Cuentas de usuario con registro/login JWT
- Sincronización offline-first: el usuario puede usar la app sin cuenta
- Al registrarse, los datos locales se migran al servidor

**Excluido de E2:** notificaciones push (FCM), sugerencia de pasos con IA, dashboard de estadísticas avanzadas — planificado para E3.

# 2. Funcionalidades implementadas en E2

## 2.1 Track A — Migración visual

### 2.1.1 Sistema de diseño centralizado

Se crea un sistema de theme con colores, tipografía, espaciado, bordes y sombras que todas las pantallas consumen. Se cargan las fuentes Manrope (títulos) y Plus Jakarta Sans (cuerpo) mediante expo-font.

### 2.1.2 Componentes reutilizables

Se extraen componentes UI compartidos: Button (3 variantes), Card, Badge, TextField, ProgressBar, ProgressRing, StepItem, TimerWidget, GlassTabBar, EmptyState, ConfettiOverlay. Cada componente soporta variantes, estados y personalización por props.

### 2.1.3 Pantallas rediseñadas

Las 6 pantallas de E1 se migran al nuevo diseño:
- FocusScreen con widget timer glassmorpho y anillos animados
- TaskListScreen con diseño bento grid (tarjetas destacadas, mini-tarjetas, gráfico semanal)
- TaskDetailScreen con hero de tarea, progreso, checkboxes animados y botón flotante
- TaskFormScreen con glass card para pasos y validación
- StepFormScreen con pills de duración y drag-and-drop
- HistoryScreen con gráfico de línea bezier, logros XP y racha

### 2.1.4 Pantallas nuevas

Se agregan 7 pantallas que no existían en E1:
- Onboarding Concepto ("Un paso a la vez")
- Onboarding Comenzar ("Tu flujo comienza aquí")
- Permiso de Notificaciones (2 variantes: ripple ping y calm-wave)
- Loading / Splash animado
- Perfil de usuario con configuración
- Celebración de paso completado con confetti
- Galería de Insignias

### 2.1.5 Navegación

Se reemplaza la BottomTabBar estándar por un GlassTabBar flotante estilo glassmorph con 3-4 tabs. Se agrega stack de onboarding condicional (solo primera ejecución).

## 2.2 Track B — Backend

### 2.2.1 Autenticación

Registro e inicio de sesión con email y contraseña. JWT con vencimiento a 30 días. Persistencia de sesión en AsyncStorage.

### 2.2.2 API REST de tareas y pasos

Endpoints CRUD protegidos por JWT. Cada usuario solo accede a sus propios datos. Las operaciones replican la lógica de negocio de E1 del lado servidor.

### 2.2.3 Sincronización offline-first

Arquitectura híbrida:
- Sin cuenta: la app funciona exactamente como E1, con SQLite local
- Con cuenta: los datos existentes se migran al servidor al registrarse
- Push: envía cambios locales al servidor
- Pull: trae cambios del servidor desde la última sincronización
- Resolución de conflictos: last-write-wins

# 3. Historias de Usuario

## 3.1 Track A — Migración visual

| ID | Historia de Usuario | Criterios de Aceptación | Prioridad | Puntos |
| --- | --- | --- | --- | --- |
| HU-16 | Como usuario quiero ver una pantalla de onboarding la primera vez que abro la app para entender el concepto antes de empezar. | 1) Al primer arranque se muestran 2 pantallas de onboarding.2) La segunda tiene un botón "Empezar" que lleva a la app.3) Al cerrar el onboarding no se vuelve a mostrar. | Alta | 5 |
| HU-17 | Como usuario quiero que la pantalla de enfoque muestre un temporizador circular con diseño moderno para concentrarme en el tiempo restante. | 1) El timer se muestra en un círculo glassmorpho con anillos animados.2) Muestra MM:SS en el centro.3) Los botones cambian de verde a azul al pausar. | Alta | 8 |
| HU-18 | Como usuario quiero ver mis tareas en un diseño de tarjetas visuales tipo bento grid para tener una vista más clara y organizada. | 1) Las tareas se muestran en tarjetas de distintos tamaños.2) La tarea urgente aparece destacada.3) Hay un gráfico semanal de ritmo. | Alta | 8 |
| HU-19 | Como usuario quiero que los pasos de una tarea tengan checkboxes animados para sentir feedback visual al completarlos. | 1) Al completar un paso el checkbox tiene animación.2) El paso se tacha visualmente.3) El paso activo se resalta con borde naranja. | Media | 5 |
| HU-20 | Como usuario quiero una barra de navegación inferior flotante con diseño glass para una experiencia moderna y consistente. | 1) La barra es flotante, centrada y separada de los bordes.2) Tiene fondo semitransparente con blur.3) La pestaña activa se resalta visualmente. | Media | 5 |
| HU-21 | Como usuario quiero una pantalla de celebración con confetti al completar un paso para recibir feedback positivo inmediato. | 1) Al completar un paso aparece una pantalla con check animado.2) Tiene confetti flotando.3) Muestra el siguiente paso como CTA. | Baja | 3 |
| HU-22 | Como usuario quiero un perfil donde pueda configurar la duración default de los pasos para no tener que cambiarla siempre. | 1) En el perfil hay un selector 5/10/15 minutos.2) Al crear un paso nuevo se preselecciona esa duración. | Baja | 3 |

## 3.2 Track B — Backend

| ID | Historia de Usuario | Criterios de Aceptación | Prioridad | Puntos |
| --- | --- | --- | --- | --- |
| HU-23 | Como usuario quiero crear una cuenta con nombre, email y contraseña para tener mis tareas guardadas en la nube. | 1) El formulario de registro valida email y contraseña.2) Al registrarme, mis tareas locales se suben al servidor.3) Recibo un token que mantiene mi sesión. | Alta | 8 |
| HU-24 | Como usuario quiero iniciar sesión con mi email y contraseña para acceder a mis tareas desde cualquier dispositivo. | 1) El login valida credenciales contra el servidor.2) Si son correctas, redirige a la pantalla principal.3) Si no, muestra error sin revelar si el email existe. | Alta | 5 |
| HU-25 | Como usuario quiero crear tareas sin conexión a internet y que se sincronicen automáticamente después para poder usar la app siempre. | 1) Sin conexión, la app funciona exactamente como E1.2) Al recuperar conexión, las tareas nuevas se suben al servidor.3) El usuario no necesita hacer nada manualmente. | Alta | 8 |
| HU-26 | Como usuario quiero que al registrarme en un dispositivo nuevo, mis tareas del servidor aparezcan automáticamente para retomar donde dejé. | 1) Al hacer login en un dispositivo nuevo, se hace pull de todas las tareas.2) Las tareas aparecen en la lista inmediatamente. | Alta | 5 |
| HU-27 | Como usuario quiero mantener mi sesión iniciada entre usos de la app para no tener que loguearme cada vez. | 1) Al cerrar y reabrir la app, sigo logueado.2) Solo si el token expiró (30 días) pide login de nuevo. | Media | 3 |

## 3.3 Resumen de estimación

| Categoría | Detalle |
| --- | --- |
| Historias de prioridad Alta (Track A) | 2 historias — 13 puntos |
| Historias de prioridad Alta (Track B) | 4 historias — 26 puntos |
| Historias de prioridad Media | 2 historias — 10 puntos |
| Historias de prioridad Baja | 2 historias — 6 puntos |
| Total E2 | 10 historias nuevas — 55 puntos |

# 4. Requerimientos No Funcionales

| Requerimiento | Descripción |
| --- | --- |
| RFN-07 — Persistencia remota | Los datos del usuario autenticado se almacenan en PostgreSQL en Railway. |
| RFN-08 — Sync automática | La sincronización ocurre al abrir la app y al cerrarla, sin intervención del usuario. |
| RFN-09 — Offline-first | La app debe funcionar al 100% sin conexión, incluso con cuenta creada. |
| RFN-10 — Tiempo de sync | La sincronización no debe tardar más de 5 segundos en condiciones normales de red. |
| RFN-11 — Diseño consistente | Todas las pantallas deben usar el sistema de diseño Zenith Vitality. |
| RFN-12 — Fuentes | Las fuentes Manrope y Plus Jakarta Sans deben cargarse al iniciar la app. |

# 5. Cambios y Ajustes Respecto a E1

| Elemento | Descripción | Estado |
| --- | --- | --- |
| Diseño visual | Se reemplaza el diseño funcional de E1 por el sistema Zenith Vitality con glassmorphism, nueva paleta y componentes. | En curso |
| Navegación | Bottom tabs estándar → GlassTabBar flotante. | En curso |
| Backend | Se agrega API REST con Node.js + Express + Prisma + PostgreSQL. Nuevo para E2. | Planificado |
| Autenticación | Se agrega registro/login con JWT. No existía en E1 (offline puro). | Planificado |
| Sync | Se agrega sincronización offline-first híbrida. No existía en E1. | Planificado |
| Onboarding | Se agregan 2 pantallas de onboarding para primera ejecución. No existía en E1. | En curso |
| Perfil e insignias | Se agregan pantallas de perfil, configuración y galería de insignias. | En curso |

# 6. Glosario (adiciones a E1)

| Término | Definición |
| --- | --- |
| Zenith Vitality | Sistema de diseño visual de StepUp: paleta de colores, tipografía (Manrope + Jakarta Sans), componentes y glassmorphism. |
| Glassmorphism | Estilo visual con fondos semitransparentes, blur y bordes sutiles. |
| Bento grid | Diseño de cuadrícula con celdas de distintos tamaños. |
| JWT | JSON Web Token, estándar de autenticación sin estado. |
| Sync | Sincronización de datos entre el dispositivo local (SQLite) y el servidor (PostgreSQL). |
| Offline-first | Principio de diseño donde la app funciona sin conexión y sincroniza cuando hay red. |
| Last-write-wins | Estrategia de resolución de conflictos: el último cambio prevalece. |

*StepUp — Requerimientos E2 — Versión 1.0 — Julio 2026*

*Ingeniería en Sistemas de Información*
