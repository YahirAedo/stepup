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