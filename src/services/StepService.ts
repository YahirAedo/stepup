import { Step, CreateStepInput, UpdateStepInput } from '../types';
import { apiFetch, ENDPOINTS } from './api';

type ApiStep = {
  id: number;
  taskId: number;
  name: string;
  durationMin: number | null;
  orderIndex: number;
  status: 'pending' | 'completed';
  completedAt: string | null;
};

function toStep(step: ApiStep): Step {
  return {
    id: step.id,
    task_id: step.taskId,
    name: step.name,
    duration_min: step.durationMin,
    order_index: step.orderIndex,
    status: step.status,
    completed_at: step.completedAt,
  };
}

export const StepService = {
  async add(input: CreateStepInput): Promise<Step> {
    const step = await apiFetch<ApiStep>(ENDPOINTS.steps.create, {
      method: 'POST',
      body: JSON.stringify({
        taskId: input.task_id,
        name: input.name,
        durationMin: input.duration_min ?? null,
      }),
    });
    return toStep(step);
  },

  async getByTask(task_id: number): Promise<Step[]> {
    const steps = await apiFetch<ApiStep[]>(ENDPOINTS.steps.list(task_id));
    return steps.map(toStep);
  },

  async getNextPending(task_id: number): Promise<Step | null> {
    const steps = await this.getByTask(task_id);
    return steps.find((step) => step.status === 'pending') ?? null;
  },

  async update(id: number, input: UpdateStepInput): Promise<void> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.duration_min !== undefined) body.durationMin = input.duration_min;
    await apiFetch(ENDPOINTS.steps.update(id), {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch(ENDPOINTS.steps.remove(id), { method: 'DELETE' });
  },

  async getStepCounts(task_id: number): Promise<{ total: number; completed: number }> {
    const steps = await this.getByTask(task_id);
    return {
      total: steps.length,
      completed: steps.filter((step) => step.status === 'completed').length,
    };
  },

  async reorder(task_id: number, orderedIds: number[]): Promise<void> {
    await apiFetch(ENDPOINTS.steps.reorder, {
      method: 'PUT',
      body: JSON.stringify({ taskId: task_id, orderedIds }),
    });
  },

  async complete(id: number): Promise<{ nextStep: Step | null; taskCompleted: boolean }> {
    const result = await apiFetch<{ nextStep: ApiStep | null; taskCompleted: boolean }>(
      ENDPOINTS.steps.complete(id),
      { method: 'PATCH' },
    );
    return {
      nextStep: result.nextStep ? toStep(result.nextStep) : null,
      taskCompleted: result.taskCompleted,
    };
  },
};
