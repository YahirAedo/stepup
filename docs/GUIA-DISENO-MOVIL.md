# StepUp — Guía de diseño y desarrollo móvil

> Fuente de verdad de la UI móvil de StepUp. Nace del grilling de decisiones
> (#233) y aplica a **toda pantalla, componente y token** de la app.
>
> **No es opcional.** Si una PR rompe estas reglas, se rechaza hasta corregirlas.
>
> Estado de validación: sujeto a revisión por las skills de diseño móvil
> instaladas (ver [§9](#9-referencias)). El diseño y esta guía **están sujetos a
> cambios** (ver §Cláusula de evolución): lo que no cuadra se documenta y se
> actualizan las documentaciones.

---

## 1. Tokens

**Los tokens de `src/theme/` SON la ley.** Ningún valor visual (color, fuente,
espaciado, radio, sombra, tamaño) se inventa fuera de ellos. Si un token no
existe, se **agrega al theme**, no se hardcodea.

`stitch_stepup_design_system/zenith_vitality/DESIGN.md` queda como referencia de
intención (local, gitignored — **no se sube nada que esté en .gitignore**). Lo
que haga falta de ese diseño se documenta en esta guía.

Import en componentes y screens:

```tsx
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { scale, moderateScale, useResponsive } from '../theme';
import { useBottomLayout } from '../theme/layout';
```

### 1.1 Colores — `src/theme/colors.ts`

47 tokens actuales (paleta Material tonal basada en la semilla `#446733`).

| Grupo | Tokens | Uso |
|-------|--------|-----|
| Superficies | `surface`, `surface-dim`, `surface-bright`, `surface-container-*` (lowest/low/default/high/highest), `background`, `surface-variant` | Fondos de pantalla, cards y contenedores |
| Texto sobre superficie | `on-surface`, `on-surface-variant`, `on-background`, `surface-tint` | Títulos, cuerpo, hints |
| Inversos | `inverse-surface`, `inverse-on-surface` | Badges/estados invertidos |
| Outline | `outline`, `outline-variant` | Bordes, separadores, dashed |
| Semánticos | `primary`, `on-primary`, `primary-container`, `on-primary-container`, `inverse-primary` | Jerarquía principal, botones, tabs activas |
| | `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container` | Detalles, etiquetas, progreso |
| | `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container` | Acciones secundarias, timer |
| | `error`, `on-error`, `error-container`, `on-error-container` | Estados de error |
| Fixed | `*-fixed` y `*-fixed-dim` (+ `on-*-fixed`), `secondary`/`tertiary`/`error` idem | Fondos de badges e insignias |

Uso canónico: `colors.surface` fondo de pantalla, `colors['surface-container-low']`
cards, `colors['primary-container']` botones primarios, `colors['on-surface']`
texto principal, `colors['on-surface-variant']` texto secundario.

### 1.2 Tipografía — `src/theme/typography.ts`

| Token | Font | Size | Weight | Uso |
|-------|------|------|--------|-----|
| `display` | Manrope 800 | 48 | 800 | Títulos grandes (una línea) |
| `headline-lg` | Manrope 800 | 32 | 800 | Títulos de sección (tablet) |
| `headline-lg-mobile` | Manrope 800 | 28 | 800 | Títulos de pantalla (mobile) |
| `headline-md` | Manrope 700 | 24 | 700 | Subtítulos, cards |
| `body-lg` | Plus Jakarta 400 | 18 | 400 | Cuerpo destacado |
| `body-md` | Plus Jakarta 400 | 16 | 400 | Cuerpo de texto |
| `label-md` | Plus Jakarta 600 | 14 | 600 | Botones, etiquetas |
| `label-sm` | Plus Jakarta 700 | 12 | 700 | Metadatos, badges, uppercase |

Reglas:
- Los estilos se usan **tipados**: `typography['headline-md'] as TextStyle`.
  **Nunca `as any`** — si el tipo falla, se arregla el tipo (CONVENCIONES 1.2).
- **Nunca `fontSize`/`fontFamily`/`fontWeight` inline.** Si falta un estilo, se
  agrega al theme.
- `letterSpacing` **viene solo del token** (p. ej. `label-sm` usa 0.8) y no se
  sobrescribe inline. Nunca un `letterSpacing` arbitrario en la screen.

### 1.3 Espaciado — `src/theme/spacing.ts`

| Token | Valor | Uso |
|-------|-------|-----|
| `unit` | 4 | Baseline de espaciado |
| `container-padding` | 24 | Padding horizontal de pantallas |
| `stack-gap` | 16 | Gap entre elementos apilados |
| `section-gap` | 40 | Gap entre secciones grandes |
| `gutter` | 16 | Gutter de grillas |

Ningún gap/padding se inventa; se compone con estos valores.

### 1.4 Border radius — `src/theme/borderRadius.ts`

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 4 | Detalles pequeños |
| `DEFAULT` | 8 | Esquinas base |
| `md` | 12 | Input fields |
| `lg` | 16 | Cards secundarias |
| `xl` | 24 | Cards principales |
| `full` | 9999 | Pills, badges, FAB |

### 1.5 Sombras — `src/theme/shadows.ts`

| Token | Uso |
|-------|-----|
| `ambient` | Cards flotantes, fondo difuso |
| `card` | Cards elevadas |
| `elevated` | Elementos sobre-elevados |
| `fab` | FAB |

Sombras difusas y livianas (opacidad 0.04–0.12). **Nada de sombras pesadas.**

### 1.6 Responsive — `src/theme/responsive.ts`

- **Baseline:** `BASE_WIDTH = 375` (iPhone 11). Todas las medidas se diseñan para ese ancho.
- **Web:** el ancho efectivo de layout se limita a `MAX_WEB_LAYOUT_WIDTH = 600`
  para que `scale()` no explote en desktop. En native (Expo Go) se usa el ancho real.
- `scale(n)` — escala lineal. **Solo para tamaños visuales absolutos** (rings del timer,
  ilustraciones, checkmarks, círculos decorativos, iconos grandes).
- `moderateScale(n, factor = 0.5)` — escala moderada para border radius e iconos chicos.
- `useResponsive()` → `{ scale, isSmall, isMedium, isTablet }`. Se prefiere sobre
  `scale()` directo cuando el componente rota o cambia de tamaño.

| Sí se escala | NO se escala |
|---|---|
| Rings del TimerWidget (256/320/224) | `spacing.*` |
| Ilustraciones de EmptyState (200/160/120) | `typography.*` |
| Checkmark de StepComplete (120) | Layout flex (`flex: 1`, `width: '100%'`) |
| Iconos de TaskList (40/48/56) | Porcentajes y valores relativos |

Regla de oro: si el valor ya viene de `spacing`, `typography`, o es un
porcentaje/`flex`, **no** se escala. (CONVENCIONES §1.5)

---

## 2. Tipografía y casing

Decisión del grilling (Q4, ver #216–#219).

| Elemento | Regla |
|----------|-------|
| `label-sm` | **UPPERCASE global** (metadatos, badges, tabs, labels de campo). El uppercase es la norma del token; no se mezcla casing dentro de la misma screen. |
| `label-md` | Minúscula/sentencia normal. No se fuerza uppercase. |
| `letterSpacing` | **Solo el del token** (0.8 en `label-sm`). Nunca `letterSpacing` inline distinto. |
| Botones | **Texto en oración** (primera letra mayúscula). No ALL CAPS en botones. |
| Títulos | Caso del contenido (no se fuerza). |

Ejemplos:

```tsx
// ✅ label-sm SIEMPRE uppercase (el token ya tiene letterSpacing + weight)
<Text style={typography['label-sm'] as TextStyle}>TIEMPO RESTANTE</Text>

// ✅ Botón en oración
<Button title="Comenzar tarea" />

// ❌ uppercase inconsistente en la misma screen
// ❌ letterSpacing inventado: <Text style={{ letterSpacing: 3 }}>
```

**Cláusula de validación (Q3):** las reglas de casing y de texto están sujetas a
validación por las skills de diseño móvil instaladas (`vercel-react-native-skills`,
`react-native-best-practices`) y la skill `mobile-design`. Si una skill contradice
una regla de esta sección, se documenta el conflicto y se actualiza la guía — el
cambio requiere revisión y no se resuelve en silencio en una PR.

---

## 3. Colores tokens-only

Decisión del grilling (Q5, ver #226).

- **Prohibido dejar values hex o `rgba()` fuera de `src/theme/colors.ts`.** Todo
  color en componentes, screens y componentes de la navegación sale de `colors.*`.

### 3.1 Glass tokens recurrentes → tokens nuevos

Los rgbas de los efectos glass que se repiten pasan a ser **tokens de theme**:

| Uso actual | Decisión |
|-----------|----------|
| `rgba(255,255,255,0.7)` en GlassTabBar | Token nuevo `glass-border` / `glass-pill` (0.7) |
| `rgba(255,255,255,0.4)` en Card | Token nuevo `glass-overlay` (0.4) |
| `rgba(255,255,255,0.5)` detectados | Token más cercano (0.4/0.7) o nuevo token |

Derivar una issue que agregue los tokens y reemplace los usos.

### 3.2 Colores inventados → token más cercano

| Inventado | Token canónico |
|-----------|----------------|
| `#FFE8D6` (urgent) | `secondary-container` / familia `secondary` |
| `#DDF0D4` (completed) | `primary-fixed` / `on-primary-fixed-variant` |
| `rgba(255,255,255,0.5)` | `glass-overlay` (0.4) o nuevo token |

Si el token más cercano no comunica la intención, se **agrega el token** al theme
con un nombre semántico, no el hex suelto en el componente.

**Única excepción** (CONVENCIONES 1.1): colores dinámicos que no existen en el
theme ni deben existir (p. ej. color de serie por categoría en gráficos). Se
justifica con un comentario en el código.

---

## 4. Responsive

Decisión del grilling (Q6). La ley responsive **no es fija**: el baseline 375 y
los breakpoints se mantienen porque los validan las skills de diseño móvil
instaladas cuando hay evidencia de un problema.

- **Breakpoints:** `isSmall` (ancho < 360), `isMedium` (360–599), `isTablet` (≥ 600).
- **Cap web:** efectivo en 600 (`MAX_WEB_LAYOUT_WIDTH`).
- **`scale()` solo para tamaños visuales absolutos** (ver §1.6). **Nunca** spacing
  del theme ni tipografía.
- **Responsive de layout por contenedor:** en pantallas + layout complejo se
  adapta por breakpoint (columnas/grid), no estirando escalas.

```tsx
// ✅ Adaptar layout por breakpoint
const { isTablet } = useResponsive();
<View style={{ flexDirection: isTablet ? 'row' : 'column', gap: spacing['stack-gap'] }} />
```

Ver métodos existentes en CONVENCIONES §1.5 y la tabla de §1.6 de esta guía.

---

## 5. Chrome nativo — Android-first

Decisión del grilling (Q7).

- **La plataforma de validación de referencia es Android en Expo Go.** Lo que se
  valida (contraste, tamaños táctiles, safe areas, gestos) se mira primero en
  Android; iOS se verifica después sin contradecir lo ya decidido para Android.
- **Status bar centralizada:** los colores/estilos de la status bar se gestionan
  en un único punto (tema + `StatusBar` de la navegación), no screen por screen.

### 5.1 Safe areas — nunca `paddingTop` fijo

El espacio superior de toda pantalla se compone con **insets + token**:

```tsx
// ✅ CORRECTO — safe area + token
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top + spacing['container-padding'] }} />

// ❌ INCORRECTO — paddingTop fijo ignora notch/status bar del dispositivo
<View style={{ paddingTop: 16 }} />
```

- **Prohibido `paddingTop`/`paddingBottom` fijos** para acomodar notches, status
  bar o bars inferiores flotantes.
- **Barra inferior flotante + FAB:** usar `useBottomLayout()` de
  `src/theme/layout.ts`, que ya combina insets, `TAB_BAR_*`, `FAB_*` y sus
  `contentPaddingBottom*`. Nunca recalcular esos offsets en la screen.

### 5.2 Gestos y navegación nativos

- **Gestos nativos preservados:** nunca `gestureEnabled: false` en la
  navegación. El swipe-back del hardware/gesto Android y el back de iOS se
  mantienen activos en todas las pantallas del stack.
- **Botones back consistentes:** el botón back del header funciona igual que el
  gesto/tecla del sistema; su zona táctil es **≥ 44×44dp**.
- **Botones y controles táctiles:** target mínimo **48×48dp** (Android
  Material), 44pt iOS. Acciones críticas y primarias: **56–64dp**.

```tsx
// ✅ Zona táctil mínima de un item
<Pressable style={{ minWidth: 48, minHeight: 48, ... }} onPress={...} />
```

---

## 6. RN / Expo best practices (SDK 54)

Decisión del grilling (Q2, Q3): ciclo de performance de `react-native-best-practices`
y prioridades de `vercel-react-native-skills`.

Orden de trabajo ante cualquier perfil/UI lenta:

1. **Measure** — medir con profiler de React DevTools / Flipper / Dev Menu antes
   de tocar nada.
2. **Optimize** — aplicar el fix específico con evidencia.
3. **Re-measure** — confirmar la mejora contra la misma medición.
4. **Validate** — revisar en Android (referencia) y iOS.

Reglas de peso:

- **FlashList > ScrollView** para listas largas o dinámicas. Una `ScrollView` con
  `items.map()` es el anti-pattern #1 en RN. Cuando una lista puede superar ~20
  items, usar `FlashList`.
- **Sin `useMemo`/`useCallback` sin evidencia de profiling.** No se envuelve
  todo "por las dudas": solo donde una medición muestre re-renders innecesarios
  en hot path. (Regla 6 de `vercel-react-native-skills`.)
- **Animaciones:** Reanimated y worklets en el UI thread; nunca animar layout en
  cada frame desde JS.
- **SDK 54:** no subir de SDK sin issue propia; leer las docs exactas de
  https://docs.expo.dev/versions/v54.0.0/ antes de escribir código.
- **Adopción específica de `stitch::react-native`** (sin StyleSheet.create, que
  queda prohibido por CONVENCIONES 1.3):
  - Props tipados por componente (`[Name]Props` exportados).
  - Semántica de accesibilidad `role`/`label`/`state` en componentes.
  - SafeAreaView vía `react-native-safe-area-context` (ver §5.1) en vez de
    `SafeAreaView` de react-native.
  - Datos desacoplados de la presentación (mapear datos → props en la screen).
  - Cero hex fuera del theme (§3).

---

## 7. Catálogo de componentes

Los **14 componentes** de `src/components/`:

| Componente | Uso |
|------------|-----|
| `Button.tsx` | Acciones. Variants `primary` / `secondary` / `tertiary` |
| `Card.tsx` | Contenedor elevado de contenido |
| `Badge.tsx` | Badges pill con `label-sm` (variants urgent/pending/completed/default) |
| `TextField.tsx` | Input con label, hint y focus |
| `ProgressBar.tsx` | Barra de progreso lineal |
| `ProgressRing.tsx` | Anillo SVG de progreso |
| `ProgressDots.tsx` | Indicador de pasos (dots) |
| `StepItem.tsx` | Item de paso con checkbox, nombre y duración |
| `EmptyState.tsx` | Estado vacío con icono, headline y CTA |
| `TimerWidget.tsx` | Timer circular con efecto breathing |
| `GlassTabBar.tsx` | Barra inferior flotante glass |
| `FloatingActionButton.tsx` | FAB flotante |
| `LineChart.tsx` | Gráfico de líneas single-pixel con gradient |
| `ConfettiOverlay.tsx` | Confeti animado (pointerEvents="none") |

### Cuándo se crea un componente nuevo

- Se repite en **2+ pantallas** (CONVENCIONES 1.4).
- Aísla lógica compleja de presentación (estado + animación + accesibilidad
  reutilizables).

### Estándar de un componente

1. **Props tipadas y exportadas.** `interface XProps` (o `type`) exportada en el
   archivo. Nunca `props: any`.
2. **Accesibilidad:** `role` y `label`/`state` en componentes interactivos
   (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`) y en lo
   visual con semántica (p. ej. `ProgressBar` con `accessibilityRole="progressbar"`).
3. **Contraste AA mínimo, AAA preferido** para texto sobre su fondo.
4. **Target táctil ≥ 48dp** para todo control (observar §5.2).
5. **Solo tokens** (colores/fuentes/spacing) y valores de layout de esta guía.
6. **Sin `StyleSheet.create`** — inline styles con tokens.

---

## 8. Anti-patterns + enforcement

### Anti-patterns (no se hace)

- ❌ Colores hardcodeados (hex/rgba) fuera de `src/theme/colors.ts`.
- ❌ `fontSize`/`fontFamily`/`fontWeight`/`letterSpacing` inline.
- ❌ `as any` en tipografía (arreglar el tipo).
- ❌ `StyleSheet.create`.
- ❌ `paddingTop` fijo (safe areas: insets + token).
- ❌ `gestureEnabled: false`.
- ❌ `ScrollView` + `map()` para listas largas (→ FlashList).
- ❌ `useMemo`/`useCallback` sin evidencia de profiling.
- ❌ Blancos arbitrarios (usar `colors.surface`).
- ❌ Sombras pesadas (usar `shadows.*`).
- ❌ Escalar `spacing.*`/`typography.*` con `scale()`.

### Sweeps de rutina

```bash
# Colores hardcodeados
rg -n 'backgroundColor: "#|color: "#' src/

# letterSpacing / fontSize / fontFamily inline
rg -n 'letterSpacing|fontSize|fontFamily|fontWeight' src/screens/ src/components/

# as any en tipografía
rg -n 'as any' src/

# StyleSheet.create prohibido
rg -n 'StyleSheet' src/

# paddingTop fijo (debe ser insets + token)
rg -n 'paddingTop: [0-9]' src/

# gestos nativos desactivados
rg -n 'gestureEnabled: false' src/
```

### Integración con el pipeline

- **Checklist pre-merge** (AGENTS/CONVENCIONES): incluir estas reglas; ver
  `.claude/skills/zenith-vitality-ds/SKILL.md` → `### Checklist pre-merge para UI`.
- **`npm run check:ds`** (script a crear en la issue de enforcement, ver §9)
  incorporará los sweeps de arriba como pasos de CI. **Aún no existe** — mientras
  tanto, los sweeps `rg` son el guard de review.
- **ESLint:** derivar reglas `no-restricted-syntax` (StyleSheet.create,
  letterSpacing/fontSize inline, `as any`) en la issue de enforcement; ver §9.
  Mientras tanto, los sweeps `rg` son el guard de review.

---

## 9. Referencias

Skills instaladas y citadas por esta guía:

| Skill | Origen | URL |
|-------|--------|-----|
| `vercel-react-native-skills` | Vercel (agent-skills) | https://github.com/vercel-labs/agent-skills |
| `react-native-best-practices` | Callstack | https://www.callstack.com/blog/ultimate-guide-to-react-native-optimization |
| `mobile-design` | davila7 (claude-code-templates) | https://github.com/davila7/claude-code-templates |
| `zenith-vitality-ds` | Repo StepUp | `.claude/skills/zenith-vitality-ds/SKILL.md` |

Se adopta de **stitch::react-native** lo listado en §6 (props tipadas, a11y
role/label/state, safe-area-context, decoupling datos/presentación, cero hex) —
**sin StyleSheet.create**.

Enforcement que esta guía genera (a derivar como issues, no duplicar las ya
existentes):

- Tokens glass nuevos (`rgba` 0.7 / 0.4 → `src/theme/colors.ts`) y reemplazo de
  usos (**#226** y derivadas).
- Colores inventados → token más cercano (Badge, confetti).
- Reglas ESLint `no-restricted-syntax` + extensión de `check:ds` con los sweeps
  de §8.
- Fixes de safe areas (`paddingTop` fijo en TaskList/TaskDetail, StepForm sin
  insets) y de casing (#216–#219).

---

## Nota de gobernanza

- Los tokens y reglas de esta guía se **validan en Android en Expo Go** (cláusula
  Q7). Cualquier cambio propuesto a un token requiere evidenciarlo en Android.
- Los fixes que esta guía habilita se despachan como issues propias con sus
  ramas; **no** se mezclan en esta PR.
- Esta guía es el **4º documento obligatorio** del onboarding (AGENTS.md:
  Contexto → CONVENCIONES → DS SKILL → esta guía).

### Cláusula de evolución del diseño

**El diseño está sujeto a cambios: nada es intocable, tampoco esta guía.** Si al
implementar, validar o testear algo **no cuadra** — un token que no comunica la
intención del diseño, una regla que contradice una skill instalada, o un hallazgo
real de UX, accesibilidad o performance — el proceso es:

1. **Documentar el hallazgo** (dónde y por qué no cuadra, con evidencia).
2. **Actualizar la documentación afectada** — esta guía, `docs/CONVENCIONES.md`,
   `.claude/skills/zenith-vitality-ds/SKILL.md`, `DESIGN.md` (local, gitignored)
   o los propios tokens del theme — **dentro de la misma rama del cambio**
   (CONVENCIONES §7.9: los docs se actualizan con el PR, no como post-proceso).
3. **Actualizar el log de decisiones** con la entrada ADR correspondiente
   (ver DT-29 en `docs/Log Decisiones Tecnicas E2.md`).
4. Despachar el cambio como issue/PR propio con revisión (nadie mergea su propio
   PR).

**Queda prohibido** resolver el desajuste solo en código y dejar la documentación
desactualizada, o congelar la norma "porque ya está escrita". La regla se actualiza
con el cambio.