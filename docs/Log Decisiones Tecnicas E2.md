**StepUp**

*Log de Decisiones Técnicas — Entrega 2*

Iteración 2 | Julio – Agosto 2026

Ingeniería en Sistemas de Información | 2026

*Versión 1.0 | Julio 2026*

# Introducción

Este documento registra las decisiones técnicas tomadas durante la Entrega 2 de StepUp. Cada entrada sigue el formato de Architectural Decision Record (ADR): contexto, decisión, razonamiento, alternativas descartadas y consecuencias.

Las decisiones DT-01 a DT-08 corresponden a E1 y están documentadas en `Log Decisiones Tecnicas E1.md`.

# Resumen de decisiones nuevas (E2)

| ID | Decisión | Fecha | Estado |
| --- | --- | --- | --- |
| DT-09 | Backend: Node.js + Express + Prisma + PostgreSQL en Railway | Julio 2026 | Confirmada |
| DT-10 | Autenticación JWT con registro/login | Julio 2026 | Confirmada |
| DT-11 | Sync offline-first híbrido: sin cuenta→local, con cuenta→backend | Julio 2026 | Confirmada |
| DT-12 | Conflictos de sync: last-write-wins | Julio 2026 | Confirmada |
| DT-13 | Diseño visual: Sistema Zenith Vitality | Julio 2026 | Confirmada |
| DT-14 | Fuentes: Manrope + Plus Jakarta Sans vía @expo-google-fonts | Julio 2026 | Confirmada |
| DT-15 | Navegación: GlassTabBar flotante con 3-4 tabs | Julio 2026 | Confirmada |
| DT-16 | Rama `develop2` transitoria para el backend | Agosto 2026 | Confirmada — unificada y eliminada (18/08) |
| DT-17 | JWT fail-closed: rechazar arranque sin secret o con placeholder | Agosto 2026 | Confirmada |
| DT-18 | Contrato de password unificado: min 8, max 72 bytes, email trim | Agosto 2026 | Confirmada |
| DT-19 | Validación ISO real de fechas (400 vs 500) | Agosto 2026 | Confirmada |
| DT-20 | Idempotencia por `Idempotency-Key` en writes | Agosto 2026 | Server confirmado · cliente pendiente (#123 IDOR, #124 key por llamada) |
| DT-21 | `completeStep` debe ser transaccional (evitar doble incremento) | Agosto 2026 | Confirmada — implementada (issue #71) |
| DT-22 | GitHub: protección de ramas y gestión de herramientas del repo | Agosto 2026 | Confirmada |
| DT-23 | Aislamiento de la DB local por usuario (`owner_user_id`) | Agosto 2026 | Confirmada |
| DT-24 | IA en E3: Google Gemini vía proxy por el backend (key solo en servidor) | Agosto 2026 | Planificada (E3) |
| DT-25 | Descripción como atributo persistente de la tarea | Agosto 2026 | Planificada (E3) |

# Decisiones detalladas

---

## DT-09 Backend: Node.js + Express + Prisma + PostgreSQL en Railway
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | StepUp necesita un backend para la Entrega 2. El equipo tiene experiencia en JavaScript/TypeScript del frontend. No hay experiencia previa en backend Node.js ni en bases de datos relacionales en producción. | |
| **Decisión** | Usar Node.js + Express + TypeScript para el servidor, Prisma como ORM, PostgreSQL como base de datos, y Railway como hosting. | |
| **Razonamiento** | Node.js/Express permite al equipo reutilizar su conocimiento de TypeScript sin aprender un lenguaje nuevo. Prisma es el ORM más productivo del ecosistema: genera tipos automáticos para TypeScript, maneja migraciones, y tiene una sintaxis de queries intuitiva. PostgreSQL es la base de datos relacional más madura, bien soportada por Prisma y Railway. Railway ofrece tier gratuito con PostgreSQL integrado, deploy automático desde GitHub, y no requiere configuración de infraestructura. | |
| **Alternativas descartadas** | Python + Django (descartado: el equipo no conoce Python, curva de aprendizaje alta). Supabase (descartado: BaaS con vendor lock-in, menos control sobre el schema). MongoDB + Mongoose (descartado: preferimos relacional por la estructura tasks-steps). Firebase (descartado: vendor lock-in, base de datos no relacional). Vercel Serverless Functions (descartado: timeout de 10s, no ideal para sync). Render en vez de Railway (descartado: comparativamente más lento en deploys gratuitos). | |
| **Consecuencias** | Positivo: el equipo puede arrancar el backend sin aprender tecnologías nuevas. Positivo: Railway simplifica el deploy a un git push. Positivo: Prisma genera tipos que se pueden compartir con el frontend. Negativo: PostgreSQL requiere schema definido upfront; cambios posteriores requieren migraciones. A monitorear: el tier gratuito de Railway tiene limitaciones de CPU y RAM que pueden afectar bajo carga. | |

---

## DT-10 Autenticación JWT con registro/login
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | E1 no tiene autenticación (offline puro). Para E2 se necesita que los usuarios tengan cuenta y puedan acceder a sus datos desde cualquier dispositivo. | |
| **Decisión** | Usar JWT (JSON Web Tokens) con bcrypt para hasheo de contraseñas. Token con expiración de 30 días. Sin refresh tokens. | |
| **Razonamiento** | JWT es el estándar más usado para APIs REST sin estado. No requiere sesiones en servidor ni base de datos de tokens. bcrypt es el algoritmo recomendado para hasheo de contraseñas, con 10 rounds de sal. 30 días de expiración es un balance entre seguridad (no expira nunca) y UX (no pedir login cada semana). Para alcance académico, no se justifica la complejidad de refresh tokens. | |
| **Alternativas descartadas** | Sesiones con cookies (descartado: requiere estado en servidor, más complejo para APIs mobile). Auth0/Firebase Auth (descartado: dependencia externa, no justificada para el alcance). Refresh tokens (descartado: complejidad adicional innecesaria para demo académica). JWT sin expiración (descartado: inseguro). | |
| **Consecuencias** | Positivo: implementación simple y directa. Positivo: sin estado en servidor (escalable). Positivo: 30 días es buena UX. Negativo: si un token se filtra, es válido por 30 días. A monitorear: no hay revocación de tokens; si es necesario, implementar blocklist en E3. | |

---

## DT-11 Sync offline-first híbrido: sin cuenta→local, con cuenta→backend
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | StepUp E1 es 100% offline con SQLite local. Para E2 se agrega backend, pero la app no puede perder su capacidad offline. El usuario puede comenzar a usar la app sin cuenta y decidir registrarse después. | |
| **Decisión** | Arquitectura híbrida offline-first: sin cuenta, la app escribe en SQLite local (modo E1). Al registrarse, los datos locales se migran al servidor y la app pasa a modo sync. SyncService orquesta push/pull. | |
| **Razonamiento** | No romper la experiencia existente: el 100% de E1 sigue funcionando sin cambios. El usuario no se encuentra con un login obligatorio al abrir la app, lo que reduce fricción. La migración al registrarse es transparente: el usuario crea su cuenta y todos sus datos ya están en el servidor. Es la arquitectura con mejor UX para el caso de uso de StepUp (el usuario instala, crea tareas, y si después quiere respaldo en la nube, se registra). | |
| **Alternativas descartadas** | Login obligatorio al abrir la app (descartado: agrega fricción innecesaria, especialmente para una app anti-procrastinación). Sincronización sin cuenta (descartado: sin identidad de usuario no hay manera de asociar datos en el servidor). Solo local sin backend en E2 (descartado: la materia pide más código y backend). | |
| **Consecuencias** | Positivo: E1 sigue funcionando sin cambios. Positivo: la experiencia offline no se degrada. Positivo: la migración es transparente para el usuario. Negativo: la lógica de sync es más compleja que un "todo online". Negativo: hay que mantener dos modos de operación (con y sin cuenta). A monitorear: probar el flujo de migración con muchos datos locales para asegurar que no es lento. | |

---

## DT-12 Conflictos de sync: last-write-wins
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | Cuando el usuario modifica datos en dos dispositivos sin conexión, al sincronizar hay dos versiones del mismo registro. Hay que decidir cuál prevalece. | |
| **Decisión** | Usar last-write-wins: el registro con el timestamp updatedAt más reciente prevalece. Si los timestamps están muy cercanos (menos de 1 minuto de diferencia), se muestra la SyncConflictScreen para resolución manual. | |
| **Razonamiento** | Last-write-wins es la estrategia más simple y predecible. Para el perfil de uso de StepUp (una persona, probablemente un solo dispositivo), es poco probable que haya conflictos reales. El umbral de 1 minuto permite detectar casos edge sin molestar al usuario en el flujo normal. La SyncConflictScreen (cuyo diseño ya existe) es un safety net. | |
| **Alternativas descartadas** | Server-wins (descartado: el usuario pierde cambios locales inesperadamente). Client-wins (descartado: el servidor no es fuente de verdad confiable). CRDTs (descartado: sobreingeniería para el alcance académico, extremadamente complejo de implementar). Resolución manual siempre (descartado: molesto si nunca hay conflictos reales). | |
| **Consecuencias** | Positivo: implementación simple. Positivo: el 99% de los casos se resuelven automáticamente. Negativo: en el 1% de casos con timestamps cercanos, el usuario debe elegir manualmente. A monitorear: si los conflictos manuales son frecuentes, ajustar el umbral o cambiar la estrategia en E3. | |

---

## DT-13 Diseño visual: Sistema Zenith Vitality
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **En curso** | |
| **Contexto** | E1 se desarrolló con estilos inline sin un sistema de diseño unificado. La interfaz es funcional pero visualmente inconsistente. Existe un sistema de diseño completo (`stitch_stepup_design_system/`) creado en paralelo. | |
| **Decisión** | Migrar toda la interfaz de StepUp al sistema de diseño Zenith Vitality: paleta de colores, tipografía, componentes, glassmorphism, y 13 pantallas rediseñadas. | |
| **Razonamiento** | El sistema de diseño ya está completo y prototipado. La migración es principalmente reemplazar estilos inline por el theme system y componentes reutilizables. La lógica de negocio no cambia. El resultado es una app visualmente consistente, moderna y alineada con la identidad de marca. | |
| **Alternativas descartadas** | Mantener el diseño actual (descartado: visualmente inconsistente, no hay identidad de marca). Diseño propio desde cero (descartado: el trabajo de diseño ya está hecho). | |
| **Consecuencias** | Positivo: identidad visual consistente. Positivo: componentes reutilizables para futuras pantallas. Positivo: theme system centralizado facilita cambios globales. Negativo: esfuerzo de migración de todas las pantallas. A monitorear: mantener el diseño system actualizado a medida que se agregan nuevas pantallas. | |

---

## DT-14 Fuentes: Manrope + Plus Jakarta Sans vía @expo-google-fonts
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **En curso** | |
| **Contexto** | E1 usa la fuente del sistema. El diseño Zenith Vitality especifica Manrope para títulos y Plus Jakarta Sans para cuerpo. | |
| **Decisión** | Cargar ambas fuentes mediante los paquetes @expo-google-fonts/manrope y @expo-google-fonts/plus-jakarta-sans, usando useFonts() con SplashScreen.preventAutoHideAsync() para evitar FOIT. | |
| **Razonamiento** | Las fuentes son parte fundamental de la identidad visual. Manrope tiene un peso extra bold (800) ideal para títulos con tracking ajustado. Plus Jakarta Sans tiene buena legibilidad en cuerpo con múltiples pesos (400, 600, 700). Expo-google-fonts permite cargarlas sin configurar archivos .ttf manualmente. | |
| **Alternativas descartadas** | Usar fuente del sistema (descartado: inconsistente con el diseño, pierde identidad de marca). Descargar y embeber .ttf manualmente (descartado: más trabajo, expo-google-fonts es más simple). Google Fonts via expo-font + asset (descartado: misma complejidad, sin ventajas). | |
| **Consecuencias** | Positivo: resultado visual exacto al diseño. Positivo: instalación simple con npm. Positivo: sin FOIT gracias al splash screen. Negativo: el splash screen se mantiene visible hasta que las fuentes cargan (puede alargar el tiempo de arranque en conexiones lentas). | |

---

## DT-15 Navegación: GlassTabBar flotante
*Julio 2026 — Sprint 1 E2*

| | | |
| --- | --- | --- |
| **Estado** | **En curso** | |
| **Contexto** | E1 usa React Navigation con BottomTabBar estándar (borde superior, fondo sólido). El diseño Zenith Vitality especifica una barra flotante glassmorph. | |
| **Decisión** | Reemplazar la BottomTabBar estándar por un componente GlassTabBar personalizado: flotante, centrado horizontalmente, despegado de los bordes, fondo rgba(255,255,255,0.7) con backdrop blur, borderRadius full. Soporta 3 tabs (Ahora, Tareas, Historial) o 4 (con Perfil). | |
| **Razonamiento** | El GlassTabBar es uno de los elementos visuales más distintivos del diseño. La implementación usando React Navigation + componente personalizado permite mantener la funcionalidad de navegación existente mientras se cambia la apariencia. La variante de 4 tabs permite agregar Perfil sin romper la navegación actual. | |
| **Alternativas descartadas** | BottomTabBar estándar de React Navigation (descartado: no soporta glassmorphism, no es flotante). Tab bar personalizado sin React Navigation (descartado: pierde integración con los navigators existentes). 3 tabs fijos sin Perfil (descartado: Perfil es necesario para configuración y logout). | |
| **Consecuencias** | Positivo: apariencia moderna y distintiva. Positivo: soporta ambas configuraciones (3 o 4 tabs). Positivo: integrado con React Navigation. Negativo: requiere implementar un navigator personalizado. A monitorear: comportamiento en dispositivos con notch o indicadores de navegación del sistema. | |

| **Consecuencias** | Positivo: apariencia moderna y distintiva. Positivo: soporta ambas configuraciones (3 o 4 tabs). Positivo: integrado con React Navigation. Negativo: requiere implementar un navigator personalizado. A monitorear: comportamiento en dispositivos con notch o indicadores de navegación del sistema. |

---

## DT-16 Rama `develop2` transitoria para el backend
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada — unificada (18/08/2026)** | |
| **Contexto** | El frontend vive en `develop` y el backend se desarrolló en paralelo. La rama `develop` del repo no tiene el backend, y unir todo en `develop` antes de tiempo mezclaba dos tracks en conflicto (App.tsx, theme, api.ts). | |
| **Decisión** | Usar `develop2` como rama base para el backend mientras esté separado. Issues de backend → ramas `feature/<tipo>/<numero>-<desc>` desde `develop2` → PR a `develop2`. Un integrante designado integra `develop2` → `develop` en cada checkpoint alcanzado y antes del cierre de E2 (18/08). Después de la integración, `develop2` se congela y se elimina: todo pasa a `develop`. | |
| **Razonamiento** | Mantener los dos tracks aislados evita conflictos constantes durante el desarrollo activo de ambos. La integración puntual en checkpoints (con squash como PR único) es más revisable y estable que una unión continua. La transitoriedad evita una estrategia de ramas permanente con dos develop. | |
| **Alternativas descartadas** | Backend en `develop` desde el inicio (descartado: conflicto constante con el track visual y ramas viejas). Rama única `dev-backend` permanente (descartado: agregaría una tercera línea de integración para siempre). | |
| **Consecuencias** | Positivo: tracks aislados y revisión estable. Positivo: red de integración conocida. Negativo: el workflow de CI que cierra issues solo aplica a `develop`, por lo que PRs mergeados a `develop2` no cierran la issue automáticamente (cerrar manual o al integrar). **Cierre (18/08):** `develop2` se integró a `develop` vía PR #121 (issue #120) y la rama fue eliminada. Todo el desarrollo de E3 vuelve a `develop`. | |

---

## DT-17 JWT fail-closed: rechazar arranque si el secret no es seguro
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | El backend arrancaba con un JWT_SECRET por defecto hackeable (`dev-secret-stepup`), y cualquiera podía firmar tokens válidos. El PR #80 resuelve la issue #65. | |
| **Decisión** | `resolveJwtSecret()` falla en producción si `JWT_SECRET` falta o está en una blacklist de placeholders conocidos (`''`, `dev-secret-stepup`, `cambiar-en-produccion`, etc.). En `test` se permite un secret de prueba. `jwt.verify` solo acepta `HS256`. | |
| **Razonamiento** | Fail-closed: el sistema no arranca con configuración insegura en vez de funcionar con un secreto público. Restringir el algoritmo evita ataques de confusión de algoritmo. | |
| **Alternativas descartadas** | Generar un secret automático (descartado: cambia en cada reinicio, invalida sesiones). Advertir en logs (descartado: no es un control, cualquiera puede ignorarlo). | |
| **Consecuencias** | Negativo: exige configurar `JWT_SECRET` en todos los entornos (Railway, local). GOTCHA pendiente: el placeholder del `.env.example` (`genera-un-secreto-largo-y-unico`) no está en la blacklist (sugerido agregarlo o exigir longitud mínima). | |

---

## DT-18 Contrato de password y email unificado
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | El front pedía password 8+ pero el backend validaba 6+, desincronización que generaba errores confusos. El PR #81 resuelve la issue #66. | |
| **Decisión** | En `schemas.ts`: password min 8 y max 72 bytes (límite de bcrypt), email con `trim().toLowerCase()`, name max 120, email max 254. Aplica a register, login y migrate. El RegisterScreen se alinea (min 8 + 72 bytes). | |
| **Razonamiento** | Un contrato único evita fricción cliente/servidor. El límite de 72 bytes respeta el truncamiento de bcrypt (evita hashes inconsistentes). El trim evita duplicados por espacios. | |
| **Alternativas descartadas** | Mantener validación por capa (descartado: origen de la desincronización). | |
| **Consecuencias** | GOTCHA: `loginSchema` no aplica el límite de 72 bytes (solo min 1), asimetría menor vs register/migrate (comentado en review del #81). | |

---

## DT-19 Validación ISO real de fechas
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | `parseableDate`/`isoDateTime` aceptaban cualquier string; fechas inválidas pasaban zod → Invalid Date en Prisma → 500, o skip silencioso en sync (pérdida de datos). El PR #78 resuelve la issue #70. | |
| **Decisión** | Validar con `Date.parse` (`isParseableIso`) en ambos schemas y rechazar con 400 (mensaje "Debe ser un timestamp ISO válido"). | |
| **Razonamiento** | Corta el 500 y el skip silencioso con un contrato claro. | |
| **Alternativas descartadas** | — | |
| **Consecuencias** | GOTCHA: `Date.parse` no es ISO 8601 estricto (acepta `"March 1 2026"`, `"2026/12/31"`); si se quiere validación estricta, usar `z.datetime()` o regex ISO (comentado en review del #78). | |

---

## DT-20 Idempotencia por `Idempotency-Key` en writes
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **En curso** | |
| **Contexto** | Reintentos de la app (timeouts, doble tap) podían duplicar creates o corromper complete. El PR #82 (issue #67) envuelve create/complete/reorder/push/migrate en `runIdempotent` (reserva con `ON CONFLICT DO NOTHING`, replay de respuesta o 409 si el payload cambió). | |
| **Decisión** | Middleware `requireIdempotencyKey` en POST/PUT/PATCH (UUID válido o 400); `runIdempotent` con TTL 24h y respuesta byte-idéntica en replay. | |
| **Razonamiento** | Patrón Stripe: idempotencia por key del cliente sin estado global complejo. | |
| **Alternativas descartadas** | — | |
| **Consecuencias** | HALLAZGO CRÍTICO en review: `/api/sync/migrate` usa un scope de idempotencia fijo y público (`MIGRATE_IDEMPOTENCY_SCOPE`), por lo que todos los usuarios comparten el mismo `user_id` en `idempotency_keys` → posible IDOR (replay de token/taskMap de otro usuario). Y `ensureMigrateScopeUser()` hace upsert de un usuario fake en `users` de producción. **Estado al cierre (18/08):** el servidor quedó idempotente y testado (18 casos); quedan registrados en E3 el fix del scope del migrate (#123, IDOR) y la persistencia de la key del lado cliente (#124 — hoy se genera una key nueva por llamada, anulando el replay desde la app). `completeStep` transaccional implementado (DT-21, issue #71). | |

---

## DT-21 `completeStep` debe ser transaccional
*Agosto 2026 — Sprint 2 E2*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | `completeStep` hace 4 writes secuenciales sin transacción (marcar completo, upsert daily_progress, next pending, completar task). Dos requests concurrentes pueden doble-incrementar `daily_progress`, o un fallo intermedio deja la base a mitad de estado. Issue #71. | |
| **Decisión** | Envolver el flujo en `prisma.$transaction` y hacer el update del step condicional (`updatedMany where status='pending'` + verificación de count) para decidir el incremento. El retry (misma key o nueva) no debe re-incrementar. | |
| **Razonamiento** | Atómico y el incremento depende de la transición real, no de la llegada de la request. | |
| **Alternativas descartadas** | — | |
| **Consecuencias** | Implementado en `step.service.ts` (issue #71): flujo envuelto en `prisma.$transaction`, update del step condicional (`updatedMany where status='pending'` + verificación de count) para decidir el incremento, sin doble conteo en requests concurrentes ni reintentos. El `runIdempotent` del #82 protege replay con misma key; no cubre keys distintas ni dos dispositivos. | |

---

## DT-22 GitHub: protección de ramas y gestión de herramientas del repo
*Agosto 2026 — Housekeeping del repo*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | Las convenciones de Git (§5/§7 de CONVENCIONES.md) dependían de disciplina manual: `main` y `develop` sin protección, sin Dependabot, sin milestones ni releases, y sin verificación de secrets. El repo es público. | |
| **Decisión** | Activar: (1) branch protection en `main` y `develop` (PR obligatorio + 1 aprobación + linear history + force-push/borrado bloqueado, admins incluidos; sin status checks hasta que CI #90 mergee); (2) Dependabot semanal (`npm` + `github-actions`); (3) vulnerability alerts, Dependabot security updates, secret scanning y push protection; (4) issue forms (`bug_report.yml`, `feature_request.yml`); (5) milestones E1-E3 y releases por entrega (tag `entrega-1` ya publicado). Rollback documentado en CONVENCIONES §7.10. | |
| **Razonamiento** | Enforcear convenciones existentes sin fricción adicional para el flujo normal, y proteger un repo público. El review ya era regla del equipo (§7.6), ahora GitHub lo exige. | |
| **Alternativas descartadas** | Seguir con convención manual (fracasa en el largo plazo); esperar a tener CI para proteger las ramas (pérdida de valor inmediato); habilitar secret scanning por API (no existe endpoint REST, solo UI). | |
| **Consecuencias** | Ningún integrante (ni admin) puede pushear directo a `main`/`develop`. Dependabot solo escanea la default branch (`main`): las deps del backend en `develop2` quedan sin cobertura hasta la unificación. Al mergear la #90, marcar los checks del CI como required. | |

---

## DT-23 Aislamiento de la DB local por usuario (`owner_user_id`)
*Agosto 2026 — Sprint 3 E2 (PR #114)*

| | | |
| --- | --- | --- |
| **Estado** | **Confirmada** | |
| **Contexto** | Con auth y sync conviviendo en un solo SQLite local, al desloguearse y loguearse otra cuenta podían quedar datos del usuario anterior en el device y hasta migrarse a la cuenta nueva (fuga de datos). Issue #114. | |
| **Decisión** | Agregar `owner_user_id` en `sync_meta`. Al hacer login se verifica el owner; si no coincide, se resetea la DB local antes de migrar/operar. Al logout se limpia el owner. | |
| **Razonamiento** | Un solo almacén local con ownership explícito evita mezclar datasets de cuentas distintas sin perder el modo offline (E1). | |
| **Alternativas descartadas** | DB por usuario (descartado: complejidad de migración y espacio); borrar todo al logout (descartado: rompía el modo offline sin cuenta). | |
| **Consecuencias** | El `migrate()` limpia datos ajenos antes de subir. El flujo "saltar y usar offline" sigue funcionando sin owner. |

---

## DT-24 IA en E3: Google Gemini vía proxy por el backend
*Agosto 2026 — Plan de la Entrega 3 (epic #152, PRD en `docs/Entrega 3 PRD.md`)*

| | | |
| --- | --- | --- |
| **Estado** | **Planificada (E3)** | |
| **Contexto** | E3 necesita una IA que sugiera pasos al crear una tarea. El equipo no tiene experiencia previa en integración de IA. Investigación: la alternativa con mejor relación costo/esfuerzo es Google Gemini API (AI Studio) con tier gratis permanente (modelo `gemini-2.5-flash`, ~10 RPM / 250K TPM en el tier gratuito). | |
| **Decisión** | La IA se consume **vía un endpoint propio del backend** (`POST /api/ai/suggest-steps` + acción de asistente de descripción), que a su vez llama a Gemini. La API key vive **solo en el servidor** (Railway env), nunca en el bundle de la app. Sin SDK: fetch directo al REST endpoint con `responseMimeType: application/json`. | |
| **Razonamiento** | No exponer el secreto en un bundle público (la app se distribuye a cualquier dispositivo). Coherente con la arquitectura existente (JWT auth, env.ts fail-closed, error-handler, tests con supertest). Permite centralizar rate limiting, retry con backoff y sanitización de la respuesta. | |
| **Alternativas descartadas** | Llamada directa desde la app a Gemini (descartado: la key queda expuesta en el bundle). Claude Haiku / GPT-4o mini (descartado: costos o cuotas del tier gratis menos favorables para esta escala). IA on-device (descartado: requiere modelos locales pesados, fuera de alcance académico). Refino conversacional de la sugerencia (descartado en E3: se usa re-generar). | |
| **Consecuencias** | La app offline no puede usar la IA (requiere red) pero nunca queda bloqueada: sin conexión, el botón de IA no aparece y el flujo manual de creación queda intacto. En el tier gratis Google entrena con los prompts (aceptable para uso académico; no enviar datos sensibles). La mejora continua del prompt queda como trabajo posterior. | |

---

## DT-25 Descripción como atributo persistente de la tarea
*Agosto 2026 — Plan de la Entrega 3 (slice #153)*

| | | |
| --- | --- | --- |
| **Estado** | **Planificada (E3)** | |
| **Contexto** | La calidad de la sugerencia de pasos con IA depende del contexto que el usuario da. Hoy una tarea solo tiene nombre y fecha. Se necesita un campo de descripción, y decidir si se persiste. | |
| **Decisión** | La tarea gana un atributo `description` (opcional, nullable) que se guarda en SQLite local, en PostgreSQL (Prisma) y viaja en el contrato de sync. Es editable desde el formulario y se muestra en el detalle. | |
| **Razonamiento** | La descripción es el "por qué" de la tarea; descartarla (efímera) impediría re-generar pasos con IA más tarde con el mismo contexto y empobrecería el dashboard futuro. El costo de schema es acotado: ya existen migraciones en SQLite y Prisma, y el sync ya resuelve cambios. | |
| **Alternativas descartadas** | Descripción efímera (solo para la llamada de IA, no persistida): más simple, pero pierde el contexto y rompe "re-generar pasos después". | |
| **Consecuencias** | El formulario de crear/editar tarea gana un campo. El detalle muestra la descripción. El sync y las migraciones (local y remota) se actualizan. El campo es opcional: crear sin descripción sigue siendo válido y rápido (HU-2). | |

*StepUp — Log Decisiones Técnicas E2 — Versión 1.3 — Agosto 2026*

*Ingeniería en Sistemas de Información*
