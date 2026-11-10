/**
 * Función pura: determina el modo del pie de acciones en el Detalle.
 */
export function getDetailFooterMode(
  steps: ReadonlyArray<{ id: number; status: 'pending' | 'completed' }>,
): 'none' | 'active' | 'completed' {
  if (steps.length === 0) return 'none';
  const allCompleted = steps.every((s) => s.status === 'completed');
  return allCompleted ? 'completed' : 'active';
}
