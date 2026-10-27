# Migración del Design Lab a la app

Checklist de la migración del rediseño "Serene" (Design Lab) a la app real.
El objetivo es reemplazar pantalla por pantalla las pantallas Zenith sin cambiar
el comportamiento visible hasta que la fase correspondiente esté cerrada.

## Cómo leer este documento

- **Fuente**: archivo:línea del código actual, o la decisión que originó el ítem.
- **Estado**: `pendiente` | `pendiente de mi OK` (propuesta sin aprobar) | `en curso` | `hecho`.
  Todo arranca en `pendiente`.
- Un ítem se marca `hecho` solo cuando está mergeado en `develop`.
- Las banderas de `src/config/migration.ts` eligen, por área, entre la pantalla
  nueva (Serene) y la vieja (Zenith). Se borran en la Fase 7.

## Punto de partida

- Rama de trabajo: `migracion/serene`.
- Etiqueta local `lab-baseline` en `fe8b6c8`.
  - **Ojo**: la etiqueta apunta al commit, no al working tree. Los cambios que
    estaban sin commitear al crear la rama (baja de dependencias, banderas,
    este documento) no están incluidos en `lab-baseline`.
- Línea base verificada antes de empezar: `typecheck` sin errores, `lint` sin
  errores y **270 tests en 26 archivos** en verde.

---

## Fase 0 — Preparación

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Rama `migracion/serene` y etiqueta local `lab-baseline` | Decisión | 0 | pendiente |
| `docs/MIGRACION.md` | Este archivo | 0 | pendiente |
| Banderas de migración `src/config/migration.ts` (`tabs`, `tasks`, `focus`, `profile`, `auth`) y su test | Decisión | 0 | pendiente |
| Baja de `react-native-draggable-flatlist`, `react-native-reanimated` y `react-native-worklets` | `package.json` | 0 | pendiente |
| Baja de `react-native-gesture-handler` y de `GestureHandlerRootView` | `App.tsx` (import y wrapper) | 0 | pendiente |
| Ignorar `graphify-out/` en git | `.gitignore` | 0 | pendiente |
| Excluir localmente los `.py` sueltos del run de graphify | `.git/info/exclude` (no versionado) | 0 | pendiente |

## Fase 1 — Base

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Tres pestañas: Foco, Tareas y Perfil | Decisión | 1 | en curso |
| Sin `GlassTabBar` y sin pestaña Historial | `src/components/GlassTabBar.tsx` | 1 | en curso |
| "Completadas" dentro de Tareas (sin pestaña propia) | Decisión | 1 | pendiente |

### Avance en la rama `migracion/serene` (sin mergear)

- Navegador nuevo `src/navigation/AppTabs.tsx` con 3 pestañas (`Focus`, `Tasks`,
  `Profile`, mismos nombres de ruta que hoy para no romper los `navigate`
  existentes) y la barra `src/components/ui/SereneTabBar.tsx`. Se elige con
  `migrationFlags.tabs` (`src/navigation/tabs.ts`): en `false` se sigue montando
  `MainTabs` con `GlassTabBar`, así que la app queda igual que hoy.
- Las stacks de Foco, Tareas y Perfil se **duplican** dentro de `AppTabs` para no
  tocar `GlassTabBar.tsx`. Mientras convivan los dos navegadores, una pantalla
  nueva se registra en los dos archivos; se unifican cuando el viejo se borre.
- `tabBarHideOnKeyboard` **no funciona con una barra propia**: la opción la lee
  `BottomTabBar` (`@react-navigation/bottom-tabs`), que queda reemplazado. La
  barra nueva se oculta con un listener de teclado, con la misma semántica.
- Con `migrationFlags.tabs = true`, **Historial queda inaccesible** hasta la
  Fase 3, cuando "Completadas" viva dentro de Tareas. `HistoryScreen` sigue en el
  repo y vuelve con su fase.
- `src/theme/serene` pasa a ser la entrada oficial de las pantallas nuevas (ya no
  es exclusivo de las previews). `src/theme/themeMix.test.ts` falla si un mismo
  archivo importa Zenith y Serene; `layout` y `responsive` son neutrales.

### Estructura aprobada

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Componentes compartidos del Lab en `src/components/ui/` | Decisión | 1 | en curso |
| Cada área en `src/features/<área>/` (`tasks`, `focus`, `profile`, `auth`) con la pantalla real (contenedor), su vista (solo props, sin datos) y su hook de datos | Decisión | 1 | en curso |
| El Design Lab pasa a importar las vistas desde `src/features/` | Decisión | 1 | pendiente (se hace cuando cada área se mueva) |
| Promover `src/theme/serene` como entrada oficial de las pantallas nuevas | Decisión | 1 | en curso |
| Regla que impida que un mismo archivo importe Zenith y Serene a la vez (test) | Decisión | 1 | en curso |

## Fase 2 — Servicios

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Helper que recalcula `status` y `completed_at` tras `add`, `addMany`, `delete`, `complete` y `uncomplete` (decisión B: la categoría se deriva en la UI; los servicios mantienen `status` al día) | Decisión B | 2 | pendiente |
| Reconciliación única de tareas existentes con `status` desincronizado | Decisión B | 2 | pendiente |
| `StepService.reorder` con orden completo y atómico, y su sync | Decisión | 2 | pendiente |
| Borrado en lote de pasos marcados al guardar o salir del Detalle | Decisión | 2 | pendiente |
| `pickFocusTask` ignora tareas sin pasos | `src/utils/designlab/deriveTaskCategory.ts:39` | 2 | pendiente |
| Reordenar entre tareas exige lógica cross-task (`StepService.reorder` es solo intra-tarea) | `src/screens/designlab/focusFixtures.ts:101` | 2 | pendiente |

## Fase 3 — Tareas

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Listado con filtros derivados y tarjetas | `src/screens/designlab/TareasAListadoScreen.tsx` | 3 | pendiente |
| Detalle con filas, sheet de edición, Ordenar y cartel de tarea sin pasos | `src/screens/designlab/TareasADetalleScreen.tsx` | 3 | pendiente |
| Crear/Editar con fecha, "Sugerir pasos" con IA y borrado diferido | `src/screens/designlab/TareasACrearScreen.tsx`, `TareasAEditarScreen.tsx` | 3 | pendiente |
| Tarea completada | `src/screens/designlab/TareasACompletadaScreen.tsx` | 3 | pendiente |
| `onSave` del sheet de edición debe conectar con `StepService` | `src/components/designlab/EditarPasoSheet.tsx:41` | 3 | pendiente |
| Campos de las fixtures que no existen en el modelo real (`Task`, `Step`) | `src/screens/designlab/tareasFlujoAFixtures.ts:9` | 3 | pendiente |

## Fase 4 — Focus

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Subir `expo` a `~54.0.37` (hoy 54.0.34) y `expo-constants` a `~18.0.14` (hoy 18.0.13). Cambio aparte, antes de esta fase | `npx expo install --check` | 4 | pendiente |
| Foco manual efímero en memoria | Decisión | 4 | pendiente |
| "Posponer" efímero | Decisión | 4 | pendiente |
| `TimerService` con `endsAt` (hoy pausar/reanudar reinicia el paso y `resume()` es código muerto) | `src/services/TimerService.ts:52,61`; `src/hooks/useFocusCountdown.ts:45` | 4 | pendiente |
| `expo-notifications`, `expo-keep-awake` y `expo-haptics` | `package.json` (no instalados) | 4 | pendiente |
| Corregir la animación de `NotificationPermissionScreen` (animar `scale`, no `width`/`height` con `useNativeDriver`) | `src/screens/NotificationPermissionScreen.tsx` | 4 | pendiente |
| Persistir el cronómetro al navegar | Decisión | 4 | pendiente |
| Pantalla de descanso de 2 minutos (a definir) | Decisión | 4 | pendiente |
| Corregir el nombre de un paso completado (hoy no se permite) | Decisión | 4 | pendiente |
| Cambiar de tarea durante el foco no existe en el modelo real | `src/screens/designlab/focusFixtures.ts:55` | 4 | pendiente |
| Al guardar un paso hay que redirigir a Tareas, no quedarse en Focus | `src/screens/designlab/focusFixtures.ts:85` | 4 | pendiente |

## Fase 5 — Perfil

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Cerrar sesión sin borrar datos: `AuthService.logout` debe llamar solo a `clearSession`, no a `clearLocalData` | `src/services/AuthService.ts:37-39`; `src/screens/designlab/perfilFixtures.ts:188` | 5 | pendiente |
| `ensureLocalOwner` debe avisar antes de borrar los datos de otra cuenta si hay cambios sin sincronizar (requiere chequeo de cambios sin sincronizar) | `src/services/localOwner.ts:4`; `src/screens/designlab/useAuthPreview.ts:38` | 5 | pendiente |
| Recordatorio diario (activado y hora, en almacenamiento local) y permiso de notificaciones al activarlo | `src/screens/designlab/perfilFixtures.ts:174-176`; `src/screens/designlab/usePerfilPreview.ts:20` | 5 | pendiente |
| Marcador `// REQUIERE DEPENDENCIA` (variante de `// REQUIERE MIGRACIÓN`) por `expo-notifications` sin instalar | `src/screens/designlab/perfilFixtures.ts:174`; `src/screens/designlab/usePerfilPreview.ts:20` | 5 | pendiente |
| Conflictos | `src/screens/designlab/ConflictosAScreen.tsx`; `src/screens/designlab/usePerfilPreview.ts:47` | 5 | pendiente |
| Logros: reglas y logros nuevos (a definir) | `src/screens/designlab/LogrosAScreen.tsx` | 5 | pendiente |
| Texto de privacidad verdadero: datos sin cifrar en SQLite, sync solo con cuenta, texto de la tarea enviado a Gemini en "Sugerir pasos" | `src/screens/designlab/perfilFixtures.ts:199-202` | 5 | pendiente |
| El alta de cuenta desde Perfil es un placeholder | `src/screens/designlab/usePerfilPreview.ts:42` | 5 | pendiente |

## Fase 6 — Acceso

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Onboarding, Login y Registro | `src/screens/designlab/Onboarding1AScreen.tsx`, `Onboarding2AScreen.tsx`, `LoginAScreen.tsx`, `RegistroAScreen.tsx` | 6 | pendiente |
| Modo invitado y persistir `hasSeenOnboarding` también para el invitado | `src/screens/designlab/useAuthPreview.ts:30` | 6 | pendiente |
| Sacar `NotificationPermission` del onboarding | `src/screens/designlab/Onboarding2AScreen.tsx:121` | 6 | pendiente |
| Detección de conexión en Login | `src/screens/designlab/LoginAScreen.tsx` | 6 | pendiente |
| Confirmar el texto "Puede tardar unos segundos" | `src/screens/designlab/authAFixtures.ts:52` | 6 | pendiente |
| Login real: `AuthService.login(email, password)` y entrar a MainTabs | `src/screens/designlab/useAuthPreview.ts:24` | 6 | pendiente |
| Registro real: `AuthService.register(name, email, password)` y entrar a MainTabs | `src/screens/designlab/useAuthPreview.ts:80` | 6 | pendiente |

## Fase 7 — Cierre

| Ítem | Fuente | Fase | Estado |
|------|--------|------|--------|
| Borrar Zenith, pantallas viejas y las banderas de migración | Decisión | 7 | pendiente |
| Dejar el Design Lab solo en desarrollo: hoy `ProfileStack` hospeda 19 pantallas del Lab más 3 reales (`ProfileMain`, `Badges`, `SyncConflict`) | `src/components/GlassTabBar.tsx:249-270` | 7 | pendiente |
| Actualizar `docs/Contexto.md` | Decisión | 7 | pendiente |
| Actualizar `docs/CONVENCIONES.md` §6 punto 8 y §7.4 | Decisión | 7 | pendiente |
| Actualizar `docs/Log Decisiones Tecnicas E1.md` y `E2.md` | Decisión | 7 | pendiente |
| Actualizar `AGENTS.md` y la skill local "stepup onboard" | Decisión | 7 | pendiente |
| Pasada de accesibilidad y comportamiento en el celular (por ejemplo, que el teclado no tape el campo donde se escribe) | Decisión | 7 | pendiente |
| Revisión de Dependabot | Decisión | 7 | pendiente |
