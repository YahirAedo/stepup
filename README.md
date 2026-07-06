# StepUp 📋

> **Un paso. Solo uno. Ahora.**

Aplicación mobile anti-procrastinación que combate la *task paralysis* descomponiendo cualquier tarea grande en pasos pequeños y accionables de 5 a 15 minutos. La pantalla principal muestra **únicamente el próximo paso pendiente**, eliminando la sensación de abrumamiento que impide arrancar.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Estado del proyecto](#estado-del-proyecto)
- [Tech stack](#tech-stack)
- [Documentación obligatoria](#documentación-obligatoria)
- [Requisitos previos](#requisitos-previos)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Convenciones del equipo](#convenciones-del-equipo)
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

**Entrega 1 — Completada** ✅ (Marzo – Junio 2026)
App 100% offline con ciclo completo de tareas, pasos, timer e historial.

**Entrega 2 — En curso** 🟡 (Julio – Agosto 2026, entrega: 18 de Agosto)
Migración visual al diseño Zenith Vitality + backend + auth + sync.

| Módulo | Estado |
|---|---|
| Gestión de tareas (CRUD) | ✅ Completado |
| División en pasos | ✅ Completado |
| Vista Foco (próximo paso) | ✅ Completado |
| Timer opcional por paso | ✅ Completado |
| Completar pasos con avance automático | ✅ Completado |
| Historial de tareas completadas | ✅ Completado |
| Theme system + componentes UI | 🟡 En progreso |
| Backend / sync en la nube | 🟡 En progreso (E2) |
| Autenticación | 🟡 En progreso (E2) |
| Notificaciones push y onboarding | 🟡 En progreso (E2) |
| Sugerencia de pasos con IA | ⏳ Planificado para E3 |

---

## Tech stack

| Capa | Tecnología |
|---|---|---|
| Framework mobile | React Native + Expo SDK 54 (no usar SDK 55) |
| Lenguaje | TypeScript |
| Base de datos local | expo-sqlite (SQLite) |
| Navegación | React Navigation — GlassTabBar |
| Diseño visual | Sistema Zenith Vitality |
| Testing | Vitest (pendiente de configurar — issue #33) |
| Control de versiones | Git + GitHub + Conventional Commits |
| Backend (E2) | Node.js + Express + Prisma + PostgreSQL + Railway |

---

## Documentación obligatoria

Antes de escribir código, leer en este orden:

| Orden | Documento | Por qué |
|-------|-----------|---------|
| 1 | `docs/Contexto cambiable.md` | Contexto completo, entregas, decisiones técnicas |
| 2 | `docs/CONVENCIONES.md` | Reglas de estilo, arquitectura, git y calidad |
| 3 | `.claude/skills/zenith-vitality-ds/SKILL.md` | Design System: tokens, componentes, anti-patterns |
| 4 | `AGENTS.md` | Guía rápida para agentes de IA |

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
│   │   ├── StepCompleteScreen.tsx # Celebración + confetti
│   │   ├── HistoryScreen.tsx      # Historial + gráfico semanal
│   │   ├── BadgesScreen.tsx       # Galería de insignias
│   │   ├── ProfileScreen.tsx      # Perfil y configuración
│   │   ├── OnboardingScreen.tsx    # Onboarding inicial
│   │   └── FocusScreen.tsx        # Vista Foco
│   ├── services/
│   │   ├── TaskService.ts         # CRUD tareas + completado
│   │   ├── StepService.ts         # Pasos + orden + completar
│   │   ├── TimerService.ts        # Countdown / countup por paso
│   │   └── ProgressService.ts     # Historial + contador diario
│   ├── database/
│   │   ├── db.ts                  # Conexión + inicialización SQLite
│   │   └── migrations.ts          # Schema: tasks, steps, daily_progress
│   ├── components/                # Componentes UI reutilizables
│   │   ├── Button.tsx             # Botones primary/secondary/tertiary
│   │   ├── Card.tsx               # Contenedor tipo glassmorph
│   │   ├── Badge.tsx              # Etiquetas de estado
│   │   ├── TextField.tsx          # Input con label
│   │   ├── ProgressBar.tsx        # Barra de progreso
│   │   ├── ProgressRing.tsx       # Anillo SVG de progreso
│   │   ├── StepItem.tsx           # Item de paso con checkbox
│   │   ├── TimerWidget.tsx        # Display del timer
│   │   ├── GlassTabBar.tsx        # Barra inferior flotante
│   │   ├── EmptyState.tsx         # Estado vacío con CTA
│   │   ├── LineChart.tsx          # Gráfico de líneas simple
│   │   └── ConfettiOverlay.tsx    # Confetti animado
│   └── theme/
│       ├── colors.ts              # Paleta de colores
│       ├── typography.ts          # Estilos de texto
│       ├── spacing.ts             # Sistema de espaciado
│       ├── borderRadius.ts        # Radios de borde
│       └── shadows.ts             # Sombras ambientales
├── .claude/skills/zenith-vitality-ds/  # Design System skill para IA
├── docs/
│   ├── CONVENCIONES.md            # Reglas del equipo
│   ├── Contexto cambiable.md      # Contexto completo del proyecto
│   └── practicas-recomendadas.md  # Prácticas de ingeniería
├── App.tsx                        # Entry point + navegación bottom tabs
├── AGENTS.md                      # Guía para agentes de IA
├── app.json
├── tsconfig.json
└── package.json
```

---

## Convenciones del equipo

Todas las reglas de estilo, arquitectura, git y calidad están en **`docs/CONVENCIONES.md`**.

Resumen rápido:
- **Git:** `main` ← `develop` ← `feature/*`. Nunca commitear directo a main.
- **Commits:** formato convencional (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **Estilos:** siempre usar tokens del theme, nunca colores hardcodeados.
- **Arquitectura:** las screens no acceden a SQLite directamente.
- **IA:** cualquier agente debe leer `AGENTS.md` y `docs/CONVENCIONES.md` antes de escribir código.

---

## Entregas

| Entrega | Período | Stack | Estado |
|---|---|---|---|---|
| E1 | Marzo – Junio 2026 | React Native + Expo + SQLite local | ✅ Completada |
| E2 | Julio – Agosto 2026 | + Node.js + PostgreSQL + Railway | 🟡 En curso |
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
