import { getDb } from '../database/db';
import { ApiError } from './api';
import { syncNow } from './SyncService';
import { reconcileTaskStatus } from './reconcileTaskStatus';
import { nowIso } from '../database/sync';
import { getLocalDate } from '../utils/date';

// Servicio atómico para completar/reabrir una tarea en bloque.
// No toca StepService/TaskService: los usa por composición a nivel de SQL, con
// una sola transacción por operación para que un fallo a mitad no deje la tarea
// a medias.
export const TaskCompletionService = {
  async completeAll(taskId: number): Promise<{ completedCount: number }> {
    const db = await getDb();

    const taskRows = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM tasks WHERE id = ?`,
      [taskId],
    );
    if (taskRows.length === 0) {
      throw new ApiError(404, 'TASK_NOT_FOUND');
    }

    let completedCount = 0;

    await db.withTransactionAsync(async () => {
      const pending = await db.getAllAsync<{ id: number }>(
        `SELECT id FROM steps WHERE task_id = ? AND status = 'pending'`,
        [taskId],
      );

      if (pending.length === 0) {
        completedCount = 0;
        return;
      }

      completedCount = pending.length;
      const now = nowIso();
      const today = getLocalDate();

      for (const row of pending) {
        await db.runAsync(
          `UPDATE steps SET status = 'completed', completed_at = ?, completed_date = ?, dirty = 1, updated_at = ? WHERE id = ?`,
          [now, today, now, row.id],
        );
      }

      // Suma al progreso diario la cantidad real de pasos completados en bloque.
      await db.runAsync(
        `INSERT INTO daily_progress (date, steps_completed) VALUES (?, ?)
         ON CONFLICT(date) DO UPDATE SET steps_completed = steps_completed + ?`,
        [today, completedCount, completedCount],
      );

      const allSteps = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM steps WHERE task_id = ?`,
        [taskId],
      );
      const result = reconcileTaskStatus(
        allSteps.map((s) => ({
          status: s.status as 'pending' | 'completed',
          completed_at: s.completed_at,
        })),
      );

      const [current] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`,
        [taskId],
      );
      if (
        !current ||
        current.status !== result.status ||
        current.completed_at !== result.completed_at
      ) {
        await db.runAsync(
          `UPDATE tasks SET status = ?, completed_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
          [result.status, result.completed_at, now, taskId],
        );
      }
    });

    if (completedCount > 0) {
      void syncNow();
    }

    return { completedCount };
  },

  async reopenAll(taskId: number): Promise<{ reopenedCount: number }> {
    const db = await getDb();

    const taskRows = await db.getAllAsync<{ id: number }>(
      `SELECT id FROM tasks WHERE id = ?`,
      [taskId],
    );
    if (taskRows.length === 0) {
      throw new ApiError(404, 'TASK_NOT_FOUND');
    }

    let reopenedCount = 0;

    await db.withTransactionAsync(async () => {
      const completed = await db.getAllAsync<{ id: number }>(
        `SELECT id FROM steps WHERE task_id = ? AND status = 'completed'`,
        [taskId],
      );

      if (completed.length === 0) {
        reopenedCount = 0;
        return;
      }

      reopenedCount = completed.length;
      const now = nowIso();

      for (const row of completed) {
        await db.runAsync(
          `UPDATE steps SET status = 'pending', completed_at = NULL, completed_date = NULL, dirty = 1, updated_at = ? WHERE id = ?`,
          [now, row.id],
        );
      }

      const allSteps = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM steps WHERE task_id = ?`,
        [taskId],
      );
      const result = reconcileTaskStatus(
        allSteps.map((s) => ({
          status: s.status as 'pending' | 'completed',
          completed_at: s.completed_at,
        })),
      );

      const [current] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`,
        [taskId],
      );
      if (
        !current ||
        current.status !== result.status ||
        current.completed_at !== result.completed_at
      ) {
        await db.runAsync(
          `UPDATE tasks SET status = ?, completed_at = ?, dirty = 1, updated_at = ? WHERE id = ?`,
          [result.status, result.completed_at, now, taskId],
        );
      }
    });

    // REQUIERE MIGRACIÓN: uncomplete no resta de daily_progress; reabrir y volver a completar infla el contador.
    if (reopenedCount > 0) {
      void syncNow();
    }

    return { reopenedCount };
  },
};
