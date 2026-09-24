# StepUp — Resumen de avance de la Entrega 3

> Documento preparado para generar la presentación de la Entrega 3 (entregada el 24/09/2026).
> Fuente de datos: repo completo (código, commits, PRs, issues, workflows de GitHub, tablero).
> Fecha de entrega: 24 de septiembre de 2026.

---

## 1. Ficha de la entrega

| Campo | Valor |
|---|---|
| Materia | Ingeniería en Sistemas de Información (cursada 2026) |
| Proyecto | **StepUp** — app anti-procrastinación "Un paso. Solo uno. Ahora." |
| Entrega | **E3**, **entregada el 24/09/2026** (cierre anticipado: alcance implementado a esa fecha) |
| Foco planificado | **IA con Google Gemini** (sugeridor de pasos + asistente de descripción) + **dashboard de consistencia** (racha + tendencia semanal) |
| Plan detallado | `docs/Entrega 3 PRD.md` — epic GitHub **#152** |
| Repo | https://github.com/YahirAedo/stepup |
| Backend en producción | https://stepup-940v.onrender.com (migrado de Railway a **Render + Neon**, PR #274) |
| Milestone E3 | 16 issues cerradas · 5 abiertas (3 de ellas fuera de alcance/planificadas) |
| Cierre E2 | Release `entrega-2` (tag `v2.0.0-entrega2`, 20/08/2026) |

---

## 2. Resumen ejecutivo

Desde la entrega E2 (20/08/2026) la Entrega 3 avanzó en **6 frentes**, con **33 PRs mergeados a `develop`** (principalmente en septiembre):

1. **IA en producción** — backend con endpoints de Gemini (sugerir pasos + asistente de descripción), prompts con reglas de dominio, sanitización anti prompt-injection, retry con backoff, timeout y **cache LRU** para reducir costos; frontend con botón "Sugerir pasos con IA" y borrador editable en TaskForm, más generación desde el detalle de la tarea.
2. **Descripción como atributo persistente** de la tarea (SQLite + PostgreSQL + contrato de sync) — todo el pipeline offline-first la sincroniza.
3. **Deuda técnica de E2 resuelta** — borde de día UTC (alimenta las rachas), IDOR en `/api/sync/migrate`, idempotencia client-side anulada, tipado de SyncConflictScreen.
4. **Endurecimiento del backend** — helmet + CORS restrictivo, rate limiting (login/register/migrate/IA), validación de `updatedAt`, cache de respuestas IA.
5. **Accesibilidad (a11y)** — epic #207: migración masiva de `TouchableOpacity` → `Pressable` con roles, labels y estados para lectores de pantalla (~34 controles, 14 pantallas).
6. **Consistencia con el design system** — epic #208: casing uppercase vía token, headers de sección uniformes, `letterSpacing` desde el token, CTAs en sentence case.

Además se automatizó todo el review de PRs (CodeRabbit + skill-review con OpenCode), se configuró Dependabot hacia `develop`, se agregó CodeQL + CI con quality gates, y se migró el hosting de Railway (plan vencido) a Render + Neon (free permanente) con nuevo APK apuntando a la URL de prod.

**No alcanzado al cierre (24/09):** dashboard de consistencia (#156, bloqueado) y el resto del epic #205 (responsive/fidelidad, parcialmente en curso).

---

## 3. Plan de E3 vs. realidad (slices)

Fuente: `docs/Entrega 3 PRD.md` (epic #152). Los slices se desglosan en issues del milestone Entrega 3.

| Slice | Issue | Qué es | Estado |
|---|---|---|---|
| 1 | #153 | Descripción como atributo persistente (SQLite + Prisma + sync) | ✅ Mergeado (PR #176, 21/09) |
| 2 | #154 | Backend IA: `POST /api/ai/suggest-steps` + asistente de descripción (Gemini vía proxy) | ✅ Mergeado (PR #179, 22/09) + hardening |
| 3 | #155 | Frontend: sugerir pasos con IA al crear tarea (borrador editable + regenerar) | ✅ Mergeado (PR #261, 22/09) |
| 4 | #157 | Frontend: generar pasos con IA desde el detalle de tarea | ✅ Mergeado (PR #263, 22/09) |
| 5 | #156 | Dashboard de consistencia: racha (1 día de gracia fijo) + tendencia semanal | ⏳ Abierto (bloqueado) |

> El epic #152 sigue abierto por el slice 5 (#156) y deuda menor (#126).

**Nota de modelo:** el modelo planificado `gemini-2.5-flash` fue deprecado por Google para keys nuevas; el default es `gemini-3.5-flash` y en prod se usa `gemini-3.5-flash-lite` (más barato/rápido en el tier gratis).

---

## 4. IA en producción (el corazón de la E3)

### 4.1 Backend — módulo de IA (`backend/src/services/ai.service.ts` + controller + routes)

- **Endpoints autenticados** (requieren JWT, tasa limitada 10 req/min):
  - `POST /api/ai/suggest-steps` → `{ steps: [{ name, duration_min }] }` (3–8 pasos, 5–25 min c/u).
  - `POST /api/ai/describe-help` → `{ sections: [{ title, guiding_question }] }` (3–5 secciones; el asistente **guía**, no escribe por el usuario).
- **Conexión a Gemini**: REST directo (`generativelanguage.googleapis.com`), `responseMimeType: application/json` para salida estructurada. Sin SDK.
- **La key vive SOLO en el backend** (`GEMINI_API_KEY` en env de prod) — nunca en el bundle de la app.
- **Prompt engineering** con reglas de dominio codificadas: pasos con verbo concreto en infinitivo, duración entera 5–25 min (rango Pomodoro), derivados del contexto (nunca genéricos), orden lógico, size-adaptativo 3–8.
- **Sanitización de la salida** (`sanitizeSteps`/`sanitizeSections`): valida tipos, recorta a los rangos del dominio (5–25 min, 3–8 pasos, 6 secciones máx.) y descarta respuestas inválidas.
- **Anti prompt-injection** (#243): el input del usuario se limpia (se eliminan etiquetas y caracteres de control) y el prompt instruye explícitamente que el contenido del usuario es *datos*, no instrucciones.
- **Robustez**: timeout de 90 s por request, retry con backoff exponencial en 429/5xx (3 intentos), errores mapeados como `AiProviderError` (502) / `AiRateLimitError` (429).
- **Cache LRU de respuestas** (#247): key = hash SHA-256 de `[endpoint, taskName, description]`, TTL 1 h, max 100 entradas → evita llamadas duplicadas y reduce consumo del free tier.

### 4.2 Frontend — flujo de creación con IA

- **`src/services/AIService.ts`**: cliente del backend (usa `apiFetch` + sesión local). Nunca toca la key.
- **`src/hooks/useIsOnline.ts`**: detecta conectividad; si hay sesión y conexión, se muestra la IA (HU-14: la IA nunca bloquea; offline → flujo manual intacto, el botón ni aparece).
- **TaskFormScreen** (`src/screens/TaskFormScreen.tsx`):
  - Botón **"Sugerir pasos con IA"** (solo en creación, online y con sesión).
  - **Borrador editable** (`src/components/SuggestedStepsDraft.tsx`): lista de pasos con nombre y duración editables, se pueden borrar/agregar, botón **"Otra propuesta"** que re-genera la secuencia completa.
  - **Asistente de descripción**: botón que muestra la plantilla contextual (`sections` con pregunta guía).
  - Al confirmar, tarea + pasos nacen juntos (`TaskService.createWithSteps`) — HU-12.
  - Validación del borrador en `src/utils/draftSteps.ts` (nombre obligatorio, duración entera positiva).
- **TaskDetailScreen** (`src/screens/TaskDetailScreen.tsx`): botón **"Generar pasos con IA"** que usa la descripción guardada para agregar pasos a una tarea existente (HU-13) — mismo borrador editable, reutilizado.
- **Errores legibles**: `aiErrorMessage()` traduce fallos (sin red, 429, 502) sin romper el flujo manual.

### 4.3 Pruebas de IA

- `backend/src/tests/ai.test.ts` (mock del cliente HTTP de Gemini): input válido → pasos; inválido → 400; proveedor caído → 502; 429 → retry backoff; sanitización de rangos; cache (TTL, hit/miss).
- `backend/src/tests/cache.test.ts` (LRU).
- `src/services/AIService.test.ts` (frontend, mockeando `apiFetch`).
- Smoke test real contra Gemini documentado (issue #273: `suggest-steps` devuelve 6 pasos en prod).

---

## 5. Descripción persistente de la tarea (slice 1, #153)

- **SQLite**: migración **V6** `ALTER TABLE tasks ADD COLUMN description TEXT` (`src/database/migrations.ts`). Sistema de migraciones con detección de *gaps* (lanza error si falta una versión).
- **PostgreSQL**: migración Prisma `add_task_description` (6 migraciones totales en backend).
- **Sync**: el campo `description` viaja en el contrato de sync (push/pull/migrate), preservada entre dispositivos.
- **Frontend**: campo multiline (max 1000 chars) en TaskFormScreen, visualización en TaskDetailScreen; opcional (HU-2: crear rápido sin completarla).
- **Regla del dominio**: descripción opcional para crear, *necesaria* para una buena sugerencia de pasos.

---

## 6. Deuda técnica de E2 resuelta (prioridad del PRD)

| Issue | Problema | Fix | Merge |
|---|---|---|---|
| #122 (alta) | Borde de día en UTC desfasaba contadores en zonas negativas (HU-15) | Fecha local de completado para contadores diarios; migración SQLite **V7** `steps.completed_date` + `dateFormat`/`date` con zona local | PR #167 (21/09) |
| #123 (alta) | **IDOR** en `/api/sync/migrate`: scope fijo de idempotencia compartido entre usuarios | Se elimina el scope fijo y el usuario fake; el replay de migrate se autoriza por `email + password + hash del payload`; maps guardados en el propio user | PR #174 (16/09) |
| #124 (media) | Idempotencia client-side **anulada** (key nueva por llamada en retries) | Key persistente por operación (migración V5 `pending_idempotency_keys`), hash de payload con `expo-crypto`, retries reusan la misma key hasta éxito confirmado | PR #175 (16/09) |
| #14 | SyncConflictScreen sin tipado | Tipado completo + tests unitarios del resolver de conflictos (`src/utils/syncConflict.ts`) | PR #255 (22/09) |
| #126 (baja) | `as any` restantes | Parcialmente resuelto (PR #265 corrigió `as any` en ProfileScreen); #126 sigue abierto | Parcial |

> #125 (docs PRD) se cerró como "no hacer" — el PRD se actualizó en la propia E3.

---

## 7. Endurecimiento de seguridad del backend (#244–#246 → PR #248)

- **#244 — Security headers + CORS**: `helmet` activado, `X-Powered-By` deshabilitado, CORS restrictivo por lista de orígenes (`CORS_ORIGINS`), `trust proxy` correcto detrás del proxy de prod.
- **#245 — Rate limiting** (`backend/src/config/rate-limits.ts`): login 5/min, register 3/min, migrate 2/min, IA 10/min por IP, con `standardHeaders` para backoff del cliente; límites elevados en test para no flakear.
- **#246 — Validación de `updatedAt` en sync**: rechaza timestamps futuros (tolerancia 60 s de clock skew) e `updatedAt < createdAt`.
- **#247 — Cache de respuestas IA** (LRU, ver §4.1).
- **#243 — Anti prompt-injection** (ver §4.1).
- **Tests**: `backend/src/tests/security.test.ts` con 10 casos que ejercitan el rate limiter real.

---

## 8. Accesibilidad — epic #207 (issues #211–#215)

Migración completa de controles táctiles a componentes nativos accesibles + roles/labels para lectores de pantalla:

| Issue | Qué | PR mergeado |
|---|---|---|
| #211 | `Button.tsx` → Pressable con `role="button"`, `accessibilityLabel` y `accessibilityState={{ disabled }}` | #260 |
| #212 | `StepItem.tsx` checkbox → Pressable con `role="checkbox"`, label dinámico (nombre + estado completado/pendiente/en curso), hint de long-press | #262 |
| #213 | Migrar **todos los screens** TouchableOpacity restantes → Pressable con roles (14 pantallas, ~34 controles; TaskList, TaskDetail, TaskForm, StepForm, Profile, StepComplete, Onboarding×2, NotificationPermission, Login, Register, SyncConflict, Badges, History) | Contenido ya en develop (PR #264 pendiente de cierre) |
| #214 | Labels y roles en controles icon-only y toggles (llegan a leerse con TalkBack/VoiceOver) | #265 |
| #215 | Resolver controles "muertos" que parecían botones (feedback visual / handler real) | #266 |

---

## 9. Consistencia de diseño / casing — epic #208 (issues #216–#219)

| Issue | Qué | PR mergeado |
|---|---|---|
| #216 | Uppercase global de `label-sm` en el **token** (`src/theme/typography.ts`, expone `textTransform` en `TypographyStyle`) → aplica por construcción a los 31 usos | #256 (+ #269 duplicado) |
| #217 | Headers de sección unificados al patrón de TaskList (label-sm + uppercase) | PR #258 abierto |
| #218 | Eliminar `letterSpacing` inline arbitrarios (1/2) → vive solo en el token | #257 |
| #219 | Títulos de CTAs en **sentence case** (12 strings en 8 screens) | #259 |

Apoyado en la documentación de diseño: **GUIA-DISENO-MOVIL.md** como fuente de verdad móvil (PR #234) con la cláusula de evolución del diseño + registro DT-29 (PR #235).

> Otras issues abiertas del epic visual/responsive (epic #205) que siguen en curso: hex hardcodeados → tokens (#226), LineChart/ProgressRing (#225), ScreenContainer (#210), Focus/Profile/auth/TaskForm con tokens (#221–#224), GlassTabBar real con expo-blur (#220) y enforcement `check:ds` (#237).

---

## 10. Infraestructura, CI/CD y herramientas de GitHub

### 10.1 Automatización del review de PRs (septiembre)
- **CodeRabbit** configurado (`.coderabbit.yaml`, PR #186) — revisión automática de PRs contra `develop` (informativa, no bloqueante).
- **skill-review** (PR #188 + fixes #190, #191, #193, #203): workflow propio con OpenCode (agent `skill-reviewer` + OpenRouter free) que revisa cada PR contra su issue y emite veredicto `APPROVED | NEEDS WORK | BLOCKED | SKIPPED`. Evolución: considera el contexto completo del PR (#202 → comments, reviews, threads, sub-issues).
- Dependabot reconfigurado (#236) hacia `develop`, mensual, PRs agrupados, ignorando majors de Expo (protege SDK 54).

### 10.2 Workflows activos (Actions)
| Workflow | Rol |
|---|---|
| `CI - Quality Gates` | lint + typecheck + tests frontend + tests backend (con Postgres 16 en service container) |
| `CodeQL - Code Scanning` | análisis de seguridad estático |
| `skill-review` | review automático con agente OpenCode + OpenRouter |
| `Close linked issue on develop merge` | cierra la issue vinculada cuando el PR entra a develop |
| Dependabot Updates | mantenimiento de dependencias diferenciado (root y backend) |

### 10.3 Deploy — migración Railway → Render + Neon (issue #273 → PR #274, 24/09)
- **Motivo**: el plan free de Railway del dueño original venció (404 en prod).
- **Decisión verificada en prod**:
  - Backend: **Render** Web Service (free, sleep tras 15 min, spin-up ~1 min).
  - BD: **Neon PostgreSQL** (free **permanente**, no expira) — región Oregon (us-west-2) en ambos.
  - `DATABASE_URL` directa de Neon (sin `-pooler`); `prisma migrate deploy` aplicó las 6 migraciones.
- Env prod: `GEMINI_MODEL=gemini-3.5-flash-lite`, `GEMINI_API_KEY`, `JWT_SECRET`.
- **Nueva URL prod**: `https://stepup-940v.onrender.com` (`/api/health` 200, register 201, login 200, suggest-steps 200).
- `eas.json` con perfil `apk` apuntando a la URL nueva → **nuevo APK generado**.
- Registro de DT del cambio de hosting en `docs/Log Decisiones Tecnicas E2.md`.

### 10.4 Hardening general de GitHub (#159 → PR #160)
CodeQL, CI backend con base de datos real, checks requeridos en ramas protegidas y silenciamiento de Dependabot no funcional.

---

## 11. Testeo

| Nivel | Suite | Alcance |
|---|---|---|
| Frontend | Vitest (React Native Testing Library) | **152 casos** en **17 archivos** (`src/**/*.test.ts`) — Task/Step/Timer/Progress/Auth/Sync services, syncLifecycle (incl. idempotencia), migraciones, seed, date, idempotencia, AIService, SyncConflict |
| Backend | Jest + supertest | **+164 casos** en **13 archivos** (`backend/src/tests/*.test.ts`) — auth, tasks, steps, sync, migrate, idempotencia, progreso, AI, cache, env, error-handler, security (10 casos) |

Los tests corren en CI (Quality Gates) con Postgres 16 real para el backend.

---

## 12. Métricas del repo (ven 20/08 → 24/09)

| Métrica | Valor |
|---|---|
| PRs mergeados a `develop` (E3) | **~33** sustantivos (además de varios de Dependabot cerrados al reconfigurar) |
| Commits de E3 en `develop` | ~35 (feature → squash merge) |
| Issues del milestone E3 | 16 cerradas / 5 abiertas |
| Workflows de Actions | 4 propios + Dependabot |
| Migraciones SQLite | **V1 → V7** (V5/V6/V7 son de E3) |
| Migraciones Prisma | 6 (2 nuevas en E3: migrate-hash, task-description) |
| Pantallas con soporte IA | 2 (TaskForm, TaskDetail) |
| Pantallas migradas a a11y | 14 |
| Hosting | Render (backend) + Neon (Postgres), free permanente |
| Modelo IA | `gemini-3.5-flash-lite` en prod (default `gemini-3.5-flash`) |

**Estructura de código relevante nueva:**
```
backend/src/services/ai.service.ts      ← lógica Gemini + sanitización + retry (308 líneas)
backend/src/services/cache.ts           ← cache LRU de respuestas IA
backend/src/controllers/ai.controller.ts, routes/ai.routes.ts, validations/schemas.ts
backend/src/config/rate-limits.ts       ← limiters auth + migrate
backend/src/tests/{ai,cache,security}.test.ts
src/services/AIService.ts               ← cliente frontend de IA
src/hooks/useIsOnline.ts                ← gating online para mostrar IA
src/components/SuggestedStepsDraft.tsx  ← borrador editable (editar/borrar/agregar/regenerar)
src/utils/draftSteps.ts                 ← validación del borrador
src/database/migrations.ts              ← V5..V7 (idempotencia, description, completed_date)
```

---

## 13. Estado del tablero (GitHub Projects "StepUp - Seguimiento")

Seguimiento formalizado en septiembre: **GitHub Projects v2** (PR #230, DT-28 en el Log de Decisiones E2) con columnas Backlog / Ready / In Progress / Blocked / In Review / Merged / Done y reglas de movimiento documentadas en `CONVENCIONES.md` §7.8.

---

## 14. No alcanzado al cierre (24/09/2026)

1. **Dashboard de consistencia (#156, slice 5)** — función pura `calculateStreak` (1 día de gracia fijo) + tendencia semanal con LineChart. Bloqueado hasta cerrar el epic responsive/polish.
2. Epic **#205** (responsive real en dispositivos, fidelidad al design system, casing) — issues #206–#229 abiertas.
3. **#217** headers de sección (PR #258) y **#213** cierre formal de a11y (PR #264) — ambos mergeados el 24/09.
4. Deuda menor #126 (`as any` restantes).
5. Merge `develop` → `main` + release `v3.0.0-entrega3` (patrón de E1/E2) — realizado el 24/09.
6. Fuera de alcance (confirmado en PRD): notificaciones push FCM, XP/Level (#12), slices de polish 8/10/11 (#11).

---

## Anexo — PRs sustantivos mergeados a `develop` (E3)

| # | Fecha | Título |
|---|---|---|
| 158 | 20/08 | docs: plan de la entrega 3 (IA + dashboard) |
| 160 | 20/08 | chore: hardening de GitHub (CodeQL, CI backend, checks required) |
| 161 | 10/09 | docs: guía de configuración PostgreSQL con Docker |
| 174 | 16/09 | fix(backend): eliminar scope compartido de idempotencia en migrate (IDOR) |
| 175 | 16/09 | fix(sync): reusar idempotency key persistida en retries de push y migrate |
| 176 | 21/09 | feat: description como atributo persistente de la tarea (#153) |
| 179 | 22/09 | feat: endpoint de IA para sugerir pasos + asistente de descripción (#154) |
| 167 | 22/09 | fix: fecha local en vez de UTC para contadores diarios (HU-15) |
| 186 | 07/09 | chore: configurar CodeRabbit (#185) |
| 188 | 08/09 | ci: automatizar review de PRs con skills (opencode + OpenRouter) |
| 190 | 08/09 | fix(ci): pasar GITHUB_TOKEN al workflow skill-review |
| 191 | 09/09 | docs: nota GITHUB_TOKEN y re-disparo del check skill-review |
| 193 | 09/09 | fix(ci): skill-reviewer como default_agent |
| 203 | 10/09 | refactor: skill-reviewer considera el contexto completo del PR |
| 230 | 14/09 | docs: documentar tablero StepUp - Seguimiento (Projects v2) |
| 234 | 14/09 | docs: guía de diseño y desarrollo móvil como fuente de verdad (#233) |
| 235 | 14/09 | docs: cláusula de evolución del diseño + DT-29 |
| 236 | 14/09 | chore: Dependabot hacia develop (mensual, agrupado, sin majors de Expo) |
| 239 | 14/09 | docs: referenciar guía móvil canónica en skills DS y stepup-review |
| 248 | 22/09 | fix: security backend (#244 helmet+CORS, #245 rate limiting, #246 updatedAt) |
| 255 | 22/09 | fix: tipado SyncConflictScreen + tests (#14) |
| 256 | 22/09 | refactor(design): uppercase global de label-sm en el token (#216) |
| 257 | 22/09 | refactor(design): letterSpacing solo desde el token (#218) |
| 259 | 22/09 | refactor(design): CTAs en sentence case (#219) |
| 260 | 22/09 | fix(a11y): Button Pressable + role/label/disabled (#211) |
| 261 | 22/09 | feat(frontend): sugerir pasos con IA al crear tarea (#155) |
| 262 | 22/09 | fix(a11y): StepItem checkbox role/label/state (#212) |
| 263 | 22/09 | feat: generar pasos con IA desde el detalle de tarea (#157) |
| 265 | 24/09 | fix(a11y): icon-only/switch labels y roles (#214) |
| 266 | 24/09 | fix(a11y): controles muertos (#215) |
| 269 | 24/09 | refactor(design): uppercase global en label-sm (re-entrega #216) |
| 274 | 24/09 | deploy: migrar backend de Railway a Render + Neon (#273) |

**PRs abiertos al cierre (24/09):** #272 (repair-develop, higiene local) + Dependabot (agrupados). #258, #264 y #269 se mergearon el mismo 24/09 (ver §8/§9).

**PRs cerrados sin mergear** (duplicados cuyo contenido ya estaba aplicado, orden del 24/09): #267, #268, #270, #271.

---

*StepUp — Resumen Entrega 3 — 24 de septiembre de 2026.*