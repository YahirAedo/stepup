/**
 * Reordena pasos moviendo el paso en `movedIndex` a `targetIndex`.
 *
 * Reglas:
 * - Opera solo sobre pasos pendientes y no borrados.
 * - Los completados quedan anclados en su lugar.
 * - Los borrados pendientes quedan fuera de la lista resultante.
 * - Los demás se corren (no se intercambian).
 */
export function reorderSteps(
  steps: ReadonlyArray<{
    id: number;
    status: 'pending' | 'completed';
    pendingDelete?: boolean;
  }>,
  movedIndex: number,
  targetIndex: number,
): number[] {
  const pendingNotDeleted = steps.filter(
    (step) => step.status === 'pending' && !step.pendingDelete,
  );
  if (pendingNotDeleted.length === 0) return [];

  const clampedTarget = Math.max(0, Math.min(targetIndex, pendingNotDeleted.length - 1));
  if (movedIndex === clampedTarget) {
    return pendingNotDeleted.map((step) => step.id);
  }

  const [moved] = pendingNotDeleted.splice(movedIndex, 1);
  pendingNotDeleted.splice(clampedTarget, 0, moved);
  return pendingNotDeleted.map((step) => step.id);
}

/**
 * Función pura: arma la lista COMPLETA de ids del task, reordenando solo
 * los pasos pendientes no borrados en los huecos restantes.
 *
 * Reglas:
 * - Los completados quedan anclados en su posición original.
 * - Los marcados para borrar quedan en su posición original.
 * - Los pendientes no borrados se reordenan en los huecos restantes.
 * - El paso en `prevId` se mueve a la posición de `targetId`.
 * - Los demás se corren (no se intercambian).
 */
export function buildReorderOrder(
  steps: ReadonlyArray<{ id: number; status: 'pending' | 'completed' }>,
  prevId: number,
  targetId: number,
  excludeIds: ReadonlyArray<number>,
): number[] {
  const pendingNotDeleted = steps.filter(
    (step) => step.status === 'pending' && !excludeIds.includes(step.id),
  );
  const prevIndex = pendingNotDeleted.findIndex((s) => s.id === prevId);
  const targetIndex = pendingNotDeleted.findIndex((s) => s.id === targetId);
  if (prevIndex < 0 || targetIndex < 0 || prevIndex === targetIndex) {
    return steps.map((s) => s.id);
  }
  const reorderedPending = reorderSteps(pendingNotDeleted, prevIndex, targetIndex);

  // Construir lista completa: completados y borrados en su posición,
  // pendientes no borrados en los huecos restantes (en el nuevo orden).
  const result = [...steps.map((s) => s.id)];
  let pendingCursor = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.status === 'pending' && !excludeIds.includes(step.id)) {
      result[i] = reorderedPending[pendingCursor];
      pendingCursor++;
    }
  }
  return result;
}
