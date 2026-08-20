**StepUp**

*Minutas y Feedback — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Agosto 2026*

# 1. Introducción

Este documento registra las sesiones de trabajo de la Entrega 2 (fechas verificables contra la actividad del repositorio) y el feedback recibido que impactó decisiones de producto y de diseño.

# 2. Registro de Sesiones de Trabajo

## 2.1 Iteración 1 — Migración visual (Julio 2026)

| Sesión | Foco | Evidencia en repo |
| --- | --- | --- |
| 02/07 | Kick-off E2: prefactor de Theme + Fuentes, slices 1-4 (Focus, Task List, Task Detail, History) | Issues #3–#7 creadas |
| 21/07 | Refinamiento de diseño: responsive scaling de componentes (EmptyState, TimerWidget, Focus, StepComplete) | Issues #39–#41 |
| Julio | Design review → decisión de adoptar el sistema **Zenith Vitality** (paleta, tipografía Manrope + Plus Jakarta Sans, glassmorphism) | DT-13, DT-14 (Log Decisiones E2) |

**Resultado:** las pantallas rediseñadas quedaron listas (slices 1–4 cerradas). Quedó registrado el plan de polish (slice 8, luego priorizado a E3).

## 2.2 Iteración 2 — Backend, auth y sync (Agosto 2026)

| Sesión | Foco | Evidencia en repo |
| --- | --- | --- |
| 11/08 | Backend scaffold + deploy Railway (B1) y flujo de auth (B2) | Issues #17, #18; checklists B1/B2 |
| 13/08 | Task/Step CRUD (B3), sync push/pull/migrate (B4), setup de ESLint/Prettier/Vitest, herramientas de GitHub (Dependabot, issue forms, branch protection), slices 5–7 (onboarding, perfil, GlassTabBar) | Issues #19, #20, #32–#34, #8–#10; PRs #84, #87, #92 |
| 17/08 | Hardening del backend: epic #64 (JWT fail-closed, password, fechas ISO, idempotencia, completeStep transaccional, reorder, errores JSON, índices) | PRs #99–#107; issues #65–#77 |

## 2.3 Iteración 3 — Consolidación y cierre (17-18/08/2026)

| Sesión | Foco | Evidencia en repo |
| --- | --- | --- |
| 17/08 | Aislamiento de la DB local por usuario (owner), seed separado, fixes de sync | PRs #103, #104, #114 |
| 18/08 | Web: SQLite OPFS, journal_mode, date picker, responsive; navegación tipada; tests de servicios; cierre de `as any` | PRs #108–#119 |
| 18/08 | **Integración develop2 → develop** (PR #121) y eliminación de develop2 | Issue #120, PR #121 |
| 18/08 | Review final de entrega: se detectaron #122–#126 (bugs re-priorizados a E3) y se aprobó el plan de documentos de la entrega | Issues #122–#126 |

# 3. Feedback Recibido

## 3.1 Feedback de diseño (revisión interna y del sistema)

| Feedback | Acción | Estado |
| --- | --- | --- |
| El diseño de E1 era funcional pero genérico (azul #2563EB, fuente del sistema) | Creación del sistema Zenith Vitality con tokens, glassmorphism y componentes propios | Completado en E2 |
| "Completar un paso debería sentirse como un logro" | Pantalla de celebración con check animado y confetti (HU-21) + checkboxes animados (HU-19) | Completado en E2 |
| La fecha límite se ingresaba a mano | Date picker en web (#60) | Completado (PR #115); nativo sigue siendo campo |
| El layout no respetaba el notch y el FAB tapaba contenido | Ajuste de GlassTabBar/FAB (#59) y responsive por ancho (#61) | Completado (PRs #62, #116) |

## 3.2 Feedback de usuario (pruebas informales)

| Feedback | Acción | Estado |
| --- | --- | --- |
| "Quiero seguir usando la app sin registrarme" | Modo offline sin cuenta + migración de datos al registrarse (HU de sync) | Completado en E2 |
| "Tengo miedo de perder mis datos si desinstalo" | Sincronización con cuenta en Railway | Completado en E2 |
| "Quiero elegir cuánto dura cada paso" | Duración por paso + duración default configurable en Perfil | Completado en E2 |

## 3.3 Feedback del docente (reunión de iteración)

> **Pendiente de completar** después de la presentación de la Entrega 2: registrar aquí los comentarios y aprendizajes de la demo final, y convertirlos en issues para E3 (el mismo mecanismo usado con #122–#126).

# 4. Mecánica de Feedback

El feedback se convierte en issues con label (`bug`, `feat`, `refactor`, `docs`) y se prioriza en el milestone correspondiente (E2 cerrado; E3 para lo pendiente). Los comentarios del docente y minutas de reunión se almacenan en la carpeta **Feedback de usuarios** del Drive del proyecto.

*StepUp — Minutas y Feedback E2 — Versión 1.0 — Agosto 2026*