/**
 * Lógica pura de selección de la tarea en foco.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función. Acá solo se aplica la regla de selección sobre los candidatos
 * recibidos, que ya vienen ordenados como en `TaskService.getAll()`.
 */
export function pickFocusTask<
  C extends { task: { id: number }; steps: Array<{ status: 'pending' | 'completed' }> },
>(candidates: C[], manualTaskId: number | null): C | null {
  const hasPending = (candidate: C): boolean =>
    candidate.steps.some((step) => step.status === 'pending');

  if (manualTaskId !== null) {
    const manual = candidates.find((candidate) => candidate.task.id === manualTaskId);
    if (manual !== undefined && hasPending(manual)) {
      return manual;
    }
  }

  return candidates.find(hasPending) ?? null;
}
