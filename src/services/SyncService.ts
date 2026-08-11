import type { Task } from '../types';
import { getDb } from '../database/db';
import {
  applyServerIds,
  getAllSteps,
  getAllTasks,
  getConflicts as getStoredConflicts,
  getDirtySteps,
  getDirtyTasks,
  getLastSyncAt,
  getTaskIdByServerId,
  nowIso,
  resolveConflictKeepLocal as resolveLocalConflict,
  resolveConflictKeepServer as resolveServerConflict,
  setLastSyncAt,
  upsertServerStep,
  upsertServerTask,
  type ServerStep,
  type ServerTask,
  type SyncConflict,
} from '../database/sync';
import { apiFetch, ENDPOINTS } from './api';
import { hasSession, saveSession, type SessionUser } from './session';

type PushTask = {
  id?: string;
  localId: number;
  name: string;
  dueDate: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

type PushStep = {
  id?: string;
  localId: number;
  taskId?: string;
  taskLocalId?: number;
  name: string;
  durationMin: number | null;
  orderIndex: number;
  status: 'pending' | 'completed';
  updatedAt: string;
  completedAt: string | null;
};

type PushResult = {
  tasks: Array<{ id: string; applied: boolean; localId?: number }>;
  steps: Array<{ id: string; applied: boolean; localId?: number }>;
};

export type PushSummary = { tasks: number; steps: number };

type MigrateTask = {
  id?: string;
  localId: number;
  name: string;
  dueDate: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

type MigrateStep = {
  localId: number;
  taskId?: string;
  taskLocalId: number;
  name: string;
  durationMin: number | null;
  orderIndex: number;
  status: 'pending' | 'completed';
  updatedAt: string;
  completedAt: string | null;
};

type MigrateResponse = {
  user: SessionUser;
  token: string;
  taskMap: Record<string, string>;
  stepMap: Record<string, string>;
};

export async function syncNow(): Promise<void> {
  if (!hasSession()) return;
  try {
    await SyncService.push();
  } catch {
    // offline: los cambios quedan dirty para el próximo ciclo de vida
  }
}

export const SyncService = {
  async push(): Promise<PushSummary> {
    if (!hasSession()) {
      return { tasks: 0, steps: 0 };
    }

    const db = await getDb();
    const tasks = await getDirtyTasks(db);
    const steps = await getDirtySteps(db);

    if (tasks.length === 0 && steps.length === 0) {
      return { tasks: 0, steps: 0 };
    }

    const taskByLocal = new Map<number, Task>();
    for (const task of tasks) taskByLocal.set(task.id, task);

    const result = await apiFetch<PushResult>(ENDPOINTS.sync.push, {
      method: 'POST',
      body: JSON.stringify({
        tasks: tasks.map((task): PushTask => ({
          ...(task.server_id ? { id: task.server_id } : {}),
          localId: task.id,
          name: task.name,
          dueDate: task.due_date,
          status: task.status,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completedAt: task.completed_at,
        })),
        steps: steps.map((step): PushStep => {
          const parent = taskByLocal.get(step.task_id);
          const taskServerId = parent?.server_id ?? null;
          return {
            ...(step.server_id ? { id: step.server_id } : {}),
            localId: step.id,
            ...(taskServerId ? { taskId: taskServerId } : { taskLocalId: step.task_id }),
            name: step.name,
            durationMin: step.duration_min,
            orderIndex: step.order_index,
            status: step.status,
            updatedAt: step.updated_at,
            completedAt: step.completed_at,
          };
        }),
      }),
    });

    const taskMap: Record<string, string> = {};
    for (const item of result.tasks) {
      if (item.localId !== undefined) taskMap[String(item.localId)] = item.id;
    }
    const stepMap: Record<string, string> = {};
    for (const item of result.steps) {
      if (item.localId !== undefined) stepMap[String(item.localId)] = item.id;
    }

    await applyServerIds(db, 'tasks', taskMap);
    await applyServerIds(db, 'steps', stepMap);

    return { tasks: result.tasks.length, steps: result.steps.length };
  },

  async pull(): Promise<PushSummary> {
    if (!hasSession()) {
      return { tasks: 0, steps: 0 };
    }

    const db = await getDb();
    const previousSync = await getLastSyncAt(db);
    const marker = nowIso();
    const query = previousSync ? `?since=${encodeURIComponent(previousSync)}` : '';

    const result = await apiFetch<{ tasks: ServerTask[]; steps: ServerStep[] }>(
      `${ENDPOINTS.sync.pull}${query}`,
    );

    for (const task of result.tasks) {
      await upsertServerTask(db, task);
    }

    let appliedSteps = 0;
    for (const step of result.steps) {
      const taskId = await getTaskIdByServerId(db, step.taskId);
      if (taskId === null) continue;
      await upsertServerStep(db, step, taskId);
      appliedSteps++;
    }

    await setLastSyncAt(db, marker);
    return { tasks: result.tasks.length, steps: appliedSteps };
  },

  async getConflicts(): Promise<SyncConflict[]> {
    const db = await getDb();
    return getStoredConflicts(db);
  },

  async resolveConflictKeepLocal(conflictId: number): Promise<void> {
    const db = await getDb();
    await resolveLocalConflict(db, conflictId);
    await syncNow();
  },

  async resolveConflictKeepServer(conflictId: number): Promise<void> {
    const db = await getDb();
    await resolveServerConflict(db, conflictId);
  },

  async migrate(name: string, email: string, password: string): Promise<PushSummary> {
    const db = await getDb();
    const tasks = await getAllTasks(db);
    const steps = await getAllSteps(db);

    const taskByLocal = new Map<number, Task>();
    for (const task of tasks) taskByLocal.set(task.id, task);

    const result = await apiFetch<MigrateResponse>(ENDPOINTS.sync.migrate, {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        tasks: tasks.map((task): MigrateTask => ({
          ...(task.server_id ? { id: task.server_id } : {}),
          localId: task.id,
          name: task.name,
          dueDate: task.due_date,
          status: task.status,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completedAt: task.completed_at,
        })),
        steps: steps.map((step): MigrateStep => {
          const parent = taskByLocal.get(step.task_id);
          const taskServerId = parent?.server_id ?? null;
          return {
            localId: step.id,
            ...(taskServerId ? { taskId: taskServerId } : {}),
            taskLocalId: step.task_id,
            name: step.name,
            durationMin: step.duration_min,
            orderIndex: step.order_index,
            status: step.status,
            updatedAt: step.updated_at,
            completedAt: step.completed_at,
          };
        }),
      }),
    });

    await saveSession(result.token, result.user);
    await applyServerIds(db, 'tasks', result.taskMap);
    await applyServerIds(db, 'steps', result.stepMap);

    return { tasks: tasks.length, steps: steps.length };
  },
};
