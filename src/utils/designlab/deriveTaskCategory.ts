import type { Step } from '../../types';

/**
 * Categorias de tarea del rediseno, DERIVADAS de los pasos (sin estado guardado).
 *
 * - `notStarted` ("Por empezar"): ningun paso completado. Incluye tareas sin pasos.
 * - `inProgress` ("En curso"): al menos un paso completado y queda alguno pendiente.
 * - `completed` ("Completadas"): todos los pasos completos.
 *
 * Si a una tarea completada se le agrega un paso, vuelve a "En curso" sola.
 */
export type TaskCategory = 'inProgress' | 'notStarted' | 'completed';

export function deriveTaskCategory(steps: ReadonlyArray<Pick<Step, 'status'>>): TaskCategory {
  if (steps.length === 0) return 'notStarted';
  let completed = 0;
  for (const step of steps) {
    if (step.status === 'completed') completed += 1;
  }
  if (completed === 0) return 'notStarted';
  if (completed === steps.length) return 'completed';
  return 'inProgress';
}

type FocusStep = {
  status: Step['status'];
  completed_at?: Step['completed_at'];
};

export type FocusCandidate = {
  steps: ReadonlyArray<FocusStep>;
};

/**
 * Elige la tarea "En foco": la tarea En curso cuyo paso completado es el mas
 * reciente. Si no hay ninguna En curso, devuelve el indice de la primera
 * "Por empezar". Si no hay ninguna, devuelve `null`.
 */
export function pickFocusTask(candidates: ReadonlyArray<FocusCandidate>): number | null {
  let bestIndex: number | null = null;
  let bestAt = '';
  let firstNotStarted: number | null = null;

  candidates.forEach((candidate, index) => {
    if (candidate.steps.length === 0) return; // ignora tareas sin pasos
    const category = deriveTaskCategory(candidate.steps);
    if (category === 'inProgress') {
      const latest = candidate.steps.reduce((acc, step) => {
        if (step.status !== 'completed' || !step.completed_at) return acc;
        return step.completed_at > acc ? step.completed_at : acc;
      }, '');
      if (bestIndex === null || latest > bestAt) {
        bestIndex = index;
        bestAt = latest;
      }
    } else if (category === 'notStarted' && firstNotStarted === null) {
      firstNotStarted = index;
    }
  });

  return bestIndex ?? firstNotStarted;
}
