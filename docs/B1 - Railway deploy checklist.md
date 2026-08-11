# B1 — Backend scaffold + Railway deploy (checklist de cierre)

> Issue: https://github.com/YahirAedo/stepup/issues/17
> Etiquetas: `backend`, `E2 API (Express/Prisma)`, `ready-for-agent`
> Rama base de código: `feature/backend-express-prisma-postgres` (commit `ca0912d`)
> Última actualización: 2026-08-11 (plan de ejecución por fases agregado)

## Qué pide el issue (acceptance criteria)

| # | Criterio | Estado |
|---|----------|--------|
| 1 | `backend/` con Express + TypeScript + Prisma funcionando localmente | ✅ HECHO |
| 2 | Prisma schema con User, Task, Step migrado a PostgreSQL | ✅ HECHO (local Docker) |
| 3 | Railway project creado con PostgreSQL | ❌ PENDIENTE |
| 4 | `GET /api/health` retorna 200 OK | ⚠️ desvío: hoy es `GET /health` |
| 5 | Variables de entorno configuradas (PORT, JWT_SECRET, DATABASE_URL) | ⚠️ solo valores dev locales |
| 6 | Backend responde en la URL pública de Railway | ❌ PENDIENTE |

## Lo que ya está hecho (verificado)

- [x] `backend/` con Express 5 + TypeScript + Prisma + bcryptjs + jsonwebtoken + cors + dotenv
- [x] `tsconfig.json` para Node.js, `jest.config.js` + suites de test (45/45 passing)
- [x] Schema Prisma `User`/`Task`/`Step` migrado a PostgreSQL (Docker `stepup-postgres`, DB `stepup_db`, 2 migraciones aplicadas)
- [x] Entry point con Express app, CORS, JSON parser y health check (en `src/app.ts` + `src/server.ts`)
- [x] `.env.example` con PORT, DATABASE_URL, JWT_SECRET · `.env` en `.gitignore`

## Checklist de cierre de B1

### 1. Health endpoint conforme a spec
- [x] Registrar `GET /api/health` (issue dice `/api/health`) en `backend/src/app.ts`
- [x] Decidir qué hacer con `/health` actual:
  - Opción B aplicada: app migra a `/api/health` (`src/services/api.ts` → `ENDPOINTS.health`) y `/health` se mantiene por compatibilidad (no rompe nada)
- [ ] Verificar con `Invoke-RestMethod http://localhost:3000/api/health` → 200 `{"status":"ok"}`

### 2. Desvíos menores detectados (decisión del equipo)
- [x] Entry point: se mantiene `src/server.ts` y se documenta como entry point válido (spec pedía `src/index.ts`; renombrar no aporta valor funcional)

### 3. Railway
Requisitos previos (lo hace el usuario, requiere su cuenta):
- [ ] Crear/cuenta en Railway (tier gratuito) o pedir acceso al dueño del repo
- [ ] Instalar Railway CLI: `npm i -g @railway/cli` (hoy NO está instalado)
- [ ] `railway login` en esta máquina

Proyecto y base de datos (dashboard o CLI):
- [ ] Crear proyecto `stepup-backend` en Railway
- [ ] Provisionar PostgreSQL desde el dashboard (plan gratuito)
- [ ] Obtener la `DATABASE_URL` interna del servicio Postgres

Deploy:
- [ ] Crear `railway.json` (o nixpacks auto-detection de Node.js) en la raíz de `backend/`
- [ ] Conectar el repo a Railway (dashboard → Deploy → GitHub → `YahirAedo/stepup`) o con CLI: `railway up` desde `backend/`
- [ ] Configurar env vars en Railway: `PORT=3000`, `JWT_SECRET=<secreto fuerte>`, `DATABASE_URL=<url de Railway>`
- [ ] Correr migraciones contra la DB de Railway: `npx prisma migrate deploy` con `DATABASE_URL` apuntando a Railway
- [ ] Confirmar en el dashboard que el deploy está "Deployed" y que hay una URL pública (`https://<proyecto>.up.railway.app`)

Env vars en la app (para que la app apunte al backend público):
- [ ] Setear `EXPO_PUBLIC_API_URL=https://<proyecto>.up.railway.app` en la app (override en `src/services/api.ts::resolveBaseUrl`)
- [ ] Actualizar `docs/Arquitectura E2.md` y `docs/Backend E2 PRD.md` con la URL real de producción

### 4. Verificación final de B1 (criterios de aceptación)
```bash
# 1. Local: suite completa
cd backend && npx jest --silent   # 45/45

# 2. Health en ambas rutas (local)
Invoke-RestMethod http://localhost:3000/api/health   # {"status":"ok"}
Invoke-RestMethod http://localhost:3000/health        # {"status":"ok"} (si se mantiene)

# 3. Health en producción
Invoke-RestMethod https://<proyecto>.up.railway.app/api/health   # 200 OK

# 4. Migraciones aplicadas en Railway
cd backend && $env:DATABASE_URL="<url-railway>"; npx prisma migrate status   # "Database schema is up to date"
```

## Ramas con las que vamos a trabajar

Orden de trabajo propuesto (todo converge a `develop2`):

| Orden | Rama | Acción |
|-------|------|--------|
| 1 | `feature/b1-finish` (nueva, desde tip de `feature/offline-first-sync`) | Cambio de código: `/api/health` + decisión entry point + ajustes app si aplica |
| 2 | (dashbord Railway + CLI, requiere usuario) | Proyecto, PostgreSQL, env vars, deploy, `prisma migrate deploy` |
| 3 | `develop2` (nueva desde `develop`) | Merge en orden: express → auth-sync → offline-first → `feature/b1-finish` |

Nota: el código de B1 ya vive en `feature/backend-express-prisma-postgres` (ancestro de auth-sync y offline-first). No se re-escribe; la rama `feature/b1-finish` solo agrega lo que falta del criterio 4 y el deploy.

## Plan de ejecución por fases

### Fase A — Código (agente)
1. Crear rama `feature/b1-finish` desde el tip de `feature/offline-first-sync`.
2. Registrar `GET /api/health` en `backend/src/app.ts` (spec del issue; hoy solo hay `/health`).
3. Resolver el desvío del entry point: spec pide `src/index.ts`, hoy es `src/server.ts`.
4. Decidir `/api/health` en la app: actualizar `ENDPOINTS.health` en `src/services/api.ts` o mantener ambos.
5. Tests backend (45/45) + typecheck + commit + push.

### Fase B — Preparación Railway (requiere cuenta del usuario)
1. `npm i -g @railway/cli` (no está instalado).
2. `railway login` → requiere cuenta del usuario (o acceso del dueño del repo).
3. Crear proyecto `stepup-backend` + provisionar PostgreSQL.
4. Obtener la `DATABASE_URL` interna.

### Fase C — Deploy (agente si el CLI quedó logueado)
1. Crear `railway.json` en `backend/`.
2. Deploy: `railway up` desde `backend/` (o conectar GitHub en dashboard).
3. Env vars en Railway: `PORT`, `JWT_SECRET`, `DATABASE_URL`.
4. `npx prisma migrate deploy` contra la DB de Railway.
5. Verificar URL pública + `GET /api/health` → 200.

### Fase D — Integración (agente)
1. Crear `develop2` desde `develop`.
2. Merge en orden: express → auth-sync → offline-first → `feature/b1-finish`.
3. Push de `develop2`.

### Fase E — Cierre del issue
1. Verificación final local + Railway (`prisma migrate status`, health).
2. Setear `EXPO_PUBLIC_API_URL` con la URL pública en la app.
3. Actualizar docs (Arquitectura E2, PRD, Contexto cambiable) y marcar la checklist.
4. Cerrar issue #17 cuando esté mergeado.

### Decisiones a tomar antes de Fase A
- [x] `/api/health` convive con `/health`; la app migra a `/api/health` (tomado)
- [x] Entry point: se mantiene `src/server.ts` documentado como válido (tomado)
- [ ] Para Railway: ¿CLI (`railway up`) o deploy desde GitHub dashboard?

## Decisiones pendientes del equipo
- [ ] ¿`PUT` o `PATCH` para update (B3 usa PATCH hoy, spec dice PUT)?
- [ ] ¿Rutas anidadas `/api/tasks/:taskId/steps` o planas `/api/steps?taskId=` (spec dice anidadas)?
- [ ] ¿Railway con CLI (`railway up`) o deploy desde GitHub (dashboard)?
