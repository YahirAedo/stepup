/**
 * Lógica pura de armado de la cola de pasos en foco.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función. Acá solo se ordena y reorganiza la cola a partir de los pasos
 * y los ids pospuestos recibidos.
 */
export function buildFocusQueue<
  S extends { id: number; status: 'pending' | 'completed'; order_index: number },
>(steps: S[], postponedIds: number[]): { current: S | null; upcoming: S[] } {
  const pending = steps
    .filter((step) => step.status === 'pending')
    .slice()
    .sort((a, b) => a.order_index - b.order_index);

  const pendingIds = new Set(pending.map((step) => step.id));
  const byId = new Map(pending.map((step) => [step.id, step] as const));

  // Pospuestos al final, en el orden en que aparecen en postponedIds (sin duplicar).
  const postponed: S[] = [];
  const seenPostponed = new Set<number>();
  for (const id of postponedIds) {
    if (seenPostponed.has(id)) continue;
    if (!pendingIds.has(id)) continue;
    const step = byId.get(id);
    if (step !== undefined) {
      postponed.push(step);
      seenPostponed.add(id);
    }
  }

  const postponedIdSet = new Set(postponed.map((step) => step.id));
  const normal = pending.filter((step) => !postponedIdSet.has(step.id));

  const queue = [...normal, ...postponed];

  return {
    current: queue[0] ?? null,
    upcoming: queue.slice(1),
  };
}
