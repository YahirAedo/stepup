import { useCallback } from 'react';
import type { Step } from '../../../types';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import { buildTasksListModel, type TaskListModel } from '../logic/buildTasksListModel';

export function useTasksList() {
  const refresh = useCallback(async (): Promise<TaskListModel> => {
    const tasks = await TaskService.getAll();
    const steps: Step[] = [];
    for (const task of tasks) {
      const taskSteps = await StepService.getByTask(task.id);
      steps.push(...taskSteps);
    }
    return buildTasksListModel(tasks, steps);
  }, []);

  return { refresh };
}
