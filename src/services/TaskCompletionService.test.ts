import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import type { SqlParam } from '../database/migrations';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  apiFetch: vi.fn(),
  hasSession: vi.fn(() => false),
  syncNow: vi.fn(),
}));

vi.mock('../database/db', () => ({ getDb: mocks.getDb }));

vi.mock('./api', () => ({
  apiFetch: mocks.apiFetch,
  ApiError: class extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

vi.mock('./session', () => ({ hasSession: mocks.hasSession }));

vi.mock('./SyncService', () => ({ syncNow: mocks.syncNow }));

import { TaskCompletionService } from './TaskCompletionService';
import { ApiError } from './api';

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
  mocks.apiFetch.mockReset();
  mocks.hasSession.mockReturnValue(false);
  mocks.syncNow.mockReset();
});

async function insertTask(): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO tasks (name, status, created_at, dirty, updated_at)
       VALUES ('Tarea', 'active', '2026-08-01T00:00:00.000Z', 0, '2026-08-01T00:00:00.000Z')`,
    [],
  );
  return res.lastInsertRowId;
}

async function insertStep(taskId: number, name = 'Paso', order = 0, status: 'pending' | 'completed' = 'pending'): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO steps (task_id, name, order_index, status, dirty, updated_at)
       VALUES (?, ?, ?, ?, 0, '2026-08-01T00:00:00.000Z')`,
    [taskId, name, order, status],
  );
  return res.lastInsertRowId;
}

describe('TaskCompletionService', () => {
  describe('completeAll', () => {
    it('3 pendientes → los 3 completed, tarea completed, daily_progress = 3', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0);
      await insertStep(taskId, 'B', 1);
      await insertStep(taskId, 'C', 2);

      const result = await TaskCompletionService.completeAll(taskId);

      expect(result).toEqual({ completedCount: 3 });

      const steps = await db.getAllAsync<{ status: string; completed_at: string | null; completed_date: string | null; dirty: number }>(
        `SELECT status, completed_at, completed_date, dirty FROM steps WHERE task_id = ?`,
        [taskId],
      );
      expect(steps.every((s) => s.status === 'completed')).toBe(true);
      expect(steps.every((s) => s.completed_at !== null)).toBe(true);
      expect(steps.every((s) => s.completed_date !== null)).toBe(true);
      expect(steps.every((s) => s.dirty === 1)).toBe(true);

      const [task] = await db.getAllAsync<{ status: string; completed_at: string | null; dirty: number }>(
        `SELECT status, completed_at, dirty FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task.status).toBe('completed');
      expect(task.completed_at).not.toBeNull();
      expect(task.dirty).toBe(1);

      const [prog] = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(prog.steps_completed).toBe(3);

      expect(mocks.syncNow).toHaveBeenCalledTimes(1);
    });

    it('mezcla (2 completed + 2 pending): completedCount 2, daily_progress suma 2 (5 → 7)', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0, 'completed');
      await insertStep(taskId, 'B', 1, 'completed');
      await insertStep(taskId, 'C', 2, 'pending');
      await insertStep(taskId, 'D', 3, 'pending');

      // daily_progress previo = 5 (misma fecha local que completeAll)
      const { getLocalDate } = await import('../utils/date');
      await db.runAsync(`INSERT INTO daily_progress (date, steps_completed) VALUES (?, 5)`, [getLocalDate()]);

      // completar completed_at de los completados para reconcile
      await db.runAsync(`UPDATE steps SET completed_at = '2026-08-01T00:00:00.000Z' WHERE status = 'completed'`, []);

      const result = await TaskCompletionService.completeAll(taskId);
      expect(result).toEqual({ completedCount: 2 });

      const [prog] = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(prog.steps_completed).toBe(7);
    });

    it('sin pendientes → {0}, no cambia daily_progress ni updated_at de la tarea, no syncNow', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0, 'completed');
      await db.runAsync(`UPDATE steps SET completed_at = '2026-08-01T00:00:00.000Z' WHERE id = 1`, []);

      const [before] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`,
        [taskId],
      );

      const result = await TaskCompletionService.completeAll(taskId);
      expect(result).toEqual({ completedCount: 0 });

      const [after] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(after.updated_at).toBe(before.updated_at);

      const prog = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(prog).toEqual([]);

      expect(mocks.syncNow).not.toHaveBeenCalled();
    });

    it('sin pasos → {0}, no syncNow', async () => {
      const taskId = await insertTask();

      const result = await TaskCompletionService.completeAll(taskId);
      expect(result).toEqual({ completedCount: 0 });
      expect(mocks.syncNow).not.toHaveBeenCalled();
    });

    it('tarea inexistente → ApiError 404 TASK_NOT_FOUND', async () => {
      await expect(TaskCompletionService.completeAll(999)).rejects.toBeInstanceOf(ApiError);
      try {
        await TaskCompletionService.completeAll(999);
      } catch (e) {
        expect((e as ApiError).status).toBe(404);
        expect((e as ApiError).message).toBe('TASK_NOT_FOUND');
      }
    });

    it('atomicidad: fallo a mitad → ROLLBACK (pasos pending, tarea active, daily_progress intacto)', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0);
      await insertStep(taskId, 'B', 1);

      const origRunAsync = db.runAsync.bind(db);
      let callCount = 0;
      db.runAsync = async (sql: string, params: SqlParam[] = []) => {
        callCount++;
        if (callCount === 2) throw new Error('boom');
        return origRunAsync(sql, params);
      };

      await expect(TaskCompletionService.completeAll(taskId)).rejects.toThrow('boom');

      db.runAsync = origRunAsync;

      const steps = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM steps WHERE task_id = ?`,
        [taskId],
      );
      expect(steps.every((s) => s.status === 'pending')).toBe(true);

      const [task] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task.status).toBe('active');

      const prog = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(prog).toEqual([]);
    });
  });

  describe('reopenAll', () => {
    it('tarea completada con 3 pasos → los 3 pending, tarea active, daily_progress sin cambios, dirty=1', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0, 'completed');
      await insertStep(taskId, 'B', 1, 'completed');
      await insertStep(taskId, 'C', 2, 'completed');
      await db.runAsync(`UPDATE steps SET completed_at = '2026-08-01T00:00:00.000Z', completed_date = '2026-08-01' WHERE task_id = ?`, [taskId]);
      await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = '2026-08-01T00:00:00.000Z', dirty = 1 WHERE id = ?`, [taskId]);

      // daily_progress previo (misma fecha local)
      const { getLocalDate } = await import('../utils/date');
      await db.runAsync(`INSERT INTO daily_progress (date, steps_completed) VALUES (?, 4)`, [getLocalDate()]);

      const result = await TaskCompletionService.reopenAll(taskId);
      expect(result).toEqual({ reopenedCount: 3 });

      const steps = await db.getAllAsync<{ status: string; completed_at: string | null; completed_date: string | null; dirty: number }>(
        `SELECT status, completed_at, completed_date, dirty FROM steps WHERE task_id = ?`,
        [taskId],
      );
      expect(steps.every((s) => s.status === 'pending')).toBe(true);
      expect(steps.every((s) => s.completed_at === null)).toBe(true);
      expect(steps.every((s) => s.completed_date === null)).toBe(true);
      expect(steps.every((s) => s.dirty === 1)).toBe(true);

      const [task] = await db.getAllAsync<{ status: string; completed_at: string | null; dirty: number }>(
        `SELECT status, completed_at, dirty FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task.status).toBe('active');
      expect(task.completed_at).toBeNull();
      expect(task.dirty).toBe(1);

      const [prog] = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(prog.steps_completed).toBe(4);

      expect(mocks.syncNow).toHaveBeenCalledTimes(1);
    });

    it('sin completados → {0}, sin escrituras, no syncNow', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0, 'pending');

      const [before] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`,
        [taskId],
      );

      const result = await TaskCompletionService.reopenAll(taskId);
      expect(result).toEqual({ reopenedCount: 0 });

      const [after] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(after.updated_at).toBe(before.updated_at);

      expect(mocks.syncNow).not.toHaveBeenCalled();
    });

    it('tarea inexistente → ApiError 404 TASK_NOT_FOUND', async () => {
      await expect(TaskCompletionService.reopenAll(999)).rejects.toBeInstanceOf(ApiError);
      try {
        await TaskCompletionService.reopenAll(999);
      } catch (e) {
        expect((e as ApiError).status).toBe(404);
        expect((e as ApiError).message).toBe('TASK_NOT_FOUND');
      }
    });

    it('atomicidad: fallo a mitad → ROLLBACK (pasos completed, tarea completed)', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'A', 0, 'completed');
      await insertStep(taskId, 'B', 1, 'completed');
      await db.runAsync(`UPDATE steps SET completed_at = '2026-08-01T00:00:00.000Z' WHERE task_id = ?`, [taskId]);
      await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = '2026-08-01T00:00:00.000Z', dirty = 1 WHERE id = ?`, [taskId]);

      const origRunAsync = db.runAsync.bind(db);
      let callCount = 0;
      db.runAsync = async (sql: string, params: SqlParam[] = []) => {
        callCount++;
        if (callCount === 1) throw new Error('boom');
        return origRunAsync(sql, params);
      };

      await expect(TaskCompletionService.reopenAll(taskId)).rejects.toThrow('boom');

      db.runAsync = origRunAsync;

      const steps = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM steps WHERE task_id = ?`,
        [taskId],
      );
      expect(steps.every((s) => s.status === 'completed')).toBe(true);

      const [task] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task.status).toBe('completed');
    });
  });
});
