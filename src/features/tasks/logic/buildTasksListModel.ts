import type { Step, Task } from '../../../types';
import { deriveTaskCategory, pickFocusTask, type TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import { getCurrentStepIndex, getProgressBar } from './getProgressBar';

export type TaskListItem = {
  id: number;
  name: string;
  category: TaskCategory;
  targetDate: string | null;
  completedAt: string | null;
  stepCount: number;
  completedStepCount: number;
  progress: ReturnType<typeof getProgressBar>;
  steps: ReadonlyArray<{ title: string; done: boolean; current: boolean }>;
};

export type TaskListModel = {
  items: TaskListItem[];
  counts: Record<TaskCategory, number>;
  focusIndex: number | null;
};

/**
 * Construye el modelo de vista del listado de tareas a partir de tareas y pasos.
 * La categoría se deriva de los pasos (no de tasks.status).
 *
 * @param tasks todas las tareas
 * @param steps todos los pasos (agrupados internamente por task_id)
 * @returns modelo de vista para TasksListView
 */
export function buildTasksListModel(
  tasks: ReadonlyArray<Task>,
  steps: ReadonlyArray<Step>,
): TaskListModel {
  const stepsByTask = new Map<number, Step[]>();
  for (const step of steps) {
    const list = stepsByTask.get(step.task_id) ?? [];
    list.push(step);
    stepsByTask.set(step.task_id, list);
  }

  const items: TaskListItem[] = tasks.map((task) => {
    const taskSteps = stepsByTask.get(task.id) ?? [];
    const category = deriveTaskCategory(taskSteps);
    const progress = getProgressBar(taskSteps);
    const completedStepCount = taskSteps.filter((step) => step.status === 'completed').length;
    const stepStatuses = taskSteps.map((step) =>
      step.status === 'completed' ? 'done' : 'pending',
    ) as ReadonlyArray<'done' | 'current' | 'pending'>;
    const currentIdx = getCurrentStepIndex(stepStatuses);
    return {
      id: task.id,
      name: task.name,
      category,
      targetDate: task.due_date ?? null,
      completedAt: task.completed_at,
      stepCount: taskSteps.length,
      completedStepCount,
      progress,
      steps: taskSteps.map((step, idx) => ({
        title: step.name,
        done: step.status === 'completed',
        current: idx === currentIdx,
      })),
    };
  });

  const counts: Record<TaskCategory, number> = { inProgress: 0, notStarted: 0, completed: 0 };
  for (const item of items) {
    counts[item.category] += 1;
  }

  // pickFocusTask necesita pasos por candidato
  const focusCandidatesWithSteps = items.map((item) => ({
    steps: stepsByTask.get(item.id) ?? [],
  }));
  const focusIndex = pickFocusTask(focusCandidatesWithSteps);

  return {
    items,
    counts,
    focusIndex,
  };
}
