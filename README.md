# StepUp 📋

> **Un paso. Solo uno. Ahora.**

Aplicación mobile anti-procrastinación que combate la *task paralysis* descomponiendo cualquier tarea grande en pasos pequeños y accionables de 5 a 15 minutos. La pantalla principal muestra **únicamente el próximo paso pendiente**, eliminando la sensación de abrumamiento que impide arrancar.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Estado del proyecto](#estado-del-proyecto)
- [Tech stack](#tech-stack)
- [Requisitos previos](#requisitos-previos)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Branching strategy](#branching-strategy)
- [Testing](#testing)
- [Entregas](#entregas)
- [Equipo](#equipo)

---

## Descripción

StepUp resuelve un problema concreto: las personas saben que tienen tareas importantes pero cuando las ven como un bloque grande, el cerebro entra en modo de evitación. Las apps de to-do list tradicionales organizan las tareas pero no reducen esa barrera cognitiva.

**Cómo funciona:**

1. El usuario carga una tarea con nombre y fecha límite opcional.
2. La divide manualmente en pasos de 5–15 minutos.
3. La app muestra **solo el próximo paso**, no la lista completa.
4. El usuario ejecuta el paso, opcionalmente con un timer.
5. Al completarlo, aparece el siguiente automáticamente.
6. Cuando todos los pasos están listos, la tarea se registra en el historial.

---

## Estado del proyecto

**Entrega 1 — En desarrollo** (Marzo – Mayo 2026)

| Módulo | Estado |
|---|---|
| Gestión de tareas (CRUD) | 🟡 En desarrollo |
| División en pasos | 🟡 En desarrollo |
| Vista Foco (próximo paso) | 🟡 En desarrollo |
| Timer opcional por paso | 🟡 En desarrollo |
| Completar pasos con avance automático | 🟡 En desarrollo |
| Historial de tareas completadas | 🟡 En desarrollo |
| Backend / sync en la nube | ⏳ Planificado para E2 |
| Notificaciones push | ⏳ Planificado para E2 |
| Sugerencia de pasos con IA | ⏳ Planificado para E3 |

> La Entrega 1 es **100% offline**. Todos los datos se guardan localmente en SQLite mediante `expo-sqlite`. No requiere conexión a internet.

---

## Tech stack

| Capa | Tecnología |
|---|---|
| Framework mobile | React Native + Expo SDK 54 |
| Lenguaje | TypeScript |
| Base de datos local | expo-sqlite (SQLite) |
| Navegación | React Navigation — Bottom Tabs |
| Testing | Jest + React Native Testing Library |
| Control de versiones | Git + GitHub |

---

## Requisitos previos

Antes de correr el proyecto, asegurate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) v9 o superior (viene con Node)
- [Expo Go](https://expo.dev/go) en tu dispositivo Android o iOS físico
- [Git](https://git-scm.com/)

Verificá las versiones:

```bash
node --version   # debe ser v18+
npm --version    # debe ser v9+
git --version
```

---

## Cómo correr el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/YahirAedo/stepup.git.git
cd stepup
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Esto abre el **Metro Bundler** en la terminal y muestra un código QR.

### 4. Abrir la app

**En el celular:** abrí Expo Go, escaneá el QR que aparece en la terminal.

**En el navegador:** presioná `W` en la terminal.

**En emulador Android:** presioná `A` en la terminal (requiere Android Studio).

> **Nota:** La base de datos SQLite se inicializa automáticamente al primer arranque. No requiere ninguna configuración manual.

---

## Estructura del proyecto

```
stepup/
├── src/
│   ├── screens/
│   │   ├── FocusScreen.tsx        # Vista Foco — próximo paso + timer
│   │   ├── TaskListScreen.tsx     # Lista de tareas activas
│   │   ├── TaskDetailScreen.tsx   # Detalle de tarea + pasos
│   │   ├── TaskFormScreen.tsx     # Crear / editar tarea
│   │   ├── StepFormScreen.tsx     # Crear / editar paso
│   │   └── HistoryScreen.tsx      # Historial de tareas completadas
│   ├── services/
│   │   ├── TaskService.ts         # CRUD tareas + completado
│   │   ├── StepService.ts         # Pasos + orden + completar
│   │   ├── TimerService.ts        # Countdown / countup por paso
│   │   └── ProgressService.ts     # Historial + contador diario
│   ├── database/
│   │   ├── db.ts                  # Conexión + inicialización SQLite
│   │   └── migrations.ts          # Schema: tasks, steps, daily_progress
│   ├── components/                # Componentes UI reutilizables
│   └── types/
│       └── index.ts               # Interfaces TypeScript
├── App.tsx                        # Entry point + navegación bottom tabs
├── app.json
├── tsconfig.json
└── package.json
```

---

## Branching strategy

| Rama | Uso |
|---|---|
| `main` | Versión estable y demostrable. Solo recibe merges desde `develop`. **Esta es la rama que se entrega.** |
| `develop` | Rama de integración. Todo el desarrollo se integra aquí antes de pasar a `main`. |
| `feature/*` | Una rama por historia de usuario. Ej: `feature/HU-01-crear-tarea`. |

### Convención de commits

```
feat: agregar pantalla de creacion de tarea
fix: corregir contador diario al reabrir la app
test: agregar casos de prueba para StepService
docs: actualizar README
refactor: separar logica del timer en TimerService
chore: instalar expo-sqlite y configurar
```

---

## Testing

```bash
# Correr todos los tests
npm test

# Con coverage
npm test -- --coverage

# Modo watch
npm test -- --watch
```

---

## Entregas

| Entrega | Período | Stack | Estado |
|---|---|---|---|
| E1 | Marzo – Junio 2026 | React Native + Expo + SQLite local | 🟡 En curso |
| E2 | Junio – Agosto 2026 | + Node.js + PostgreSQL + Firebase FCM | ⏳ Planificado |
| E3 | Septiembre – Noviembre 2026 | + IA + Dashboard + Demo final | ⏳ Planificado |

---

## Equipo

Proyecto universitario — Ingeniería en Sistemas de Información — 2026

| Integrante | GitHub |
|---|---|
| Integrante A | @YahirAedo |
| Integrante B | @IamSantiFarias |
| Integrante C | @joaar |

---

*StepUp — Ingeniería en Sistemas de Información — 2026*
