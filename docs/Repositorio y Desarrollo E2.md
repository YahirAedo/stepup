**StepUp**

*Documento de Repositorio y Desarrollo — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Agosto 2026*

# 1. Introducción

## 1.1 Propósito

Este documento describe la organización del repositorio de StepUp durante la Entrega 2: ramas, flujo de trabajo en GitHub, gestión de issues y PRs, herramientas de calidad habilitadas y las métricas de desarrollo de la iteración.

## 1.2 Repositorio

| Atributo | Valor |
| --- | --- |
| URL | https://github.com/YahirAedo/stepup |
| Visibilidad | Público |
| Rama principal | `main` (solo entrega final, recibe merges desde `develop`) |
| Rama de desarrollo | `develop` (frontend) |
| Rama transitoria | `develop2` (backend) — unificada y eliminada el 18/08/2026 (PR #121) |
| Releases | `entrega-1` (E1) — pendiente `entrega-2` |

# 2. Ramas y Flujo de Trabajo

## 2.1 Modelo de ramas

```
main        ← Entrega final. Solo recibe merges desde develop.
develop     ← Frontend (app RN). Rama base para issues de frontend.
develop2    ← TRANSITORIA: backend (E2). Unificada con develop (18/08) y eliminada.
feature/*   ← Una rama por cambio. Formato: feature/<tipo>/<numero>-<descripcion>
```

Regla de ramas vigente durante E2:
- Issue de **backend** → rama desde `develop2` → PR a `develop2`
- Issue de **frontend** → rama desde `develop` → PR a `develop`

## 2.2 Cierre de la transición (PR #121, 18/08)

El backend, la auth y el frontend E2 quedaron integrados en una sola base (`develop`) mediante el PR #121 (issue #120). `develop2` fue eliminada. A partir de E3, todo el desarrollo usa `develop`.

# 3. Gestión de Issues

## 3.1 Categorías

Las issues de E2 se organizaron en **milestones** por entrega (E1, E2, E3) y se etiquetaron por tipo: `feat`, `bug`, `refactor`, `chore`, `testing`, `docs`, `backend`, `frontend`, `auth`, `database`, `ci`, `prd`, `epic`.

## 3.2 Backend — Epics

| Epic | Descripción | Issues |
| --- | --- | --- |
| B1 | Backend scaffold + deploy en Railway | #17 |
| B2 | Auth flow (registro + login) backend + app | #18 |
| B3 | Task CRUD + Step CRUD API | #19 |
| B4 | Sync push/pull + migrate (backend + app) | #20 |
| #64 | Endurecer backend E2 — seguridad, idempotencia y consistencia (epic de PRD) | #65–#77 |

## 3.3 Track A — Slices (migración visual)

| Slice | Issue | Estado |
| --- | --- | --- |
| Prefactor: Theme + Fuentes | #3 | Cerrada |
| Slice 1 — Focus rediseñada | #4 | Cerrada |
| Slice 2 — Task List rediseñada | #5 | Cerrada |
| Slice 3 — Task Detail + Step Form | #6 | Cerrada |
| Slice 4 — History + Step Celebration | #7 | Cerrada |
| Slice 5 — Onboarding + Notificaciones | #8 | Cerrada |
| Slice 6 — Perfil + Insignias | #9 | Cerrada |
| Slice 7 — GlassTabBar + navegación | #10 | Cerrada |
| Slice 8 — Animaciones/micro-interacciones (Polish) | #11 | **Priorizada a E3** |
| Slice 9 — Auth Flow (Login + Register) | #13 | Cerrada |
| Slice 10 — XP/Level + notificaciones v2 | #12 | **Priorizada a E3** |
| Slice 11 — SyncConflictScreen | #14 | **Abierta** (pantalla implementada y cableada; su revisión formal quedó para E3) |

## 3.4 Hardening de backend (epic #64)

Issues #65–#77 (cerradas en E2): JWT fail-closed (#65), contrato de password (#66), idempotencia real (#67), carreras/recuperación de idempotencia (#68), migración segura con datos existentes (#69), fechas ISO reales (#70), completeStep transaccional (#71), addStep sin colisión (#72), reorder estricto (#73), borde de día local (#74), body vacío → 400 (#75), errores JSON (#76), índices (#77).

# 4. Pull Requests

- 40+ PRs a lo largo de E2; **29+ mergeados** y una docena de Dependabot (seguridad).
- El PR #121 integró `develop2` → `develop` (unificación final del track backend).
- Ningún integrante mergea su propio PR (convención §7.6 de CONVENCIONES.md).
- Los PRs de la última etapa (18/08) cerraron: date picker web (#115→#60), responsive web (#116→#61), navegación tipada (#117→#86), eliminación de `as any` (#118→#89) y tests de lógica pura (#119→#88).

# 5. Calidad y Herramientas de GitHub

| Herramienta | Estado | Detalle |
| --- | --- | --- |
| Branch protection | Activa | `main` y `develop`: PR obligatorio + 1 aprobación + linear history, force-push/borrado bloqueados, admins incluidos |
| CI quality gates | **Pendiente (#90)** | PR #127 agrega lint + typecheck + tests en PRs (aún abierto) |
| Dependabot | Activo | Semanal, `npm` + `github-actions`; varios PRs de deps mergeados/abiertos |
| Vulnerability alerts / secret scanning / push protection | Activo | Repo público |
| Issue forms | Activo | `bug_report.yml` + `feature_request.yml` (#87) |
| ESLint + Prettier | Activo | Configurados en E2 (#32) |
| Vitest | Activo | Testing de la app (#33) — 111 tests |
| Jest + Supertest | Activo | Backend — 94 tests (Postgres local) |
| Releases | Parcial | `entrega-1` (tag E1); release `entrega-2` pendiente |

# 6. Métricas de la Iteración

| Métrica | Valor |
| --- | --- |
| Commits en `develop` (E2) | ~80 (desde la base de E1) |
| Issues cerradas en E2 | 20+ |
| Issues abiertas al cierre de E2 | 11 (incluye 5 bugs nuevos E3: #122–#126, CI #90 y slices #11/#12) |
| PRs mergeados | 29+ |
| Suites de test backend | 9 (94 casos) |
| Suites de test app | 15 (111 casos) |
| Pantallas implementadas | 16 |

# 7. Bugs detectados y re-priorizados

Los bugs #122–#126 se detectaron en la revisión final de E2 y se movieron al milestone E3 (ver `Testing E2.md §5`). El de mayor riesgo es #124 (idempotencia client-side anulada): se recomienda resolverlo antes de la demo.

*StepUp — Repositorio y Desarrollo E2 — Versión 1.0 — Agosto 2026*