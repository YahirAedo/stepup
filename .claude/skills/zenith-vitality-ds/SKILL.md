# Zenith Vitality — Design System SKILL

> Cargar este skill antes de escribir o modificar cualquier componente UI/pantalla.
> Todos los valores deben leerse desde los archivos del theme, no hardcodearse.

---

## Tokens

Los tokens están en `src/theme/` y se importan así:

```typescript
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
```

### Colors (`src/theme/colors.ts`)

| Token | Uso |
|-------|-----|
| `colors.surface` | Fondo principal de pantallas |
| `colors['surface-container-low']` | Fondo de cards y contenedores elevados |
| `colors['surface-container']` | Fondo de elementos interactivos |
| `colors.primary` | Texto principal, elementos de alta jerarquía |
| `colors['primary-container']` | Botones primarios, tabs activas |
| `colors['on-primary-container']` | Texto sobre primary-container |
| `colors.secondary` | Detalles, etiquetas, barras de progreso |
| `colors['secondary-container']` | Fondos secundarios |
| `colors.tertiary` | Botones de acción secundaria, timer |
| `colors['tertiary-container']` | Fondos de elementos terciarios |
| `colors['on-surface']` | Texto principal |
| `colors['on-surface-variant']` | Texto secundario, hints |
| `colors.outline` | Bordes, separadores |
| `colors['outline-variant']` | Bordes suaves, dashed |
| `colors.error` | Estados de error |
| `colors['primary-fixed']` | Fondos de insignias y badges |

### Typography (`src/theme/typography.ts`)

| Token | Font | Size | Weight | Uso |
|-------|------|------|--------|-----|
| `typography.display` | Manrope 800 | 48px | 800 | Títulos grandes (una línea) |
| `typography['headline-lg']` | Manrope 800 | 32px | 800 | Títulos de sección (tablet) |
| `typography['headline-lg-mobile']` | Manrope 800 | 28px | 800 | Títulos de pantalla (mobile) |
| `typography['headline-md']` | Manrope 700 | 24px | 700 | Subtítulos, cards |
| `typography['body-lg']` | Plus Jakarta 400 | 18px | 400 | Cuerpo destacado |
| `typography['body-md']` | Plus Jakarta 400 | 16px | 400 | Cuerpo de texto |
| `typography['label-md']` | Plus Jakarta 600 | 14px | 600 | Botones, etiquetas |
| `typography['label-sm']` | Plus Jakarta 700 | 12px | 700 | Metadatos, badges, uppercase |

### Spacing (`src/theme/spacing.ts`)

| Token | Value | Uso |
|-------|-------|-----|
| `spacing.unit` | 4px | Baseline |
| `spacing['container-padding']` | 24px | Padding horizontal de pantallas |
| `spacing['stack-gap']` | 16px | Gap entre elementos apilados |
| `spacing['section-gap']` | 40px | Gap entre secciones grandes |

### Border Radius (`src/theme/borderRadius.ts`)

| Token | Value | Uso |
|-------|-------|-----|
| `borderRadius.full` | 9999px | Botones pill, badges |
| `borderRadius.xl` | 24px | Cards principales |
| `borderRadius.lg` | 16px | Cards secundarias |
| `borderRadius.md` | 12px | Input fields |

### Shadows (`src/theme/shadows.ts`)

| Token | Uso |
|-------|-----|
| `shadows.ambient` | Cards flotantes, fondo difuso |
| `shadows.card` | Cards elevadas (checkmark, destacados) |
| `shadows.fab` | Botón flotante (FAB) |

---

## Componentes del catálogo

### Button (`src/components/Button.tsx`)
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
```
- **primary**: `colors['primary-container']` bg, pill shape (borderRadius.full), 56px height
- **secondary**: transparent bg, 1px `colors['outline-variant']` border
- **tertiary**: `colors['tertiary-container']` bg
- Disabled: opacity 0.5

### Card (`src/components/Card.tsx`)
```typescript
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
```
- bg: `colors['surface-container-low']`
- radius: `borderRadius.xl` (24px)
- border: `rgba(255,255,255,0.4)` 1px
- shadow: `shadows.ambient`
- padding: 24px

### Badge (`src/components/Badge.tsx`)
```typescript
type BadgeVariant = 'urgent' | 'pending' | 'completed' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}
```
- Pill shape, `typography['label-sm']`
- **urgent**: bg `#FFE8D6`, text `#9D430A`
- **pending**: bg `#D6E4FF`, text `#002F64`
- **completed**: bg `#DDF0D4`, text `#2D4F1E`
- **default**: bg `#EEEEE7`, text `#43493E`

### TextField (`src/components/TextField.tsx`)
```typescript
interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}
```
- Label: `typography['label-sm']`, `colors.secondary`, uppercase
- Input: 24px, Manrope 800, border-bottom 2px
- Hint: `typography['label-md']`, `colors['on-surface-variant']`

### ProgressBar (`src/components/ProgressBar.tsx`)
```typescript
interface ProgressBarProps {
  progress: number; // 0..1
  height?: number;  // default 3
  color?: string;   // default '#9D430A'
  trackColor?: string; // default '#E3E3DC'
}
```

### ProgressRing (SVG circular)
- Para badges/perfil: arco SVG de progreso
- Thin stroke (2-4pt), sin relleno central
- Usar `react-native-svg`

### EmptyState (`src/components/EmptyState.tsx`)
```typescript
interface EmptyStateProps {
  headline: string;
  subtext: string;
  cta?: string;
  onCtaPress?: () => void;
}
```
- Icono circular con emoji, sombra
- Headline: `typography['headline-lg-mobile']`, `colors.primary`
- Subtext: `typography['body-md']`, `colors['on-surface-variant']`
- CTA: Button variant tertiary

### GlassTabBar (`src/components/GlassTabBar.tsx`)
- Barra inferior flotante, centrada, separada ~16px de bordes
- Fondo: `rgba(255,255,255,0.7)` con `shadows.ambient`
- Tab activa: `colors['primary-container']` bg
- Tab inactiva: transparente, icono + label
- Border radius: `borderRadius.full`

### TimerWidget (`src/components/TimerWidget.tsx`)
- Display circular grande con tiempo formateado
- Efecto breathing cuando está en ejecución (escala pulsante)
- Opcional: anillo SVG de progreso alrededor

### StepItem (`src/components/StepItem.tsx`)
- Checkbox circular (24px) + nombre + duración
- Completado: line-through, opacidad 0.6
- Siguiente: borde `colors.secondary` 1px
- Estado: badge "Completado" o "En progreso"

### LineChart (`src/components/LineChart.tsx`)
- Sin grid lines
- Single-pixel stroke
- Gradient fill suave (opacidad 0.1) bajo la línea

### ConfettiOverlay (`src/components/ConfettiOverlay.tsx`)
- Partículas animadas (30 piezas, colores del theme)
- 5 colores: `['#a9d293', '#2d4f1e', '#98c083', '#d6e3ff', '#8fb6fb']`
- pointerEvents="none" para no bloquear interacciones

---

## Anti-patterns (lo que NO se hace)

- ❌ **Colores hardcodeados** — siempre usar `colors.xxx`
- ❌ **Font del sistema** — siempre Manrope (títulos) o Plus Jakarta Sans (cuerpo)
- ❌ **Estilos inline en screens para componentes que ya existen** — si Button existe, no crear otro botón en la screen
- ❌ **`StyleSheet.create`** — inline styles con tokens
- ❌ **Blanco puro (#FFFFFF) como fondo de pantalla** — usar `colors.surface` (#fafaf3)
- ❌ **Sombras pesadas** — usar `shadows.ambient` (difusa, opacidad 0.04)
- ❌ **Fuente del sistema en lugar de las cargadas** — Manrope y Plus Jakarta Sans se cargan en App.tsx vía expo-font

---

## Checklist pre-merge para UI

- [ ] Todos los colores son tokens del theme, no hex/rgba hardcodeados
- [ ] Tipografía usa `typography.xxx`, no fontSize/fontFamily inline
- [ ] No hay imports de `StyleSheet` (usar inline styles)
- [ ] El componente existe en `src/components/` si se repite en 2+ pantallas
- [ ] Las fuentes Manrope/Plus Jakarta Sans están cargadas en App.tsx
- [ ] Las pantallas nuevas están agregadas a la navegación en App.tsx
