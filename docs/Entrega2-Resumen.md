# StepUp — Entrega 2: Resumen Ejecutivo

## 1. Qué es StepUp

App mobile anti-procrastinación que fragmenta metas grandes en pasos de 5–15 min. La pantalla principal muestra **solo el próximo paso pendiente**, eliminando la parálisis cognitiva de las listas tradicionales. Técnica: fragmentación de metas + timer opcional + historial de ritmo.

---

## 2. Lo propuesto para la Entrega 2 (Jul–Ago 2026)

| Objetivo | Estado |
|----------|--------|
| Migración visual completa al sistema **Zenith Vitality** | ✅ |
| Backend REST: Node.js + Express + Prisma + PostgreSQL (Railway) | ✅ |
| Autenticación JWT (registro + login + sesión persistente) | ✅ |
| Sync offline-first híbrida (sin cuenta = local; con cuenta = nube) | ✅ |
| 16 pantallas: onboarding, auth, Focus, Tasks, History, Badges, Profile, SyncConflicts | ✅ |
| Suite de tests: app (vitest) + backend (jest/supertest) | ✅ |
| CI quality gates (lint + typecheck + test en PRs) | 🟡 Pendiente (#127) |

---

## 3. Nuevas incorporaciones (E2 vs E1)

- **Sistema de diseño Zenith Vitality**: glassmorphism, paleta verde/naranja/azul, Manrope + Plus Jakarta Sans, 12 componentes reutilizables
- **Backend completo**: 5 modelos Prisma, 4 migraciones, endpoints con `Idempotency-Key` (patrón Stripe)
- **Auth & Sync**: JWT fail-closed, migración de datos al registrarse, push/pull automático, resolución de conflictos (screen registrada, wiring pendiente E3)
- **Navegación**: GlassTabBar flotante (4 tabs), stacks anidados tipados
- **Calidad**: 111 tests app / 15 suites + 94 tests backend / 9 suites

---

## 4. Organización del desarrollo y seguridad del repositorio

### Stack & Convenciones
- **Tech**: React Native + Expo SDK 54, TypeScript, SQLite local (expo-sqlite), Node/Express/Prisma/PostgreSQL
- **Archivos de contexto obligatorios**: `docs/Contexto.md`, `docs/CONVENCIONES.md`, `.claude/skills/zenith-vitality-ds/SKILL.md`, `AGENTS.md`
- **Convenciones**: Theme tokens obligatorios (nunca hardcodear), servicios fuera de screens, navegación tipada, ESLint + Prettier + Vitest

### Seguridad y organización del repositorio
- **Branch protection** en `main` y `develop`: PR obligatorio + 1 aprobación + linear history + force-push/borrado bloqueado (admins incluidos)
- **Ramás**: `main` ← `develop` ← `feature/*` (nunca commit directo); `develop2` transitoria para backend → unificada PR #121 y eliminada
- **Commits convencionales**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` — selectivos (nunca `git add -A`)
- **CI/CD**: Dependabot semanal (`npm` + `github-actions`), vulnerability alerts, secret scanning, push protection
- **Issue forms** y plantillas de PR obligatorias; milestones por entrega (E1, E2, E3)
- **Tests obligatorios**: vitest app (111/15) + jest backend (94/9) — requieren Postgres local

---

## 5. Lo conseguido (Métricas reales del repo)

| Métrica | Valor |
|---------|-------|
| Commits en `develop` | 82 |
| Pantallas implementadas | 16 |
| Tests app (vitest) | 111 / 15 suites ✅ |
| Tests backend (jest) | 94 / 9 suites ✅ |
| Modelos Prisma | 5 |
| Migraciones Prisma | 4 |
| Issues totales | 53 (44 cerradas, 9 abiertas) |
| PRs totales | 74 (62 mergeadas, 6 cerradas, 6 abiertas) |
| Issues milestone E2 | ~20 cerradas |
| Backend en Railway | health 200 OK, migraciones auto |

---

## 6. Bugs detectados y pendientes (→ Milestone E3)

| ID | Descripción | Severidad |
|----|-------------|-----------|
| #122 | Borde de día en UTC desfasa contadores en husos negativos | Baja |
| #123 | **IDOR en `/api/sync/migrate`**: scope fijo compartido + usuario fake | **Alta** |
| #124 | Idempotencia client-side anulada: key nueva por llamada anula replay | Media |
| #125 | Docs PRD desincronizadas (PUT vs PATCH, endpoints anidados) | Baja |
| #126 | `as any` residuales en Login/Register/SyncConflict | Baja |

> **Prioridad**: resolver #123 y #124 antes de demo final.

---

## 7. Demo — Cómo correr el proyecto

```bash
# Frontend (app)
npm install
EXPO_PUBLIC_SEED_DB=true npx expo start --web --port 8090
# Abre http://localhost:8090 → datos de demo (4 tareas, 7 días progreso)

# Backend (opcional, requiere Docker)
cd backend
docker compose up -d
cp .env.example .env   # definir JWT_SECRET + DATABASE_URL
npx prisma migrate deploy
npm run dev            # http://localhost:3000
```

**Credenciales de prueba**: cualquier email/password (mín 8 chars) en Railway. Sin cuenta = modo offline 100% local.

---

## 8. Qué sigue (Entrega 3 — fecha a definir)

1. **Slices pendientes**: animaciones/micro-interacciones (slice 8), XP/Level + notificaciones v2 (slice 10), cablear `StepCompleteScreen` (slice 11)
2. **Bugs críticos**: #123 IDOR migrate, #124 idempotencia cliente
3. **IA**: sugerencia de pasos con LLM (on-device o API)
4. **Dashboard web** administrativo / métricas de uso
5. **Demo final pulida**: APK firmado + video walkthrough + defensa del proyecto