export type FocusEmptyState =
  | { kind: 'no-tasks' }
  | { kind: 'needs-steps'; taskIds: number[] }
  | { kind: 'all-done' };

/**
 * Calcula el estado vacío de Foco a partir de los candidatos cargados.
 *
 * Foco solo está vacío cuando NO queda ningún paso pendiente en ninguna
 * tarea. Si hay al menos un paso pendiente, devuelve null (hay algo que
 * mostrar).
 */
export function buildFocusEmptyState(
  candidates: Array<{ task: { id: number }; steps: Array<{ status: 'pending' | 'completed' }> }>,
): FocusEmptyState | null {
  // Si algún candidato tiene un paso pendiente, no estamos vacíos.
  for (const candidate of candidates) {
    if (candidate.steps.some((step) => step.status === 'pending')) {
      return null;
    }
  }

  if (candidates.length === 0) {
    return { kind: 'no-tasks' };
  }

  const taskIdsWithoutSteps = candidates
    .filter((candidate) => candidate.steps.length === 0)
    .map((candidate) => candidate.task.id);

  if (taskIdsWithoutSteps.length > 0) {
    return { kind: 'needs-steps', taskIds: taskIdsWithoutSteps };
  }

  return { kind: 'all-done' };
}