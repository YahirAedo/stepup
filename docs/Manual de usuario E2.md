**StepUp**

*Manual de Usuario — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Agosto 2026*

# 1. Introducción

## 1.1 Qué es StepUp

StepUp es una app de productividad que aplica la técnica de **fragmentación de metas**: divide tus objetivos grandes en pasos pequeños y accionables, y te acompaña para completarlos uno a la vez.

## 1.2 Qué incluye la E2

- Rediseño visual completo (sistema **Zenith Vitality**): nueva paleta, tipografía y componentes
- **Onboarding** en la primera ejecución
- **Registro e inicio de sesión** con cuenta
- **Sincronización offline-first**: podés usar la app sin conexión y tus datos se sincronizan cuando te conectás
- **Perfil, insignias y configuración**
- Barra de navegación flotante (**GlassTabBar**) con 4 secciones

# 2. Instalación y puesta en marcha

## 2.1 Requisitos

- **App:** dispositivo Android (Expo Go) o navegador web (versión de desarrollo)
- **Backend:** desplegado en Railway (URL de producción incluida en la build de demo)

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
2. Nombre de la tarea (y opcionalmente fecha límite)
3. Agregar pasos (cada uno con nombre y duración sugerida)
4. Guardar

## 4.2 Completar un paso

1. Ir a **Ahora (Focus)**
2. Seleccionar la tarea y el paso a trabajar
3. Tocar **"Iniciar Cronómetro"** (pausar/reanudar cuando quieras)
4. Tocar **"Completar"** — el paso queda registrado y aparece el siguiente automáticamente

El paso completado queda registrado en el Historial.

# 5. Cuenta y sincronización

## 5.1 Registrarse

En la pantalla de bienvenida tocá **"Crear cuenta"** e ingresá nombre, email y contraseña (mínimo 8 caracteres).

> Los datos que ya tenías en el dispositivo se **migran automáticamente** a tu cuenta.

## 5.2 Cómo funciona la sincronización

- La app guarda todo **primero en el dispositivo** (funciona sin conexión)
- Al **abrir** la app descarga los cambios recientes desde el servidor
- Al **cerrar** (o al abrir) envía los cambios locales pendientes
- Si un dato se modificó a la vez en dos lugares, se guarda como **conflicto** y podés elegir cuál versión conservar desde **Perfil → Resolver conflictos**

# 6. Pantallas de la app (16)

| Pantalla | Descripción |
| --- | --- |
| Onboarding 1 y 2 | Presentación del concepto y primer flujo |
| Permiso de notificaciones | Ripple ping al habilitar avisos |
| Splash / Loading | Carga animada al abrir la app |
| Welcome | Entrar con cuenta o explorar sin cuenta |
| Login / Register | Iniciar sesión o crear cuenta |
| Focus (Ahora) | Timer por pasos con tarjeta Zen |
| Task List (Tareas) | Bento grid de tareas activas |
| Task Detail | Detalle de tarea con pasos y edición |
| Task Form | Alta/edición de tarea |
| Step Form | Alta de paso |
| History | Registro diario de progreso |
| Badges | Galería de insignias |
| Profile | Configuración y cuenta |
| Sync Conflicts | Resolución de conflictos local/servidor |
| Step Complete | Celebración con confetti |

# 7. Solución de problemas

| Problema | Solución |
| --- | --- |
| "Crear cuenta" se cuelga al guardar | Asegurate de tener conexión (la migración llama al backend). Si el servidor de Railway estaba dormido, esperá ~1 min y reintentá |
| La fecha límite no abre un calendario | En web el date picker está disponible en el campo de fecha (versión reciente) |
| Datos que no sincronizan | Revisá conexión y cerrá/reabrí la app para forzar el sync |
| Querés empezar de cero | Desde Perfil podés cerrar sesión; sin cuenta, tus datos quedan solo en el dispositivo |

*StepUp — Manual de Usuario E2 — Versión 1.0 — Agosto 2026*