/**
 * Decide si se muestra el botón de "Ordenar" en el Detalle.
 *
 * Regla: 3 o más pasos pendientes, sin contar los marcados para borrado
 * pendiente (`pendingDeleteIds`).
 */
export function canShowReorder(
  steps: ReadonlyArray<{ id: number; status: 'pending' | 'completed' }>,
  pendingDeleteIds: ReadonlyArray<number>,
): boolean {
  const pendingNotDeleted = steps.filter(
    (step) => step.status === 'pending' && !pendingDeleteIds.includes(step.id),
  );
  return pendingNotDeleted.length >= 3;
}
