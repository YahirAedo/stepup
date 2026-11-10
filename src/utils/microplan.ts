/**
 * Logica pura de la parte "Tareas" de las previews del Design Lab.
 *
 * Mismo patron que `src/utils/countdown.ts`: funciones puras testeadas,
 * sin dependencias de RN. Estas funciones traducen el copy y los calculos
 * de los mockups de Tareas (Listado, Detalle, Editar paso).
 */

export interface StepPlanInput {
  duration_min?: number | null;
}

/** Suma la duracion estimada de una lista de pasos. `null` se trata como 0. */
export function computeTotalMinutes(steps: StepPlanInput[]): number {
  return steps.reduce((sum, s) => sum + (s.duration_min ?? 0), 0);
}

export type FrictionLevel = 'none' | 'low' | 'high';

/**
 * Nivel de friccion del desglose segun la duracion total.
 * - <= 3 min: friccion cero (un micro-paso de arranque)
 * - <= 7 min: friccion minima (ideal para sesion corta)
 * - mas: conviene dividir
 */
export function frictionLevelFor(totalMinutes: number): FrictionLevel {
  if (totalMinutes <= 3) return 'none';
  if (totalMinutes <= 7) return 'low';
  return 'high';
}

export const frictionLabels: Record<FrictionLevel, string> = {
  none: 'Fricción cero',
  low: 'Fricción mínima',
  high: 'Considera dividir',
};

export const frictionIcons: Record<FrictionLevel, string> = {
  none: '⚡',
  low: '✨',
  high: '⚠️',
};

/**
 * Posicion de paso 1-based clampada dentro del total.
 * Evita que "Paso 0/X" o "Paso Y/X" con Y > X rompan la UI.
 */
export function clampStepPosition(current: number, total: number): number {
  if (total <= 0) return 1;
  return Math.min(Math.max(1, current), total);
}

/** "Paso 2/4" safe con clamp. `total=0` -> "Paso 1/?" no aplica, devuelve solo indice. */
export function stepPositionLabel(current: number, total: number): string {
  if (total <= 0) return `Paso ${clampStepPosition(current, total)}`;
  return `Paso ${clampStepPosition(current, total)}/${total}`;
}

/** "3 micro-pasos (~8 min total)" -> "8 min total". Sin micro-prefijo en el repo. */
export function totalMinutesLabel(totalMinutes: number): string {
  return `${totalMinutes} min total`;
}

/** Paso con estado para los calculos de progreso (Fixture/preview Tareas). */
export interface StepProgressInput {
  duration_min?: number | null;
  completed?: boolean;
}

/**
 * Nueva posicion al mover un paso arriba/abajo, clampada al rango valido.
 * `up` en el primer paso y `down` en el ultimo devuelven la misma posicion.
 */
export function nextStepPosition(current: number, total: number, direction: 'up' | 'down'): number {
  const delta = direction === 'up' ? -1 : 1;
  return clampStepPosition(current + delta, total);
}

/**
 * Minuto de inicio de cada paso (timeline vertical de la Variante C).
 * `[0, d0, d0+d1, ...]` — el paso i arranca en `starts[i]`.
 */
export function stepStartMinutes(steps: StepPlanInput[]): number[] {
  const starts: number[] = [];
  let acc = 0;
  for (const step of steps) {
    starts.push(acc);
    acc += step.duration_min ?? 0;
  }
  return starts;
}

/** Suma de duraciones de los pasos no completados. */
export function remainingMinutes(steps: StepProgressInput[]): number {
  return computeTotalMinutes(steps.filter((step) => !step.completed));
}

/** Cantidad de pasos completados. */
export function completedStepCount(steps: StepProgressInput[]): number {
  return steps.filter((step) => step.completed).length;
}

/** "1 paso" / "N pasos", sin micro-prefijo. */
export function stepCountLabel(count: number): string {
  return count === 1 ? '1 paso' : `${count} pasos`;
}

/** Marca de minutos acumulados "MM:00" para la timeline de la Variante C. */
export function clockLabel(totalMinutes: number): string {
  const clamped = Math.max(0, Math.floor(totalMinutes));
  return `${String(clamped).padStart(2, '0')}:00`;
}

/** true si el titulo supera el umbral anti-friccion (microcopy "proyecto grande"). */
export function isLongTitle(title: string, threshold = 25): boolean {
  return title.trim().length > threshold;
}

/** Paso con su variante de secuencia (para reordenar pendientes). */
export interface OrderedStepInput {
  variant: 'completed' | 'active' | 'pending';
}

/**
 * true si el paso en `index` se puede posponer: esta pendiente y hay mas de un
 * pendiente (si es el unico, moverlo no cambia nada).
 */
export function canPostponeStep(steps: ReadonlyArray<OrderedStepInput>, index: number): boolean {
  const step = steps[index];
  if (!step || step.variant !== 'pending') return false;
  return steps.filter((s) => s.variant === 'pending').length > 1;
}

/**
 * Mueve el paso pendiente en `index` al final de los pendientes de la misma
 * tarea. Deja intactos los completados y el paso en foco. Si no se puede
 * posponer, devuelve la lista original sin cambios.
 */
export function postponePendingStep<T extends OrderedStepInput>(steps: T[], index: number): T[] {
  if (!canPostponeStep(steps, index)) return steps;
  const step = steps[index];
  const rest = steps.filter((_, i) => i !== index);
  let lastPending = -1;
  rest.forEach((item, i) => {
    if (item.variant === 'pending') lastPending = i;
  });
  const result = rest.slice();
  result.splice(lastPending + 1, 0, step);
  return result;
}