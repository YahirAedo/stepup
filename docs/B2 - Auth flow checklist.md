# B2 + Slice 9 — Auth flow (registro + login) backend + app (checklist de cierre)

> **ESTADO: ✅ COMPLETO (cerrado 2026-08-11)**
>
> Issues: https://github.com/YahirAedo/stepup/issues/18 (B2) · https://github.com/YahirAedo/stepup/issues/13 (Slice 9)
> Etiquetas: `backend`, `frontend`, `auth`, `ready-for-agent`, `epic`
> Rama base de código: `feature/b2-auth-flow` (commit `2b6c4c3`) — backend previo en `feature/backend-auth-sync`
> PR: https://github.com/YahirAedo/stepup/pull/55 → mergeada a `develop2` (commit `41f71a6`)
> Última actualización: 2026-08-11 (B2 + Slice 9 terminados; issues cerrados)
> Backend en producción: https://stepup-backend-api-production.up.railway.app

## Qué piden los issues (acceptance criteria)

### B2 — Auth flow backend + app (issue #18)

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Backend: `POST /api/auth/register` funciona y retorna token | ✅ HECHO |
| 2 | Backend: `POST /api/auth/login` funciona con credenciales válidas | ✅ HECHO |
| 3 | Backend: `GET /api/auth/me` retorna usuario autenticado | ✅ HECHO |
| 4 | Backend: `POST /api/auth/login` retorna 401 con credenciales inválidas | ✅ HECHO |
| 5 | Backend: `GET /api/auth/me` retorna 401 sin token | ✅ HECHO |
| 6 | App: ApiClient adjunta token a requests autenticadas | ✅ HECHO (`apiFetch` agrega `Authorization: Bearer <token>`) |
| 7 | App: `AuthService.login()` guarda token en storage | ✅ HECHO (`saveSession` persiste token + user) |
| 8 | App: LoginScreen llama a AuthService y redirige a MainTabs | ✅ HECHO |
| 9 | App: RegisterScreen crea cuenta y redirige a MainTabs | ✅ HECHO (vía `SyncService.migrate` — ver desvíos) |
| 10 | App: Navigation guard redirige a LoginScreen si no hay sesión | ✅ HECHO (routing inicial en `App.tsx`) |

### Slice 9 — Pantallas Login + Register (issue #13)

| # | Criterio | Estado |
|---|----------|--------|
| 1 | LoginScreen con campos email y contraseña | ✅ HECHO |
| 2 | Toggle visibility en campo contraseña | ✅ HECHO |
| 3 | Enlace "¿Olvidaste tu contraseña?" | ✅ HECHO |
| 4 | Botón "Iniciar Sesión" funcional | ✅ HECHO (llama `AuthService.login`) |
| 5 | RegisterScreen con campos nombre, email, contraseña | ✅ HECHO |
| 6 | Enlace de navegación entre Login y Register | ✅ HECHO |
| 7 | Diseño consistente con theme Zenith Vitality | ✅ HECHO (tokens de `src/theme/`) |
| 8 | Estados de carga durante submit | ✅ HECHO (spinner + botón deshabilitado mientras carga) |

## Lo que ya está hecho (verificado)

### Backend (rama `feature/backend-auth-sync`, mergeada en `develop2`)
- [x] `POST /api/auth/register` — recibe `{ name, email, password }`, hashea con bcrypt(10), crea User, retorna `{ user, token }`
- [x] `POST /api/auth/login` — verifica bcrypt, retorna `{ user, token }`; 401 con credenciales inválidas
- [x] `GET /api/auth/me` — requiere `Authorization: Bearer <token>`, retorna user data; 401 sin token
- [x] Middleware `auth.ts` que valida JWT y lo adjunta a `req.user`
- [x] JWT con expiry de 30 días (`JWT_SECRET` en env; configurado en Railway)
- [x] Tests backend 45/45 (jest, requieren PostgreSQL local vía Docker)

### App — cliente HTTP y sesión
- [x] `src/services/api.ts` — `apiFetch` adjunta `Authorization: Bearer <token>` desde la sesión en cada request; ante `401` hace `clearSession()`; lanza `ApiError(status, message)`
- [x] `src/services/AuthService.ts` — `register()`, `login()`, `logout()`, `isLoggedIn()`, `getUser()`; login/register guardan sesión vía `saveSession`
- [x] `src/services/session.ts` — `saveSession` / `loadSession` / `clearSession` / `hasSession` / `getSessionUser` (persistencia local)
- [x] `src/services/SyncService.ts` — `migrate(name, email, password)` registra la cuenta en el backend y migra los datos locales (SQLite → remoto)

### App — pantallas y navegación (rama `feature/b2-auth-flow`)
- [x] `src/screens/LoginScreen.tsx` — "Bienvenido de vuelta" + "Ingresa tus datos para continuar"; email con icono mail y label "Correo electrónico"; contraseña con icono lock + visibility toggle + placeholder "********"; link "¿Olvidaste tu contraseña?" (label-sm, primary); botón "Iniciar Sesión" (w-full, bg-primary, rounded-full); link "¿No tienes una cuenta? Crear una cuenta"; manejo de `ApiError` (401 → "Correo o contraseña incorrectos", status 0 → "No se pudo conectar con el servidor"); "Saltar y usar offline"
- [x] `src/screens/RegisterScreen.tsx` — icono `directions_walk` en círculo + "StepUp" (display) + "Comienza tu camino"; card (rounded 32, surface-container-lowest) con Nombre (icono person), Email (icono mail), Contraseña (icono lock + visibility toggle, placeholder y hint "Mínimo 8 caracteres"); botón "Crear Cuenta" (w-full, bg-primary-container, rounded-full); link "¿Ya tienes una cuenta? Inicia sesión"
- [x] `src/components/TextField.tsx` — extendido con props `leftIcon` y `rightElement` (toggle visibility)
- [x] `src/types/navigation.ts` — `RootStackParamList` tipado (Onboarding1, Onboarding2, NotificationPermission, Login, Register, MainTabs)
- [x] `App.tsx` — `RootStack` con `RootStackParamList`; guard de navegación por `initialRouteName`: sin onboarding → `Onboarding1`; con sesión → `MainTabs`; sin sesión → `Login`
- [x] `src/screens/ProfileScreen.tsx` — "Cerrar sesión" wired a `AuthService.logout()` + reset de navegación a `Login`
- [x] `@expo/vector-icons` agregado a dependencias (iconos MaterialIcons)

## Checklist de cierre

### 1. Backend auth
- [x] Endpoints `register` / `login` / `me` bajo prefijo `/api/auth/` (en `backend/src/routes/auth.routes.ts` + `controllers/auth.controller.ts`)
- [x] bcrypt(10), JWT 30 días, middleware `auth.ts` protegiendo `me`
- [x] Casos de error: login inválido → 401; `me` sin token → 401
- [x] Env: `JWT_SECRET` en Railway; expuesto en `backend/.env.example`

### 2. App — cliente + sesión
- [x] `apiFetch` adjunta token (solo si hay token) en `src/services/api.ts:77`
- [x] `401` global → `clearSession()` en `src/services/api.ts:92`
- [x] `AuthService.login` persiste `{ user, token }` y `RegisterScreen` persiste vía `SyncService.migrate`

### 3. Pantallas (spec del issue #13)
- [x] LoginScreen completa (header, 2 campos, toggle, links, botón, estados de carga, manejo de errores)
- [x] RegisterScreen completa (header, card con 3 campos, toggle, hint de 8 caracteres, botón, link de navegación)
- [x] Navegación Login ↔ Register vía `navigation.navigate`
- [x] Guard inicial: `initialRouteName` según onboarding + sesión

### 4. Desvíos detectados (decisión del equipo)
- [x] **RegisterScreen usa `SyncService.migrate()` en lugar de `AuthService.register()`.** El criterio #9 se cumple en efecto (crea la cuenta, guarda sesión, migra datos locales y redirige a MainTabs), pero el issue pedía literalmente llamar a `AuthService.register()`. Decisión: se mantiene `migrate()` porque es el flujo offline-first correcto (registro + migración de datos locales en un solo paso). Si el equipo prefiere el cumplimiento literal, cambiar a `AuthService.register()`.
- [x] **"Saltar y usar offline" es una adición no pedida en la spec.** Permite entrar a MainTabs sin sesión (modo E1 offline). Coherente con DT-11 (sin cuenta → SQLite local).
- [x] **El guard es routing inicial, no middleware por pantalla.** Se evalúa una vez al arrancar en `App.tsx` (onboarding > sesión > login). Cumple "si no hay sesión mostrar LoginScreen" al arrancar.

### 5. Verificación (comandos)
```bash
cd .. && npx tsc --noEmit                 # typecheck OK
npx vitest run --reporter=dot             # app: 75/75 passing
npx eslint src App.tsx --quiet            # 0 errores (54 warnings pre-existentes, ninguno en archivos nuevos)
```

### 6. Integración y cierre
- [x] PR #55 (`feature/b2-auth-flow` → `develop2`) mergeada el 2026-08-11 (commit `41f71a6`); rama remota borrada por el merge
- [x] Issues #18 y #13 cerrados con comentario de cierre
- [x] Rama local `feature/b2-auth-flow` ya no sirve (todo está en `develop2`)

## Próximos pendientes relacionados (no bloquean B2/Slice 9)
- B3: conectar la app al backend cuando hay sesión activa (endpoints de tareas/pasos) + decisión PATCH vs PUT y rutas planas vs anidadas (ver `docs/B1 - Railway deploy checklist.md`)
- B4: Sync pull/push completo con last-write-wins en la app (base ya mergeada en `feature/offline-first-sync`)
- Verificar flujo completo en dispositivo físico Android (registro → login → sync)
