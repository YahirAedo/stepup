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
| DT-13 | Diseño visual: Sistema Zenith Vitality | Julio 2026 | En curso |
| DT-14 | Fuentes: Manrope + Plus Jakarta Sans vía @expo-google-fonts | Julio 2026 | En curso |
| DT-15 | Navegación: GlassTabBar flotante con 3-4 tabs | Julio 2026 | En curso |

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

*StepUp — Log Decisiones Técnicas E2 — Versión 1.0 — Julio 2026*

*Ingeniería en Sistemas de Información*
