/**
 * true si hay al menos 3 pasos visibles para ordenar.
 */
export function canOrderSteps(visibleStepsCount: number): boolean {
  return visibleStepsCount >= 3;
}
