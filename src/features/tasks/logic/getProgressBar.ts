export type ProgressBarResult =
  | { kind: 'segments'; statuses: ReadonlyArray<'done' | 'current' | 'pending'> }
  | { kind: 'continuous'; proportion: number };

export function getProgressBar(
  steps: ReadonlyArray<{ status: 'pending' | 'completed' }>,
): ProgressBarResult {
  const total = steps.length;
  if (total === 0) return { kind: 'continuous', proportion: 0 };
  const completed = steps.filter((step) => step.status === 'completed').length;
  const proportion = total === 0 ? 0 : completed / total;
  if (total <= 8) {
    return {
      kind: 'segments',
      // Los 'done' son los primeros N (N = cantidad de completados),
      // sin importar en qué posición esté el paso completado.
      statuses: steps.map((_, i) => (i < completed ? 'done' : 'pending')),
    };
  }
  return { kind: 'continuous', proportion };
}

/**
 * Índice del primer paso pendiente (paso actual). -1 si todos están completados.
 */
export function getCurrentStepIndex(
  statuses: ReadonlyArray<'done' | 'current' | 'pending'>,
): number {
  return statuses.findIndex((st) => st === 'pending');
}

export function getFillWidthPercent(progress: ProgressBarResult): number | null {
  if (progress.kind !== 'continuous') return null;
  return Math.round(progress.proportion * 100);
}
