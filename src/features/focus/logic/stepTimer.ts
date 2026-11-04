/**
 * Lógica pura del timer de un paso en foco.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export const DEFAULT_STEP_MINUTES = 5;
export const EXTEND_SECONDS = 120;

export function resolveStepMinutes(durationMin: number | null): number {
  if (durationMin === null || durationMin <= 0) return DEFAULT_STEP_MINUTES;
  return durationMin;
}

export function shouldKeepTimer(a: {
  started: boolean;
  prevStepId: number | null;
  nextStepId: number | null;
}): boolean {
  return a.started && a.prevStepId !== null && a.prevStepId === a.nextStepId;
}