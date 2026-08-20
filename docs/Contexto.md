# StepUp — Documento de contexto del proyecto

Este documento existe para poder retomar el proyecto desde cualquier punto, en cualquier chat. Está escrito de forma informal y contiene todo lo que se decidió, todo lo que se hizo, y todo lo que falta.

---

## Qué es StepUp

Una app mobile anti-procrastinación. La idea central es que las personas no procrastinan porque sean vagas, sino porque cuando ven una tarea grande el cerebro entra en modo de evitación (esto se llama *task paralysis*). Las apps de to-do list tradicionales organizan las tareas pero no resuelven ese problema.

StepUp lo resuelve de una sola forma: **muestra solo el próximo paso, nunca la tarea completa**. El usuario carga "Estudiar para el parcial de SO", lo divide en pasos de 5-15 minutos, y la app le muestra únicamente el primero. Nada más. Cuando lo completa, aparece el siguiente.

El slogan es **"Un paso. Solo uno. Ahora."**

### De dónde viene la idea

El proyecto arrancó siendo una app anti-procrastinación llamada **BreakPattern**, que se enfocaba en notificaciones inteligentes. El profesor dijo que estaba bien pero preguntó cómo sería el día a día, cómo entraría la app a trabajar. A partir de eso se reformuló completamente el concepto hacia el organizador de tareas con división en pasos, que es lo que es hoy.

---

## Contexto académico

- Materia: Ingeniería en Sistemas de Información
- Duración total: 9 meses (marzo a fines de noviembre 2026), 3 entregas
- Equipo: 3 integrantes (sin roles fijos, todos hacen de todo)
- **E1 entregada:** Mayo 2026 — app funcional offline con ciclo completo de tareas y pasos
- **E2 en curso:** Julio-Agosto 2026 — entrega **18 de Agosto**. Migración visual + backend + auth + sync
- **E3:** Septiembre-Noviembre 2026 — IA, dashboard, estadísticas
- El profesor aclaró que ellos definen qué entregan, y que lo importante es que cada entrega sea algo funcional y demostrable

---

## Las 3 entregas planificadas

### Entrega 1 — Marzo a Mayo 2026 ✅ COMPLETADA
- App standalone 100% offline entregada y funcionando
- CRUD de tareas, división en pasos, Vista Foco, timer, historial, contador diario
- Stack: React Native + Expo SDK 54 + TypeScript + expo-sqlite

### Entrega 2 — Julio a Agosto 2026 (entrega: 18 de Agosto)

**Dos tracks en paralelo:**

**Track A — Migración visual al diseño Zenith Vitality**
- Theme system centralizado (colores, tipografía, espaciado, sombras)
- Componentes reutilizables (Button, Card, Badge, TextField, GlassTabBar, etc.)
- Rediseño de las 6 pantallas existentes (Focus, TaskList, TaskDetail, TaskForm, StepForm, History)
- 7 pantallas nuevas (Onboarding x2, Notificaciones, Loading, Perfil, Celebración, Insignias)
- GlassTabBar flotante tipo glassmorph
- Animaciones y micro-interacciones
- Basado en los prototipos de `stitch_stepup_design_system/`

**Track B — Backend + Auth + Sync (Opción A)**
- API REST: Node.js + Express + Prisma + PostgreSQL
- Hosting: Railway (tier gratuito)
- Autenticación JWT: registro + login
- Endpoints: CRUD de tareas y pasos en el servidor
- Sync offline-first híbrido:
  - Sin cuenta: la app funciona offline con SQLite local (modo E1)
  - Con cuenta: los datos locales se migran al backend al registrarse
  - Sincronización pull/push con last-write-wins
- Modelo de datos replicado entre SQLite local y PostgreSQL remoto

### Entrega 3 — Septiembre a Noviembre 2026 (entrega final)

**Foco principal: IA.** Plan detallado en `docs/Entrega 3 PRD.md` (epic #152).

- Integración con **Google Gemini API** (AI Studio, tier gratis, modelo `gemini-2.5-flash` vía backend)
- **Sugeridor de pasos:** el usuario escribe nombre + descripción y la app sugiere pasos accionables de 5-25 min (alineados al método Pomodoro), 3-8 según el tamaño de la tarea
- **Asistente de descripción:** guía de estructura contextual para escribir mejores descripciones
- La IA propone, el usuario decide: borrador editable → confirmar → la tarea y sus pasos nacen juntos
- La IA también está disponible en el detalle de tarea (re-generar pasos con la descripción guardada)
- La descripción pasa a ser atributo persistente de la tarea (SQLite + PostgreSQL + sync)
- Offline: la IA nunca bloquea — sin conexión, el flujo manual de creación queda intacto
- **Dashboard de consistencia:** racha de días con actividad (1 día de gracia fijo por racha, no acumulable) + tendencia semanal con LineChart
- Notificaciones push (FCM), slices de polish 8/10/11 y refino conversacional de la IA quedan FUERA del alcance obligatorio de E3

> **Nota:** originalmente se planificaron 4 entregas (la cuarta en diciembre con widget Android y estadísticas avanzadas), pero la cursada termina a fines de noviembre. Todo lo que entre en el tiempo disponible se agrupa en E3. La E4 queda descartada o como trabajo futuro.

---

## Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework mobile | React Native + Expo SDK 54 | El equipo conoce JS/React. Expo simplifica el build y permite probar con Expo Go escaneando un QR. SDK 54 porque SDK 55 no corre en Expo Go todavía. |
| Lenguaje | TypeScript | Tipado estático, menos bugs, mejor autocompletado |
| Base de datos local | expo-sqlite (SQLite local) | Sin servidor, sin internet, sin costos. App 100% funcional offline |
| Base de datos remota (E2) | PostgreSQL en Railway | ORM: Prisma. Tier gratuito del hosting. |
| Backend (E2) | Node.js + Express + Prisma | API REST con autenticación JWT y sync pull/push |
| Navegación | React Navigation — GlassTabBar | Bottom tabs flotantes estilo glassmorph |
| Testing | Jest + React Native Testing Library | Estándar del ecosistema |
| Control de versiones | Git + GitHub | Branching: main / develop / feature/* |
| Auth (E2) | JWT (jsonwebtoken + bcrypt) | Registro y login de usuarios |
| Diseño visual (E2) | Sistema Zenith Vitality | Colores, tipografía, componentes desde `stitch_stepup_design_system/` |
| Notificaciones (E3) | Firebase Cloud Messaging | Se agrega en E3 |
| IA (E3) | Google Gemini API (AI Studio) | Una llamada con buen prompt, sin fine-tuning. Se accede vía el backend (la key nunca va en el bundle de la app) |

---

## Modelo de datos (SQLite — E1)

### Tabla `tasks`
```
id           INTEGER PRIMARY KEY AUTOINCREMENT
name         TEXT NOT NULL
description  TEXT (nullable) — contexto de la tarea (agregado en E3)
due_date     TEXT (ISO 8601, nullable)
status       TEXT — 'active' | 'completed'
created_at   TEXT (ISO 8601)
completed_at TEXT (ISO 8601, nullable)
```

### Tabla `steps`
```
id           INTEGER PRIMARY KEY AUTOINCREMENT
task_id      INTEGER NOT NULL — FK a tasks.id (CASCADE DELETE)
name         TEXT NOT NULL
duration_min INTEGER (nullable) — minutos estimados
order_index  INTEGER NOT NULL — posición en la secuencia
status       TEXT — 'pending' | 'completed'
completed_at TEXT (ISO 8601, nullable)
```

### Tabla `daily_progress`
```
id               INTEGER PRIMARY KEY AUTOINCREMENT
date             TEXT (YYYY-MM-DD, UNIQUE)
steps_completed  INTEGER NOT NULL DEFAULT 0
```

---

## Arquitectura de la app (E1)

Tres capas lógicas dentro de una sola codebase:

```
Presentación (React Native screens)
        ↓
Lógica de negocio (TypeScript services)
        ↓
Datos (expo-sqlite via db.ts)
```

**Regla importante:** ningún componente de presentación accede a SQLite directamente. Todo pasa por los servicios.

### Pantallas
- `FocusScreen` — la pantalla principal, la más importante. Próximo paso + timer + botón completar
- `TaskListScreen` — lista de tareas activas con progreso
- `TaskDetailScreen` — detalle de una tarea con sus pasos en orden
- `TaskFormScreen` — formulario crear/editar tarea
- `StepFormScreen` — formulario crear/editar paso
- `HistoryScreen` — tareas completadas con fechas

### Servicios
- `TaskService` — CRUD de tareas, completar tarea (solo si todos los pasos están completos)
- `StepService` — CRUD de pasos, reordenar, completar paso (avanza al siguiente automáticamente y llama a TaskService para verificar si la tarea quedó completa)
- `TimerService` — maneja el timer en memoria, no persiste nada. Countdown con duración, countup sin duración
- `ProgressService` — incrementa el contador diario, consulta historial

### Archivos de base de datos
- `src/database/db.ts` — conexión singleton a SQLite, ejecuta migraciones al iniciar
- `src/database/migrations.ts` — schema de las 3 tablas (sin datos)
- `src/database/seed.ts` — datos de prueba SOLO para desarrollo, no se ejecuta al iniciar

**Seed manual (desarrollo):** la app arranca con tablas vacías. Para poblar datos de prueba,
ejecutar con la variable de entorno `EXPO_PUBLIC_SEED_DB=true` (ej. `$env:EXPO_PUBLIC_SEED_DB="true"; npx expo start`).
El seed usa `INSERT OR IGNORE` y nunca borra datos existentes.

---

## Estructura de carpetas del proyecto

```
stepup/
├── src/
│   ├── screens/
│   │   ├── FocusScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── TaskFormScreen.tsx
│   │   ├── StepFormScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/
│   │   ├── TaskService.ts
│   │   ├── StepService.ts
│   │   ├── TimerService.ts
│   │   └── ProgressService.ts
│   ├── database/
│   │   ├── db.ts
│   │   ├── migrations.ts
│   │   └── seed.ts
│   ├── components/       ← componentes UI reutilizables (a crear)
│   └── types/
│       └── index.ts      ← interfaces Task, Step, DailyProgress, etc.
├── App.tsx               ← entry point + bottom tab navigation
├── app.json
├── tsconfig.json
└── package.json
```

---

## Estado actual del código (Agosto 2026)

### ✅ E1 completada — todo funcional
- `src/types/index.ts` — interfaces Task, Step, DailyProgress, CreateTaskInput, UpdateTaskInput, CreateStepInput, UpdateStepInput
- `src/database/migrations.ts` — schema SQLite con 3 tablas y PRAGMA WAL
- `src/database/db.ts` — conexión singleton con getDb()
- `src/services/TaskService.ts` — CRUD completo + completar tarea
- `src/services/StepService.ts` — CRUD completo + reordenar + completar paso con avance automático
- `src/services/ProgressService.ts` — increment, getToday
- `src/services/TimerService.ts` — start, pause, resume, stop, getState, format
- `App.tsx` — navegación bottom tabs: Ahora / Tareas / Historial
- `src/screens/FocusScreen.tsx` — Vista Foco completa con timer, contador diario, completar paso
- `src/screens/TaskListScreen.tsx` — Lista de tareas activas con FAB y long-press eliminar
- `src/screens/TaskDetailScreen.tsx` — Detalle de tarea con pasos en orden, progreso, editar/eliminar
- `src/screens/TaskFormScreen.tsx` — Crear/editar tarea con nombre y fecha límite
- `src/screens/StepFormScreen.tsx` — Crear/editar paso con nombre y duración estimada + pills rápidas
- `src/screens/HistoryScreen.tsx` — Historial de tareas completadas con contador diario
- `src/components/` — vacío (todo el estilo está inline en cada screen)

### 🚧 Trabajo pendiente para E2

**Track A — Migración visual (12 issues en GitHub):**
- `src/theme/` — sistema de diseño centralizado (colores, tipografía, espaciado, sombras) ✅
- `src/components/` — componentes reutilizables (Button, Card, Badge, TextField, GlassTabBar, etc.) ✅
- Rediseño de las 6 pantallas existentes + 10 nuevas pantallas ✅
- Carga de fuentes Manrope + Plus Jakarta Sans ✅
- Slices 1–7 y 9 cerrados; **slice 8 (polish), 10 (XP/Level) y la revisión formal de la 11 (SyncConflictScreen, ya implementada) quedaron para E3**

**Track B — Backend (implementado e integrado a `develop`):**
- API REST en Node.js + Express + Prisma + PostgreSQL ✅
- Autenticación JWT (registro + login) ✅
- Sync offline-first híbrido (push/pull/migrate) ✅
- CRUD de tasks y steps ✅
- Hosting en Railway ✅
- **Estado:** fixes del epic #64 (issues #65-#77) mergeados a `develop2`. **Unificación:** `develop2` integrada a `develop` vía PR #121 (issue #120) y eliminada. Las issues de backend ahora van a `develop`.
- **Pendiente para E3:** bugs #122–#126 detectados en el review final (borde de día UTC, IDOR en migrate, idempotencia client-side anulada, docs PRD, `as any` restantes)

### Sistema operativo de desarrollo
**Windows**

---

## Plan de la Entrega 3 (definido en agosto 2026)

> Detalle completo en `docs/Entrega 3 PRD.md` (epic GitHub **#152**).

### Alcance
- **Foco:** IA para sugerir pasos al crear una tarea + dashboard de consistencia.
- **Fuera de alcance:** notificaciones push (FCM), slices de polish 8/10/11, refino conversacional de la IA.

### Slices (issues del milestone Entrega 3)
| Slice | Issue | Qué es | Bloqueado por |
|-------|-------|--------|---------------|
| 1 | #153 | Descripción como atributo persistente de la tarea (SQLite + Prisma + sync) | — |
| 2 | #154 | Endpoint backend de IA: `POST /api/ai/suggest-steps` + asistente de descripción (Gemini vía proxy) | — |
| 3 | #155 | Frontend: sugerir pasos con IA al crear tarea (borrador editable + regenerar) | #153, #154 |
| 4 | #157 | Frontend: generar pasos con IA desde el detalle de tarea | #153, #154 |
| 5 | #156 | Dashboard de consistencia: racha (1 día de gracia fijo) + tendencia semanal | #122 |

### Deuda de E2 priorizada (no eliminada)
- **Alta:** #122 (borde de día UTC — alimenta las rachas), #123 (IDOR en migrate).
- **Media:** #124 (idempotencia client-side anulada).
- **Baja:** #126 (`as any` restantes).
- **Cerrada sin hacer:** #125 (docs PRD — el PRD se actualiza en E3).

### Conceptos clave (del grill con domain-modeling)
- **Sugerencia de pasos:** la IA propone, el usuario decide. El borrador es temporal, editable, descartable y no se persiste hasta confirmar.
- **Buen paso:** accionable (verbo concreto), de 5-25 min (Pomodoro), en orden lógico, derivado del contexto dado (nunca genérico).
- **Descripción:** opcional para crear, necesaria para una buena sugerencia. Se guarda con la tarea.
- **Racha:** días consecutivos con al menos 1 paso completado, contando desde hoy; 1 día de gracia fijo por racha (no acumulable).
- **IA offline:** no funciona sin conexión, pero nunca bloquea — el flujo manual queda intacto.
- **Key de Gemini:** SOLO en el backend (Railway env), nunca en el bundle de la app.

---

## División de tareas de desarrollo

### Integrante A (Claude tomó este rol) — Fundación + DB + Servicios
Todo el código de la sección anterior. Ya está hecho, listo para copiar al repo.

### Integrante B — Pantallas de gestión
- DEV-B1: App.tsx con navegación (ya está hecho por A)
- DEV-B2: TaskListScreen real — usa TaskService.getAll(), muestra progreso de pasos
- DEV-B3: TaskFormScreen — formulario crear/editar tarea con nombre y date picker
- DEV-B4: TaskDetailScreen — lista de pasos en orden, indica el próximo, botones editar/eliminar/agregar
- DEV-B5: StepFormScreen — formulario crear/editar paso con nombre y duración

### Integrante C — Vista Foco + Timer + Historial
- DEV-C1: FocusScreen real — muestra próximo paso, botón completar, conectado a StepService.complete()
- DEV-C2: Timer integrado en FocusScreen — usa TimerService, botón iniciar/pausar, alerta al llegar a 0
- DEV-C3: HistoryScreen real — lista tareas completadas con ProgressService.getCompletedTasks() (nota: este método se llama TaskService.getCompleted())
- DEV-C4: Contador diario en FocusScreen — usa ProgressService.getToday()

### Todos — Integración y cierre
- DEV-Z1: Prueba del flujo completo de punta a punta en dispositivo físico
- DEV-Z2: Fix de bugs críticos
- DEV-Z3: Merge a main + tag v1.0-E1

---

## Decisiones técnicas tomadas

| ID | Decisión | Estado |
|---|---|---|
| DT-01 | React Native + Expo | Confirmada |
| DT-02 | TypeScript | Confirmada |
| DT-03 | SQLite local sin backend en E1 | Confirmada |
| DT-04 | Arquitectura en 3 capas | Confirmada |
| DT-05 | Navegación: **bottom tabs → GlassTabBar** | En migración E2 |
| DT-06 | Timer opcional (no bloquea completar el paso) | Confirmada |
| DT-07 | Fecha límite incluida en E1 | Confirmada |
| DT-08 | Android como plataforma demo principal | Confirmada |
| DT-09 | Backend: Node.js + Express + Prisma + PostgreSQL en Railway | Confirmada (E2) |
| DT-10 | Autenticación JWT con registro/login | Confirmada (E2) |
| DT-11 | Sync offline-first híbrido: Sin cuenta→local, Con cuenta→backend + migración | Confirmada (E2) |
| DT-12 | Conflictos de sync: last-write-wins | Confirmada (E2) |
| DT-13 | Diseño visual: Sistema Zenith Vitality (glassmorphism, paleta verde/naranja/azul) | En curso (E2) |
| DT-14 | Fuentes: Manrope (títulos) + Plus Jakarta Sans (cuerpo) vía @expo-google-fonts | En curso (E2) |
| DT-15 | Navegación: GlassTabBar flotante tipo glassmorph con 3-4 tabs | En curso (E2) |
| DT-16 | Gestión de GitHub: protección de ramas (main/develop), Dependabot, milestones y releases por entrega | Confirmada (Agosto 2026) |

---

## Historias de usuario — E1 (resumen)

15 historias en total. Las de prioridad Alta son obligatorias para la entrega.

### Módulo 1 — Gestión de tareas
- HU-01 Alta: crear tarea con nombre y fecha límite opcional
- HU-02 Alta: ver lista de tareas activas
- HU-03 Media: editar tarea
- HU-04 Media: eliminar tarea (con confirmación, borra sus pasos en cascada)
- HU-05 Alta: marcar tarea completa (solo si todos los pasos están completos)

### Módulo 2 — División en pasos
- HU-06 Alta: agregar paso a una tarea
- HU-07 Alta: ver pasos en orden con indicador del próximo
- HU-08 Baja: reordenar pasos (drag o controles)
- HU-09 Media: editar o eliminar un paso
- HU-10 Alta: marcar paso como completado (solo el actual, avanza automáticamente)

### Módulo 3 — Vista Foco
- HU-11 Alta: pantalla que muestra solo el próximo paso
- HU-12 Media: timer opcional por paso
- HU-13 Alta: al completar un paso, aparece el siguiente automáticamente

### Módulo 4 — Historial
- HU-14 Media: ver historial de tareas completadas
- HU-15 Baja: contador de pasos completados hoy

---

## Branching strategy y convención de commits

```
main        ← Entrega final, siempre estable. Solo recibe merges desde develop.
develop     ← Rama base para issues de frontend y backend.
feature/*   ← Una rama por cambio. Formato: feature/<tipo>/<numero>-<descripcion>
```

> `develop2` (backend E2) existió como rama transitoria hasta el 18/08/2026; fue
> unificada a `develop` vía PR #121 (issue #120) y eliminada.

**Flujo de trabajo (obligatorio, ver `docs/CONVENCIONES.md` §7):**
1. Tomar una issue abierta sin assignee y **auto-asignarse** (pull rule).
2. Crear rama desde la rama correcta:
   - Backend → `git checkout develop && git pull && git checkout -b fix/67-idempotencia-push`
   - Frontend → `git checkout develop && git pull && git checkout -b feat/78-pantalla-x`
3. Hacer commits con formato convencional
4. Push a origin
5. Crear Pull Request a la rama correcta siguiendo `.github/PULL_REQUEST_TEMPLATE.md`
6. Alguien más revisa y mergea con squash (nadie mergea su propio PR)

**Regla de oro:** nunca commitear directo a `main` ni a `develop`. Todo cambio entra por `feature/*` → rama destino (según área) → (integración) → `main`.

**Formato de commits:**
```
feat: agregar formulario de creacion de tarea
fix: corregir contador diario al reabrir la app
test: casos de prueba para StepService
docs: actualizar README
refactor: separar logica del timer en TimerService
chore: instalar expo-sqlite y configurar
```

Al cerrar cada entrega: merge develop → main, crear tag (ej: v1.0-E1, v2.0-E2)
y publicar el release correspondiente con notas (ver release `entrega-1`). Las
issues de cada entrega se agrupan en su milestone (E1/E2/E3) — ver DT-16 y
CONVENCIONES §7.10.

---

## Documentos generados hasta ahora

Todos los documentos están en formato .docx listos para subir a Google Drive.

1. **Inception Deck** (PowerPoint .pptx + Word .docx) — los 10 puntos del inception deck completos. Incluye elevator pitch, NOT list, stakeholders, arquitectura por entrega, riesgos, tamaño estimado, palancas del proyecto. **Ojo: el deck original tiene 4 entregas hasta diciembre, hay que actualizarlo a 3 entregas hasta noviembre en una próxima sesión.**

2. **Requerimientos E1** (.docx) — 8 secciones: introducción, funcionalidades de E1, 15 historias de usuario con criterios de aceptación, requerimientos no funcionales, modelo de datos SQLite, criterios de aceptación de la entrega, cambios respecto al plan, glosario.

3. **Arquitectura E1** (.docx) — 9 secciones con 3 diagramas: diagrama de capas, flujo de datos al completar un paso, estructura de carpetas del repo. Incluye stack técnico justificado, componentes detallados, decisiones arquitectónicas DA-01 a DA-05.

4. **Repositorio y Desarrollo E1** (.docx) — branching strategy con comandos Git reales, convención de commits, proceso de PRs con template, plan de sprints semana a semana de marzo a mayo 2026, .gitignore para Expo, estructura de Google Drive, checklist de entrega.

5. **Log de Decisiones Técnicas** (.docx) — 8 decisiones en formato ADR: contexto, decisión, razonamiento, alternativas descartadas, consecuencias. Incluye guía de cómo mantener el documento vivo.

6. **README.md** — listo para pegar en el repo de GitHub. Tiene descripción, estado de funcionalidades, tech stack, requisitos, instrucciones de instalación paso a paso, estructura de carpetas, branching, testing, tabla de entregas.

7. **Documentación E2 (18/08/2026)** — 8 entregables nuevos en `docs/` (md + docx): Requerimientos E2 v1.1, Arquitectura E2 v1.1, Log Decisiones Técnicas E2 v1.2, Testing E2 v1.1, Repositorio y Desarrollo E2 v1.0, Manual de Usuario E2 v1.0, Minutas y Feedback E2 v1.0, Gestión Documental E2 v1.0.

8. **PRD Entrega 3 (20/08/2026)** — `docs/Entrega 3 PRD.md` (epic #152): problem statement, 17 user stories, decisiones de implementación (Gemini vía backend, descripción persistente, borrador editable, racha), decisiones de testing (seams backend + racha), out of scope y deuda priorizada.

### Lo que falta generar
- Presentación E2 (PPTX) con capturas reales de la app
- Capturas reales de pantallas para el manual (Playwright sobre la app web)

---

## Estructura de Google Drive

```
📁 StepUp — Proyecto 2026
  📁 00 — Gestion          ← Inception Deck, minutas, planificación
  📁 01 — Requerimientos   ← Documento de Requerimientos E1
  📁 02 — Arquitectura     ← Documento de Arquitectura E1
  📁 03 — Desarrollo       ← README, decisiones técnicas, guías de setup
  📁 04 — Testing          ← Casos de prueba, resultados, bugs
  📁 05 — Manual de Usuario← Manual v1 (evolutivo)
  📁 06 — Entregas         ← Versiones finales por iteración
  📁 07 — Feedback         ← Comentarios del docente, minutas
```

Convención de nombres: `01_Requerimientos_E1_v1.0.docx`. Al actualizar, incrementar el número de versión, no sobreescribir.

---

## Prototipo visual y sistema de diseño

### Diseño actual (E1)
Las pantallas actuales usan estilos inline con colores azules (#2563EB) y fuente del sistema. Sin componentes reutilizables.

### Nuevo diseño (E2) — Zenith Vitality
El sistema de diseño completo está en `stitch_stepup_design_system/` con prototipos HTML navegables para cada pantalla:

| Carpeta | Pantalla | Estado |
|---------|----------|--------|
| `zenith_vitality/` | Documento maestro de diseño (DESIGN.md) | ⏳ A implementar |
| `ahora_enfoque_redise_o/` | FocusScreen con timer glassmorpho | ⏳ A implementar |
| `ahora_sin_tareas/` | Estado vacío "Mente clara, espacio libre" | ⏳ A implementar |
| `tareas_gesti_n_redise_o/` | TaskList con bento grid | ⏳ A implementar |
| `detalle_de_tarea_gesti_n/` | TaskDetail con pasos y checkboxes | ⏳ A implementar |
| `nueva_tarea_creaci_n/` | StepForm con drag-and-drop | ⏳ A implementar |
| `historial_logros_redise_o/` | History con gráfico y logros XP | ⏳ A implementar |
| `foco_paso_completado/` | Celebración con confetti | ⏳ A implementar |
| `onboarding_concepto/` | Onboarding "Un paso a la vez" | ⏳ A implementar |
| `onboarding_comenzar/` | Onboarding "Tu flujo comienza aquí" | ⏳ A implementar |
| `permisos_notificaciones_fcm/` | Permiso notificaciones v1 | ⏳ A implementar |
| `ajustes_notificaciones/` | Permiso notificaciones v2 | ⏳ A implementar |
| `perfil_y_configuraci_n/` | Perfil y configuración | ⏳ A implementar |
| `historial_mis_insignias/` | Galería de insignias | ⏳ A implementar |
| `sistema_cargando/` | Loading con spinner animado | ⏳ A implementar |
| `login_acceso/` | Login "Bienvenido de vuelta" | ⏳ A implementar |
| `registro_nueva_cuenta/` | Registro "Comienza tu camino" | ⏳ A implementar |
| `conflicto_de_sincronizaci_n/` | Resolución de conflictos de sync | ⏳ A implementar |

El plan de migración está desglosado en 12 issues en GitHub (labels por tipo: `feat`, `backend`, `refactor`, etc.; no se usa `ready-for-agent`).

---

## Checklist de E2 — Entrega 18 de Agosto

### Track A — Migración visual (12 issues en GitHub)
- [x] **Prefactor:** Theme system + carga de fuentes (issue #3)
- [x] **Slice 1:** FocusScreen rediseñada con TimerWidget (issue #4)
- [x] **Slice 2:** TaskList con bento grid (issue #5)
- [x] **Slice 3:** TaskDetail + StepForm rediseñadas (issue #6)
- [x] **Slice 4:** History + Step Celebration con confetti (issue #7)
- [x] **Slice 5:** Onboarding (2 pantallas) + Notificaciones v1 (issue #8)
- [x] **Slice 6:** Perfil + Insignias (issue #9)
- [x] **Slice 7:** GlassTabBar + reestructuración navegación (issue #10)
- [ ] **Slice 8:** Animaciones y polish (issue #11) — priorizada a E3
- [x] **Slice 9:** Auth Flow — Login + Register (issue #13) — ver `docs/B2 - Auth flow checklist.md`
- [ ] **Slice 10:** XP/Level + Notificaciones v2 (issue #12) — priorizada a E3
- [ ] **Slice 11:** SyncConflictScreen (issue #14) — pantalla implementada y cableada; su revisión formal quedó en E3

### Track B — Backend
- [x] Setup del proyecto Node.js + Express + TypeScript
- [x] Configurar Prisma + PostgreSQL en Railway
- [x] Endpoints de autenticación (register + login + JWT)
- [x] Endpoints de tareas (CRUD)
- [x] Endpoints de pasos (CRUD)
- [x] Endpoints de sync (push + pull + migrate)
- [x] Hosting funcionando en Railway (URL: `https://stepup-backend-api-production.up.railway.app`)
- [x] B1 (issue #17) cerrado — ver `docs/B1 - Railway deploy checklist.md`
- [x] B2 (issue #18) + Slice 9 (issue #13) cerrados — ver `docs/B2 - Auth flow checklist.md`
- [x] PRs #78-#82 de endurecimiento reviewados y mergeados a `develop2` (epic #64, issues #65-#77)
- [x] Integrar `develop2` → `develop` (checkpoint, PR #121 / issue #120) y eliminar `develop2`

### Problem discovery (13/08/2026)
- Judgment Day del backend en `develop2` → epic #64 + issues #65-#77 (JWT fail-closed, password 8, idempotencia, migración segura, fechas ISO, completeStep transaccional, orderIndex, reorder, zona horaria, PATCH vacío, error middleware, índices).
- Revisión de PRs #78-#82 y comentarios de review publicados (el #82 tiene un hallazgo CRÍTICO de IDOR en `/api/sync/migrate` por scope fijo — registrado como issue #123 en E3).
- Flujo de resolución de issues definido en `docs/CONVENCIONES.md` §7.

### Integración
- [x] Conectar app al backend cuando hay sesión activa
- [x] Flujo offline-first: sin cuenta → SQLite local
- [x] Migración de datos locales al registrarse
- [x] Sync pull/push funcionando con last-write-wins
- [x] Fix de bugs críticos (PRs #99-#121)
- [ ] Merge develop → main + tag v2.0-E2 (opcional — el equipo decidió no mergear en este ciclo de documentación)
- [ ] Generar APK o link de Expo Go para la demo

---

## Cómo retomar este proyecto en un nuevo chat

Pegar este documento como contexto y decirle al modelo desde dónde retomar. Por ejemplo:

- "Continuemos con la implementación de TaskListScreen para el Integrante B"
- "Necesito el documento de Testing E1"
- "Quiero implementar FocusScreen conectada a los servicios reales"
- "Armame el Manual de usuario v1"
- "Tengo un error al correr el proyecto, este es el mensaje: ..."

El modelo puede retomar cualquier parte del proyecto con este documento como base.

---

## Notas varias

- El nombre **StepUp** es definitivo.
- El costo total estimado del proyecto es $0 a $5 — todas las herramientas tienen tier gratuito suficiente para la escala académica.
- Plataforma de demo: **Android**. iOS es secundario.
- Expo Go requiere SDK 54. No usar SDK 55.
- Repositorio GitHub: https://github.com/YahirAedo/stepup
- Hosting backend: Railway (tier gratuito)
- Los issues de E2 están en GitHub con labels por tipo (frontend, backend, auth, database).
- Este documento se actualiza cada vez que cambia el contexto del proyecto.
- Para retomar el proyecto en un nuevo chat, pegar este documento como contexto inicial.