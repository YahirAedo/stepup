import { pickFocusTask } from './pickFocusTask';
import { buildFocusQueue } from './buildFocusQueue';
import { canPostpone } from './postponeStep';

/**
 * Arma el modelo de foco para la UI a partir de los candidatos cargados.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function buildFocusModel<
  T extends { id: number; name: string },
  S extends { id: number; status: 'pending' | 'completed'; order_index: number },
>(
  candidates: Array<{ task: T; steps: S[] }>,
  manualTaskId: number | null,
  postponedIds: number[],
): {
  task: T;
  current: S;
  upcoming: S[];
  canPostpone: boolean;
  switcher: Array<{ taskId: number; name: string; pendingCount: number; isActive: boolean }>;
} | null {
  const picked = pickFocusTask(candidates, manualTaskId);
  if (picked === null) return null;

  const queue = buildFocusQueue(picked.steps, postponedIds);
  if (queue.current === null) return null;

  const pendingCount = picked.steps.filter((step) => step.status === 'pending').length;

  const switcher = candidates
    .filter((candidate) => candidate.steps.some((step) => step.status === 'pending'))
    .map((candidate) => ({
      taskId: candidate.task.id,
      name: candidate.task.name,
      pendingCount: candidate.steps.filter((step) => step.status === 'pending').length,
      isActive: candidate.task.id === picked.task.id,
    }));

  return {
    task: picked.task,
    current: queue.current,
    upcoming: queue.upcoming,
    canPostpone: canPostpone(pendingCount),
    switcher,
  };
}
