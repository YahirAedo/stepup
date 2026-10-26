/**
 * Lógica pura para reordenar pasos en el modo Ordenar del Design Lab.
 * Sin dependencias de RN. Testeable de forma aislada.
 *
 * Reglas:
 * - Los pasos en `lockedIds` (completados o pendingDelete) quedan anclados:
 *   no se pueden elegir ni usar como destino, y conservan su posición.
 * - Los pendientes se reordenan entre las posiciones que ocupan los pendientes.
 * - Tocar un paso pendiente lo elige. Tocar el mismo elegido lo suelta.
 * - Tocar otro pendiente mueve el elegido a la posición exacta del tocado;
 *   los demás pendientes se corren (no intercambio).
 */

export interface MoveToPositionResult {
  order: string[];
  selectedId: string | null;
}

/**
 * @param order      orden actual de ids de pasos
 * @param selectedId id del paso actualmente elegido (null si ninguno)
 * @param targetId   id del paso sobre el que se tocó (null si ningún toque)
 * @param lockedIds  ids anclados (completados / pendingDelete)
 */
export function moveToPosition(
  order: string[],
  selectedId: string | null,
  targetId: string | null,
  lockedIds: string[] = [],
): MoveToPositionResult {
  const lockedSet = new Set(lockedIds);

  // Sin toque: no-op
  if (targetId == null) {
    return { order, selectedId };
  }

  // Destino bloqueado: no-op
  if (lockedSet.has(targetId)) {
    return { order, selectedId };
  }

  // No hay elegido: seleccionar el tocado (si no está locked, ya verificado)
  if (selectedId == null) {
    return { order, selectedId: targetId };
  }

  // Tocar el mismo elegido: soltar
  if (selectedId === targetId) {
    return { order, selectedId: null };
  }

  // Elegido bloqueado (no debería ocurrir): no-op
  if (lockedSet.has(selectedId)) {
    return { order, selectedId };
  }

  // Solo los ids pendientes (no locked) participan del reorden
  const pendingIds = order.filter((id) => !lockedSet.has(id));

  const selectedPos = pendingIds.indexOf(selectedId);
  const targetPos = pendingIds.indexOf(targetId);

  if (selectedPos === -1 || targetPos === -1) {
    return { order, selectedId };
  }

  // Mover el elegido a la posición del tocado dentro de los pendientes
  const nextPending = [...pendingIds];
  const [moved] = nextPending.splice(selectedPos, 1);
  nextPending.splice(targetPos, 0, moved);

  // Reconstruir el orden completo: locked anclados, pendientes reordenados
  const result = [...order];
  let pi = 0;
  for (let i = 0; i < result.length; i++) {
    if (!lockedSet.has(result[i])) {
      result[i] = nextPending[pi++];
    }
  }

  return { order: result, selectedId: selectedId };
}
