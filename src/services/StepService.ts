import { Step, CreateStepInput, UpdateStepInput } from '../types';
import { getDb } from '../database/db';
import { nowIso } from '../database/sync';
import type { SqlParam } from '../database/migrations';
import { ApiError, apiFetch } from './api';
import { hasSession } from './session';
import { syncNow } from './SyncService';
import { getLocalDate } from '../utils/date';
import { reconcileTaskStatus } from './reconcileTaskStatus';

function toStep(row: Record<string, unknown>): Step {
  return {
    id: row.id as number,
    task_id: row.task_id as number,
    name: row.name as string,
    duration_min: (row.duration_min as number | null) ?? null,
    order_index: row.order_index as number,
    status: row.status as Step['status'],
    completed_at: (row.completed_at as string | null) ?? null,
    completed_date: (row.completed_date as string | null) ?? null,
    server_id: (row.server_id as string | null) ?? null,
    dirty: (row.dirty as number) ?? 0,
    updated_at: row.updated_at as string,
  };
}

function todayStr(): string {
  return getLocalDate();
}

async function syncTaskStatus(taskId: number): Promise<void> {
  const db = await getDb();
  const now = nowIso();
  const steps = await db.getAllAsync<{ status: string; completed_at: string | null }>(
    `SELECT status, completed_at FROM steps WHERE task_id = ?`,
    [taskId],
  );
  const result = reconcileTaskStatus(
    steps.map((s) => ({
      status: s.status as 'pending' | 'completed',
      completed_at: s.completed_at !== null ? s.completed_at : undefined,
    })),
  );
  const [current] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
    `SELECT status, completed_at FROM tasks WHERE id = ?`,
    [taskId],
  );
  if (!current ||
      current.status !== result.status ||
      (current.completed_at !== null && current.completed_at !== undefined &&
       current.completed_at !== result.completed_at)) {
    await db.runAsync(
      `UPDATE tasks SET status = ?, completed_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
      [result.status, result.completed_at, now, taskId],
    );
    void syncNow();
  }
}

export const StepService = {
  async add(input: CreateStepInput): Promise<Step> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ max: number | null }>(
      `SELECT MAX(order_index) AS max FROM steps WHERE task_id = ?`,
      [input.task_id],
    );
    const orderIndex = (rows[0]?.max ?? -1) + 1;
    const now = nowIso();
    const res = await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, dirty, updated_at)
       VALUES (?, ?, ?, ?, 'pending', NULL, 1, ?)`,
      [input.task_id, input.name, input.duration_min ?? null, orderIndex, now],
    );
    const id = res.lastInsertRowId;
    const [step] = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM steps WHERE id = ?`,
      [id],
    );
    await syncTaskStatus(input.task_id);
    void syncNow();
    return toStep(step);
  },

  async addMany(
    task_id: number,
    steps: Array<{ name: string; duration_min: number | null }>,
  ): Promise<Step[]> {
    if (steps.length === 0) return [];
    const db = await getDb();
    const rows = await db.getAllAsync<{ max: number | null }>(
      `SELECT MAX(order_index) AS max FROM steps WHERE task_id = ?`,
      [task_id],
    );
    let orderIndex = (rows[0]?.max ?? -1) + 1;
    const now = nowIso();
    const created: Step[] = [];
    for (const step of steps) {
      const res = await db.runAsync(
        `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, dirty, updated_at)
         VALUES (?, ?, ?, ?, 'pending', NULL, 1, ?)`,
        [task_id, step.name, step.duration_min ?? null, orderIndex, now],
      );
      const [row] = await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM steps WHERE id = ?`,
        [res.lastInsertRowId],
      );
      created.push(toStep(row));
      orderIndex += 1;
    }
    await syncTaskStatus(task_id);
    // Un solo sync para el lote (issue #157): pasos agregados a una tarea existente.
    void syncNow();
    return created;
  },

  async getByTask(task_id: number): Promise<Step[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM steps WHERE task_id = ? ORDER BY order_index ASC, id ASC`,
      [task_id],
    );
    return rows.map(toStep);
  },

  async getNextPending(task_id: number): Promise<Step | null> {
    const steps = await this.getByTask(task_id);
    return steps.find((step) => step.status === 'pending') ?? null;
  },

  async update(id: number, input: UpdateStepInput): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const params: SqlParam[] = [];
    if (input.name !== undefined) {
      sets.push('name = ?');
      params.push(input.name);
    }
    if (input.duration_min !== undefined) {
      sets.push('duration_min = ?');
      params.push(input.duration_min);
    }
    if (sets.length === 0) return;
    sets.push('dirty = 1', 'updated_at = ?');
    params.push(nowIso(), id);
    await db.runAsync(`UPDATE steps SET ${sets.join(', ')} WHERE id = ?`, params);
    void syncNow();
  },

  async deleteBatch(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDb();
    const taskIds = new Set<number>();
    const serverIds: string[] = [];
    await db.withTransactionAsync(async () => {
      for (const id of ids) {
        const rows = await db.getAllAsync<{ task_id: number; server_id: string | null }>(
          `SELECT task_id, server_id FROM steps WHERE id = ?`,
          [id],
        );
        const step = rows[0];
        if (!step) continue;
        taskIds.add(step.task_id);
        if (step.server_id) serverIds.push(step.server_id);
        await db.runAsync(`DELETE FROM steps WHERE id = ?`, [id]);
      }
      for (const taskId of taskIds) {
        const remaining = await db.getAllAsync<{ id: number }>(
          `SELECT id FROM steps WHERE task_id = ? ORDER BY order_index ASC, id ASC`,
          [taskId],
        );
        for (let i = 0; i < remaining.length; i++) {
          await db.runAsync(
            `UPDATE steps SET order_index = ?, dirty = 1, updated_at = ? WHERE id = ?`,
            [i, nowIso(), remaining[i].id],
          );
        }
        await syncTaskStatus(taskId);
      }
    });
    // REQUIERE MIGRACIÓN: los pasos borrados offline con server_id pueden reaparecer en el siguiente pull
    // (upsertServerStep inserta si no encuentra fila local por server_id).
    if (hasSession()) {
      for (const sid of serverIds) {
        try {
          await apiFetch(`/api/steps/${sid}`, { method: 'DELETE' });
        } catch {
          // offline: el servidor lo reconcilia en el próximo pull
        }
      }
    }
    void syncNow();
  },
  async delete(id: number): Promise<void> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ task_id: number; server_id: string | null }>(
      `SELECT task_id, server_id FROM steps WHERE id = ?`,
      [id],
    );
    const step = rows[0];
    if (!step) return;
    await db.runAsync(`DELETE FROM steps WHERE id = ?`, [id]);
    const remaining = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM steps WHERE task_id = ? ORDER BY order_index ASC, id ASC`,
      [step.task_id],
    );
    for (let i = 0; i < remaining.length; i++) {
      await db.runAsync(
        `UPDATE steps SET order_index = ?, dirty = 1, updated_at = ? WHERE id = ?`,
        [i, nowIso(), remaining[i].id],
      );
    }
    await syncTaskStatus(step.task_id);
    // REQUIERE MIGRACIÓN: un paso borrado offline con server_id puede reaparecer en el siguiente pull,
    // porque upsertServerStep busca por server_id y si no encuentra fila local, inserta una nueva.
    if (hasSession() && step.server_id) {
      try {
        await apiFetch(`/api/steps/${step.server_id}`, { method: 'DELETE' });
      } catch {
        // offline: el servidor lo reconcilia en el próximo pull
      }
    }
  },

  async getStepCounts(task_id: number): Promise<{ total: number; completed: number }> {
    const steps = await this.getByTask(task_id);
    return {
      total: steps.length,
      completed: steps.filter((step) => step.status === 'completed').length,
    };
  },

  async reorder(task_id: number, orderedIds: number[]): Promise<void> {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.runAsync(
          `UPDATE steps SET order_index = ?, dirty = 1, updated_at = ? WHERE id = ?`,
          [i, nowIso(), orderedIds[i]],
        );
      }
      await syncTaskStatus(task_id);
    });
    void syncNow();
  },

  async complete(id: number): Promise<{ nextStep: Step | null; taskCompleted: boolean }> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM steps WHERE id = ?`, [
      id,
    ]);
    const step = rows[0] ? toStep(rows[0]) : null;
    if (!step) throw new ApiError(404, 'STEP_NOT_FOUND');

    // Idempotente: si el paso ya está completado (p. ej. la UI quedó desactualizada),
    // reconciliar el estado real en vez de lanzar STEP_ALREADY_COMPLETED.
    if (step.status === 'completed') {
      const pending = await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM steps WHERE task_id = ? AND status = 'pending' ORDER BY order_index ASC, id ASC`,
        [step.task_id],
      );
      const nextStep = pending.length > 0 ? toStep(pending[0]) : null;
      const taskCompleted = !nextStep;
      void syncNow();
      return { nextStep, taskCompleted };
    }

    const now = nowIso();
    const localDate = todayStr();

    await db.runAsync(
      `UPDATE steps SET status = 'completed', completed_at = ?, completed_date = ?, dirty = 1, updated_at = ?
       WHERE id = ?`,
      [now, localDate, now, id],
    );

    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed) VALUES (?, 1)
       ON CONFLICT(date) DO UPDATE SET steps_completed = steps_completed + 1`,
      [localDate],
    );

    const pending = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM steps WHERE task_id = ? AND status = 'pending' ORDER BY order_index ASC, id ASC`,
      [step.task_id],
    );
    const nextStep = pending.length > 0 ? toStep(pending[0]) : null;
    const taskCompleted = !nextStep;

    await syncTaskStatus(step.task_id);
    void syncNow();
    return { nextStep, taskCompleted };
  },

  async uncomplete(id: number): Promise<{ nextStep: Step | null; taskCompleted: boolean }> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM steps WHERE id = ?`, [
      id,
    ]);
    const step = rows[0] ? toStep(rows[0]) : null;
    if (!step) throw new ApiError(404, 'STEP_NOT_FOUND');

    // Idempotente: si el paso ya está pendiente, no hace cambios.
    if (step.status === 'pending') {
      return this.reconcileState(step.task_id);
    }

    const now = nowIso();

    await db.runAsync(
      `UPDATE steps SET status = 'pending', completed_at = NULL, completed_date = NULL, dirty = 1, updated_at = ?
       WHERE id = ?`,
      [now, id],
    );

    // Si la tarea estaba completada, vuelve a activa.
    const [taskRow] = await db.getAllAsync<Record<string, unknown>>(
      `SELECT status FROM tasks WHERE id = ?`,
      [step.task_id],
    );
    if (taskRow?.status === 'completed') {
      await db.runAsync(
        `UPDATE tasks SET status = 'active', completed_at = NULL, dirty = 1, updated_at = ?
         WHERE id = ?`,
        [now, step.task_id],
      );
    }

    void syncNow();
    return this.reconcileState(step.task_id);
  },

  async reconcileAllTasks(): Promise<number> {
    const db = await getDb();
    const tasks = await db.getAllAsync<{ id: number }>(`SELECT id FROM tasks`, []);
    let corrected = 0;
    for (const t of tasks) {
      const before = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`,
        [t.id],
      );
      await syncTaskStatus(t.id);
      const after = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`,
        [t.id],
      );
      if (before[0]?.status !== after[0]?.status || before[0]?.completed_at !== after[0]?.completed_at) {
        corrected += 1;
        if (process.env.NODE_ENV !== 'production') {
              console.log(`[reconcileAllTasks] tarea ${t.id}: ${before[0]?.status}/${before[0]?.completed_at} → ${after[0]?.status}/${after[0]?.completed_at}`);
        }
      }
    }
    if (corrected > 0) {
      void syncNow();
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[reconcileAllTasks] ${corrected} tareas corregidas de ${tasks.length}`);
    }
    return corrected;
  },
  async reconcileState(taskId: number): Promise<{ nextStep: Step | null; taskCompleted: boolean }> {
    const db = await getDb();
    const pending = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM steps WHERE task_id = ? AND status = 'pending' ORDER BY order_index ASC, id ASC`,
      [taskId],
    );
    const nextStep = pending.length > 0 ? toStep(pending[0]) : null;
    await syncTaskStatus(taskId); // Lote 2: corrige tareas desincronizadas
    return { nextStep, taskCompleted: !nextStep };
  },
};
