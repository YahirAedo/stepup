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
  S extends { id: number; name: string; duration_min: number | null; status: 'pending' | 'completed'; order_index: number },
>(
  candidates: Array<{ task: T; steps: S[] }>,
  manualTaskId: number | null,
  postponedIds: number[],
): {
  task: T;
  current: S;
  upcoming: S[];
  canPostpone: boolean;
  pendingCount: number;
  totalSteps: number;
  stepIndex: number;
  switcher: Array<{
    taskId: number;
    name: string;
    pendingCount: number;
    isActive: boolean;
    stepName: string;
    stepMinutes: number | null;
    stepIndex: number;
    totalSteps: number;
  }>;
} | null {
  const picked = pickFocusTask(candidates, manualTaskId);
  if (picked === null) return null;

  const queue = buildFocusQueue(picked.steps, postponedIds);
  if (queue.current === null) return null;

  const pendingCount = picked.steps.filter((step) => step.status === 'pending').length;
  const totalSteps = picked.steps.length;
  const stepIndex = picked.steps.filter((step) => step.status === 'completed').length + 1;

  const switcher = candidates
    .filter((candidate) => candidate.steps.some((step) => step.status === 'pending'))
    .map((candidate) => {
      const candidatePending = candidate.steps.filter((step) => step.status === 'pending').length;
      const candidateTotal = candidate.steps.length;
      const candidateStepIndex =
        candidate.steps.filter((step) => step.status === 'completed').length + 1;
      const candidateQueue = buildFocusQueue(candidate.steps, postponedIds);
      return {
        taskId: candidate.task.id,
        name: candidate.task.name,
        pendingCount: candidatePending,
        isActive: candidate.task.id === picked.task.id,
        stepName: candidateQueue.current?.name ?? '',
        stepMinutes: candidateQueue.current?.duration_min ?? null,
        stepIndex: candidateStepIndex,
        totalSteps: candidateTotal,
      };
    });

  return {
    task: picked.task,
    current: queue.current,
    upcoming: queue.upcoming,
    canPostpone: canPostpone(pendingCount),
    pendingCount,
    totalSteps,
    stepIndex,
    switcher,
  };
}
