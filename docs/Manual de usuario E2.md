**StepUp**

*Manual de Usuario — Entrega 3*

Iteración 3 | Julio – Noviembre 2026

Ingeniería en Sistemas de Información | 2026

*Versión 2.0 | Noviembre 2026*

# 1. Introducción

## 1.1 Qué es StepUp

StepUp es una app de productividad que aplica la técnica de **fragmentación de metas**: divide tus objetivos grandes en pasos pequeños y accionables, y te acompaña para completarlos uno a la vez.

## 1.2 Qué incluye la E3

Todo lo de la E2, más:

- **Asistente de descripción con IA**: al crear una tarea, un botón te ayuda a estructurar el contexto (temas, requisitos, objetivos)
- **Sugerencia de pasos con IA**: la app propone 3 a 8 pasos accionables de 5 a 25 minutos según el tamaño de la tarea
- **Generación de pasos desde el detalle**: en una tarea existente con descripción, podés generar pasos adicionales con IA
- **Campo de descripción persistente**: cada tarea puede tener un texto de contexto que se sincroniza con el backend
- **Flujo offline resiliente**: los botones de IA solo aparecen cuando hay conexión y sesión activa; el flujo manual nunca se bloquea

# 2. Instalación y puesta en marcha

## 2.1 Requisitos

- **App:** dispositivo Android (Expo Go) o navegador web (versión de desarrollo)
- **Backend:** desplegado en Render.com + Neon (URL de producción incluida en la build de demo)

## 2.2 Correr la app

```bash
npm install
npx expo start
```

- En Expo Go: escanear el QR
- En web: tecla `w` (o usar el modo demo con datos de ejemplo: `EXPO_PUBLIC_SEED_DB=true`)

# 3. Primer uso

## 3.1 Onboarding

Al abrir la app por primera vez se muestran 2 pantallas:

1. **"Un paso a la vez"** — el concepto de fragmentar metas en pasos pequeños
2. **"Tu flujo comienza aquí"** — invitación a crear tu primera tarea

Luego se pide el permiso de notificaciones ("Libera tu mente").

## 3.2 Sin cuenta (offline)

En la pantalla de bienvenida podés tocar **"Explorar sin cuenta"**: la app funciona igual que en E1, guardando todo en el dispositivo. Podés crear una cuenta más adelante y migrar tus datos.

# 4. Navegación

La barra inferior flotante tiene 4 secciones:

| Sección | Función |
| --- | --- |
| **Ahora (Focus)** | Timer por pasos: elegí un paso, arrancá el cronómetro y completalo |
| **Tareas** | Lista de tareas con sus pasos (bento grid); crear, editar, reordenar y completar |
| **Historial** | Registro diario de pasos completados e insignias |
| **Perfil** | Avatar, duración default del timer, resolver conflictos de sync y cerrar sesión |

## 4.1 Crear una tarea

1. Ir a **Tareas** → tocar el botón flotante **+**
2. Escribir el **nombre** de la tarea (requerido)
3. **(Opcional) Escribir una descripción** — contexto para que la IA sugiera mejores pasos (máx. 1000 caracteres)
4. **(Opcional) Tocar "Ayudame a describir"** — la IA te muestra una estructura de secciones con preguntas guía para completar la descripción
5. **(Opcional) Tocar "Sugerir pasos con IA"** — aparece un borrador con 3 a 8 pasos, cada uno con nombre y duración estimada
   - Podés editar, borrar o agregar pasos al borrador
   - Podés tocar **"Otra propuesta"** para regenerar la secuencia completa
   - Si tocás "Crear tarea" sin confirmar el borrador, la tarea se crea sin pasos
6. **(Opcional) Agregar fecha límite**
7. Tocar **"Crear tarea"** — la tarea y sus pasos nacen juntos en una sola acción

> Si estás **offline** o **sin sesión**, los botones de IA no aparecen. La creación manual funciona igual que siempre.

## 4.2 Completar un paso

1. Ir a **Ahora (Focus)**
2. Seleccionar la tarea y el paso a trabajar
3. Tocar **"Iniciar Cronómetro"** (pausar/reanudar cuando quieras)
4. Tocar **"Completar"** — el paso queda registrado y aparece el siguiente automáticamente

El paso completado queda registrado en el Historial.

## 4.3 Generar pasos con IA en una tarea existente

Si una tarea ya creada tiene descripción guardada, podés pedirle a la IA que sugiera pasos adicionales:

1. Ir a **Tareas** → tocar la tarea para abrir su detalle
2. Tocar **"Generar pasos con IA"** (aparece debajo de la descripción)
3. Revisar el borrador: editar, borrar o regenerar ("Otra propuesta")
4. Tocar **"Agregar N pasos a la tarea"** — los pasos se suman a los que ya tiene (no los reemplaza)

> Si la tarea no tiene descripción, aparece un botón **"Escribí una descripción para usar la IA"** que te lleva al formulario de edición.

# 5. Cuenta y sincronización

## 5.1 Registrarse

En la pantalla de bienvenida tocá **"Crear cuenta"** e ingresá nombre, email y contraseña (mínimo 8 caracteres).

> Los datos que ya tenías en el dispositivo se **migran automáticamente** a tu cuenta.

## 5.2 Cómo funciona la sincronización

- La app guarda todo **primero en el dispositivo** (funciona sin conexión)
- Al **abrir** la app descarga los cambios recientes desde el servidor
- Al **cerrar** (o al abrir) envía los cambios locales pendientes
- Si un dato se modificó a la vez en dos lugares, se guarda como **conflicto** y podés elegir cuál versión conservar desde **Perfil → Resolver conflictos**

## 5.3 Inteligencia artificial en la app

La IA se usa en dos momentos:
- **Al crear una tarea**: como asistente de descripción y sugeridor de pasos
- **En el detalle de una tarea**: para generar pasos adicionales

**Requisitos para usar la IA:**
- Tener una sesión activa (haber iniciado sesión)
- Estar conectado a internet

**Qué pasa si falla:**
- Si la IA no responde (servidor saturado, timeout, error), se muestra un mensaje claro y podés reintentar
- **Nunca bloquea la creación manual**: podés seguir creando tareas y pasos a mano en todo momento
- La key de IA vive solo en el backend — nunca se expone en la app

**Los pasos sugeridos son un borrador:**
- No se guardan hasta que toques "Crear tarea" o "Agregar N pasos"
- Si salís sin confirmar, el borrador se descarta

# 6. Pantallas de la app (17)

| Pantalla | Descripción |
| --- | --- |
| Onboarding 1 y 2 | Presentación del concepto y primer flujo |
| Permiso de notificaciones | Ripple ping al habilitar avisos |
| Splash / Loading | Carga animada al abrir la app |
| Welcome | Entrar con cuenta o explorar sin cuenta |
| Login / Register | Iniciar sesión o crear cuenta |
| Focus (Ahora) | Timer por pasos con tarjeta Zen |
| Task List (Tareas) | Bento grid de tareas activas |
| Task Detail | Detalle de tarea con pasos, edición y generación de pasos con IA |
| Task Form | Alta/edición de tarea con descripción y asistente IA |
| Step Form | Alta de paso |
| History | Registro diario de progreso |
| Badges | Galería de insignias |
| Profile | Configuración y cuenta |
| Sync Conflicts | Resolución de conflictos local/servidor |
| Step Complete | Celebración con confetti |

# 7. Solución de problemas

| Problema | Solución |
| --- | --- |
| "Crear cuenta" se cuelga al guardar | Asegurate de tener conexión (la migración llama al backend). Si el servidor de Render estaba dormido (free tier), esperá ~1 min y reintentá |
| La fecha límite no abre un calendario | En web el date picker está disponible en el campo de fecha (versión reciente) |
| Datos que no sincronizan | Revisá conexión y cerrá/reabrí la app para forzar el sync |
| Querés empezar de cero | Desde Perfil podés cerrar sesión; sin cuenta, tus datos quedan solo en el dispositivo |
| Los botones de IA no aparecen | Verificá que tengas sesión activa y conexión a internet. La IA solo funciona con ambos; el flujo manual sigue disponible |
| "No se pudo generar la sugerencia" | El servicio de IA puede estar saturado (429) o caído (502). Esperá unos segundos y tocá "Otra propuesta" o volvé a intentar |
| Los pasos sugeridos no tienen sentido | Revisá la descripción de la tarea: cuanto más contexto des, mejor será la sugerencia. Usá "Ayudame a describir" para estructurarla |

*StepUp — Manual de Usuario E3 — Versión 2.0 — Noviembre 2026*