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
- Integración con API de IA (Claude Haiku o GPT-4o mini)
- El usuario escribe el nombre de la tarea y la app sugiere los pasos automáticamente
- El usuario edita y confirma los pasos sugeridos
- Estimación automática del tiempo total
- Dashboard de estadísticas personales, rachas de productividad
- Notificaciones push (Firebase Cloud Messaging)
- Pulido general y demo final

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
| IA (E3) | Claude Haiku API o GPT-4o mini | Una llamada con buen prompt, sin fine-tuning |

---

## Modelo de datos (SQLite — E1)

### Tabla `tasks`
```
id           INTEGER PRIMARY KEY AUTOINCREMENT
name         TEXT NOT NULL
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
- `src/database/migrations.ts` — schema de las 3 tablas

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
│   │   └── migrations.ts
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
- `src/theme/` — sistema de diseño centralizado (colores, tipografía, espaciado, sombras)
- `src/components/` — componentes reutilizables (Button, Card, Badge, TextField, GlassTabBar, etc.)
- Rediseño de las 6 pantallas existentes + 7 nuevas pantallas
- Carga de fuentes Manrope + Plus Jakarta Sans
- **Avance:** Slice 7 (GlassTabBar + FAB + date picker) ya mergeado (#58), resposive scaling aplicado (#42-#46), Onboarding (#50), Perfil (#52). Quedan slices de polish/animaciones.

**Track B — Backend (implementado, en fixing):**
- API REST en Node.js + Express + Prisma + PostgreSQL ✅
- Autenticación JWT (registro + login) ✅
- Sync offline-first híbrido (push/pull/migrate) ✅
- CRUD de tasks y steps ✅
- Hosting en Railway ✅
- **Estado:** PRs abiertos a `develop2`: #78 (fechas ISO), #80 (JWT fail-closed), #81 (password 8), #82 (idempotencia real). Epics #64 + issues #65-#77 de endurecimiento. **`develop2` es transitorio:** cuando los fixes estén integrados se unifica con `develop` y desaparece.

### Sistema operativo de desarrollo
**Windows**

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
develop     ← Frontend (app RN). Rama base para issues de frontend.
develop2    ← TRANSIORIO: backend (E2). Se unifica con develop y desaparece.
feature/*   ← Una rama por cambio. Formato: feature/<tipo>/<numero>-<descripcion>
```

**Flujo de trabajo (obligatorio, ver `docs/CONVENCIONES.md` §7):**
1. Tomar una issue abierta sin assignee y **auto-asignarse** (pull rule).
2. Crear rama desde la rama correcta:
   - Backend → `git checkout develop2 && git pull && git checkout -b fix/67-idempotencia-push`
   - Frontend → `git checkout develop && git pull && git checkout -b feat/78-pantalla-x`
3. Hacer commits con formato convencional
4. Push a origin
5. Crear Pull Request a la rama correcta siguiendo `.github/PULL_REQUEST_TEMPLATE.md`
6. Alguien más revisa y mergea con squash (nadie mergea su propio PR)
7. (Backend) En cada checkpoint, un integrante designado integra `develop2` → `develop`; luego `develop2` se congela y se elimina

**Regla de oro:** nunca commitear directo a `main` ni a `develop`/`develop2`. Todo cambio entra por `feature/*` → rama destino (según área) → (integración) → `main`.

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

6. **README.md** — listo para pegar en el repo de GitHub. Tiene descripción, estado de funcionalidades, tech stack, requisitos, instrucciones de instalación paso a paso, estructura de carpetas, branching, testing, tabla de entregas. **Nota: la tabla de entregas del README todavía dice 4 entregas hasta diciembre, hay que actualizarla a 3 entregas hasta noviembre.**

### Lo que falta generar
- Documento de Testing E1 (casos de prueba + resultados + bug list)
- Manual de usuario v1 (con capturas o wireframes del flujo completo)
- Minuta de reunión con el profesor (feedback y aprendizajes)

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
- [ ] **Prefactor:** Theme system + carga de fuentes (issue #3)
- [ ] **Slice 1:** FocusScreen rediseñada con TimerWidget (issue #4)
- [ ] **Slice 2:** TaskList con bento grid (issue #5)
- [ ] **Slice 3:** TaskDetail + StepForm rediseñadas (issue #6)
- [ ] **Slice 4:** History + Step Celebration con confetti (issue #7)
- [ ] **Slice 5:** Onboarding (2 pantallas) + Notificaciones v1 (issue #8)
- [ ] **Slice 6:** Perfil + Insignias (issue #9)
- [ ] **Slice 7:** GlassTabBar + reestructuración navegación (issue #10)
- [ ] **Slice 8:** Animaciones y polish (issue #11)
- [ ] **Slice 9:** Auth Flow — Login + Register (issue #13)
- [ ] **Slice 10:** XP/Level + Notificaciones v2 (issue #12)
- [ ] **Slice 11:** SyncConflictScreen (issue #14)

### Track B — Backend (implementado, en fixing)
- [x] Setup del proyecto Node.js + Express + TypeScript
- [x] Configurar Prisma + PostgreSQL en Railway
- [x] Endpoints de autenticación (register + login + JWT)
- [x] Endpoints de tareas (CRUD)
- [x] Endpoints de pasos (CRUD)
- [x] Endpoints de sync (push + pull + migrate)
- [x] Hosting funcionando en Railway
- [ ] PRs #78-#82 de endurecimiento reviewados y mergeados a `develop2`
- [ ] Integrar `develop2` → `develop` (checkpoint) y eliminar `develop2`

### Problem discovery (13/08/2026)
- Judgment Day del backend en `develop2` → epic #64 + issues #65-#77 (JWT fail-closed, password 8, idempotencia, migración segura, fechas ISO, completeStep transaccional, orderIndex, reorder, zona horaria, PATCH vacío, error middleware, índices).
- Revisión de PRs #78-#82 y comentarios de review publicados (el #82 tiene un hallazgo CRÍTICO de IDOR en `/api/sync/migrate` por scope fijo).
- Flujo de resolución de issues definido en `docs/CONVENCIONES.md` §7.

### Integración
- [ ] Conectar app al backend cuando hay sesión activa
- [ ] Flujo offline-first: sin cuenta → SQLite local
- [ ] Migración de datos locales al registrarse
- [ ] Sync pull/push funcionando con last-write-wins
- [ ] Prueba de flujo completo en dispositivo físico Android
- [ ] Fix de bugs críticos
- [ ] Merge develop → main + tag v2.0-E2
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