/**
 * Lógica pura de posposición de un paso en la cola de foco.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función. Acá solo se manipula la lista de ids pospuestos.
 */
export function postponeStep(postponedIds: number[], stepId: number): number[] {
  const without = postponedIds.filter((id) => id !== stepId);
  return [...without, stepId];
}

export function canPostpone(pendingCount: number): boolean {
  return pendingCount >= 2;
}
