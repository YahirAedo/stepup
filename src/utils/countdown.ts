/**
 * Matematica pura del cronometro de las previews del Design Lab.
 *
 * Separada del hook (`src/hooks/useFocusCountdown.ts`) siguiendo la
 * convencion del repo: los tests cubren logica pura, no componentes. No hay
 * `@testing-library/react-native` ni `react-test-renderer` en el proyecto, asi
 * que el hook queda como una capa fina sobre estas funciones y esto es lo que
 * se testea. Ver `SyncConflictScreen.test.ts` -> `utils/syncConflict.ts` para
 * el mismo patron.
 *
 * Traduce el `<script>` del mockup `stepup_cron_metro_limpio_modo_claro`.
 * Issue: #295.
 */

export interface CountdownState {
  /** Segundos que faltan. Nunca negativo. */
  remaining: number;
  /** Segundos totales del objetivo; base del arco y del "Meta: X min". */
  total: number;
}

/** Crea el estado inicial: el objetivo nunca puede ser menor al restante. */
export function createCountdownState(initialSeconds: number, maxSeconds: number): CountdownState {
  const remaining = clampSeconds(initialSeconds);
  return { remaining, total: Math.max(clampSeconds(maxSeconds), remaining) };
}

/** No baja de cero. `NaN` se trata como 0. */
export function clampSeconds(seconds: number): number {
  if (Number.isNaN(seconds)) return 0;
  return Math.max(0, Math.floor(seconds));
}

/** Descuenta un segundo. Se queda en 0 (identidad) cuando ya termino. */
export function tickState(state: CountdownState): CountdownState {
  if (state.remaining <= 0) return state;
  return { ...state, remaining: state.remaining - 1 };
}

/**
 * Suma segundos al restante.
 *
 * Replica `addTwoMinutes()` del mockup, que agranda `maxSeconds` SOLO cuando
 * `totalSeconds` lo supera: agregar 2 minutos con 4:20 restantes no agranda el
 * objetivo a 7:00, lo deja en 5:00.
 */
export function addSecondsToState(state: CountdownState, seconds: number): CountdownState {
  const delta = clampSeconds(seconds);
  if (delta === 0) return state;
  const remaining = state.remaining + delta;
  return { remaining, total: Math.max(state.total, remaining) };
}

/** Fraccion 0..1 del arco que queda dibujado. Clamp defensivo ante `total` 0. */
export function computeProgress(state: CountdownState): number {
  if (state.total <= 0) return 0;
  return Math.min(1, Math.max(0, state.remaining / state.total));
}

/** `mm:ss` con digitos de relleno. `252` -> `"04:12"`. */
export function formatCountdown(seconds: number): string {
  const safe = clampSeconds(seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/** Minutos redondeados hacia arriba, para etiquetas tipo "Meta: 5 min". */
export function toMinutesLabel(seconds: number): string {
  return `${Math.ceil(clampSeconds(seconds) / 60)}`;
}

/** Circunferencia de un anillo SVG. Con r=84 -> 527.78. */
export function circleCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

/**
 * `strokeDashoffset` del anillo de progreso.
 *
 * 0 = arco completo, circunferencia = arco invisible. Es la formula del
 * mockup: `offset = circumference * (1 - progressRatio)`.
 */
export function progressDashOffset(progress: number, radius: number): number {
  const ratio = Math.min(1, Math.max(0, progress));
  return circleCircumference(radius) * (1 - ratio);
}
