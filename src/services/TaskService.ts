import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { apiFetch, ApiError, ENDPOINTS } from './api';

type ApiTask = {
  id: number;
  name: string;
  dueDate: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  completedAt: string | null;
};

function toTask(task: ApiTask): Task {
  return {
    id: task.id,
    name: task.name,
    due_date: task.dueDate,
    status: task.status,
    created_at: task.createdAt,
    completed_at: task.completedAt,
  };
}

export const TaskService = {
  async create(input: CreateTaskInput): Promise<Task> {
    const task = await apiFetch<ApiTask>(ENDPOINTS.tasks.create, {
      method: 'POST',
      body: JSON.stringify({ name: input.name, dueDate: input.due_date ?? null }),
    });
    return toTask(task);
  },

  async getAll(): Promise<Task[]> {
    const tasks = await apiFetch<ApiTask[]>(ENDPOINTS.tasks.list);
    return tasks.map(toTask);
  },

  async getById(id: number): Promise<Task | null> {
    try {
      const task = await apiFetch<ApiTask>(ENDPOINTS.tasks.detail(id));
      return toTask(task);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async update(id: number, input: UpdateTaskInput): Promise<void> {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.due_date !== undefined) body.dueDate = input.due_date;
    await apiFetch(ENDPOINTS.tasks.update(id), {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch(ENDPOINTS.tasks.remove(id), { method: 'DELETE' });
  },

  async complete(id: number): Promise<boolean> {
    await apiFetch(ENDPOINTS.tasks.complete(id), { method: 'PATCH' });
    return true;
  },

  async getCompleted(): Promise<Task[]> {
    const tasks = await apiFetch<ApiTask[]>(ENDPOINTS.tasks.completed);
    return tasks.map(toTask);
  },
};
