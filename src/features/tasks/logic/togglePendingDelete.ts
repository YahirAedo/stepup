/**
 * Alterna un paso en el conjunto de borrados pendientes.
 * Devuelve un nuevo arreglo (no muta el original).
 */
export function togglePendingDelete(
  pendingDeleteIds: ReadonlyArray<number>,
  stepId: number,
): number[] {
  const set = new Set(pendingDeleteIds);
  if (set.has(stepId)) {
    set.delete(stepId);
  } else {
    set.add(stepId);
  }
  return Array.from(set).sort((a, b) => a - b);
}
