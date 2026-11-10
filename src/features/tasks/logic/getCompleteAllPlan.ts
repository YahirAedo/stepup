/**
 * Funciones puras para completar/reabrir una tarea en bloque.
 *
 * No mutan la entrada. Solo describen el plan; la aplicación (llamar a
 * StepService.complete/uncomplete por cada id) la hace el hook de la pantalla.
 */

export interface CompleteAllPlan {
  pendingIds: number[];
  pendingCount: number;
  canComplete: boolean;
}

export interface ReopenAllPlan {
  completedIds: number[];
  completedCount: number;
  canReopen: boolean;
}

export function getCompleteAllPlan(
  steps: ReadonlyArray<{ id: number; status: 'pending' | 'completed' }>,
): CompleteAllPlan {
  const pendingIds = steps
    .filter((step) => step.status === 'pending')
    .map((step) => step.id);
  const pendingCount = pendingIds.length;
  const canComplete = steps.length > 0 && pendingCount > 0;
  return { pendingIds, pendingCount, canComplete };
}

export function getReopenAllPlan(
  steps: ReadonlyArray<{ id: number; status: 'pending' | 'completed' }>,
): ReopenAllPlan {
  const completedIds = steps
    .filter((step) => step.status === 'completed')
    .map((step) => step.id);
  const completedCount = completedIds.length;
  const canReopen = steps.length > 0 && completedCount > 0;
  return { completedIds, completedCount, canReopen };
}
