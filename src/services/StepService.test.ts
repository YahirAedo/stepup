import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';

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

import { StepService } from './StepService';
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

async function insertStep(taskId: number, name = 'Paso', order = 0): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO steps (task_id, name, order_index, status, dirty, updated_at)
       VALUES (?, ?, ?, 'pending', 0, '2026-08-01T00:00:00.000Z')`,
    [taskId, name, order],
  );
  return res.lastInsertRowId;
}

describe('StepService', () => {
  it('add inserta local con order_index siguiente y dirty=1', async () => {
    const taskId = await insertTask();
    await insertStep(taskId, 'Uno', 0);

    const step = await StepService.add({ task_id: taskId, name: 'Dos', duration_min: 15 });

    expect(step).toMatchObject({ task_id: taskId, name: 'Dos', order_index: 1, dirty: 1 });
    expect(step.status).toBe('pending');
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  it('getByTask ordena por order_index', async () => {
    const taskId = await insertTask();
    await insertStep(taskId, 'B', 1);
    await insertStep(taskId, 'A', 0);

    const steps = await StepService.getByTask(taskId);
    expect(steps.map((s) => s.name)).toEqual(['A', 'B']);
  });

  it('getNextPending devuelve el primero pendiente', async () => {
    const taskId = await insertTask();
    const done = await insertStep(taskId, 'Hecho', 0);
    await db.runAsync(`UPDATE steps SET status = 'completed' WHERE id = ?`, [done]);
    const pending = await insertStep(taskId, 'Pendiente', 1);

    await expect(StepService.getNextPending(taskId)).resolves.toMatchObject({ id: pending });
  });

  it('update marca dirty', async () => {
    const taskId = await insertTask();
    const stepId = await insertStep(taskId);

    await StepService.update(stepId, { name: 'Editado', duration_min: 20 });

    const [row] = await db.getAllAsync<{ name: string; duration_min: number; dirty: number }>(
      `SELECT name, duration_min, dirty FROM steps WHERE id = ?`,
      [stepId],
    );
    expect(row).toEqual({ name: 'Editado', duration_min: 20, dirty: 1 });
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  it('delete borra el paso y reordena los restantes', async () => {
    const taskId = await insertTask();
    await insertStep(taskId, 'Uno', 0);
    const dos = await insertStep(taskId, 'Dos', 1);
    await insertStep(taskId, 'Tres', 2);

    await StepService.delete(dos);

    const remaining = await db.getAllAsync<{ name: string; order_index: number }>(
      `SELECT name, order_index FROM steps ORDER BY order_index ASC`,
      [],
    );
    expect(remaining).toEqual([
      { name: 'Uno', order_index: 0 },
      { name: 'Tres', order_index: 1 },
    ]);
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('delete avisa al servidor cuando hay sesión y server_id', async () => {
    const taskId = await insertTask();
    const stepId = await insertStep(taskId);
    await db.runAsync(`UPDATE steps SET server_id = 'uuid-step' WHERE id = ?`, [stepId]);
    mocks.hasSession.mockReturnValue(true);
    mocks.apiFetch.mockResolvedValue(undefined);

    await StepService.delete(stepId);

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      '/api/steps/uuid-step',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('getStepCounts cuenta totales y completados', async () => {
    const taskId = await insertTask();
    const done = await insertStep(taskId, 'Hecho', 0);
    await db.runAsync(`UPDATE steps SET status = 'completed' WHERE id = ?`, [done]);
    await insertStep(taskId, 'Pendiente', 1);

    await expect(StepService.getStepCounts(taskId)).resolves.toEqual({ total: 2, completed: 1 });
  });

  it('reorder actualiza order_index y marca dirty', async () => {
    const taskId = await insertTask();
    const a = await insertStep(taskId, 'A', 0);
    const b = await insertStep(taskId, 'B', 1);

    await StepService.reorder(taskId, [b, a]);

    const steps = await db.getAllAsync<{ id: number; order_index: number; dirty: number }>(
      `SELECT id, order_index, dirty FROM steps ORDER BY order_index ASC`,
      [],
    );
    expect(steps).toEqual([
      { id: b, order_index: 0, dirty: 1 },
      { id: a, order_index: 1, dirty: 1 },
    ]);
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  describe('complete', () => {
    it('completa el paso e incrementa daily_progress', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);

      const result = await StepService.complete(stepId);

      const [step] = await db.getAllAsync<{ status: string; dirty: number }>(
        `SELECT status, dirty FROM steps WHERE id = ?`,
        [stepId],
      );
      const [prog] = await db.getAllAsync<{ steps_completed: number }>(
        `SELECT steps_completed FROM daily_progress`,
        [],
      );
      expect(result).toEqual({ nextStep: null, taskCompleted: true });
      expect(step.status).toBe('completed');
      expect(step.dirty).toBe(1);
      expect(prog.steps_completed).toBe(1);
      expect(mocks.syncNow).toHaveBeenCalled();
    });

    it('completa la tarea cuando no quedan pasos pendientes', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);

      await StepService.complete(stepId);

      const [task] = await db.getAllAsync<{ status: string; dirty: number }>(
        `SELECT status, dirty FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task).toEqual({ status: 'completed', dirty: 1 });
    });

    it('no completa la tarea si quedan pasos pendientes', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId, 'Uno', 0);
      await insertStep(taskId, 'Dos', 1);

      const result = await StepService.complete(stepId);

      expect(result.nextStep).toMatchObject({ name: 'Dos' });
      expect(result.taskCompleted).toBe(false);
      const [task] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(task.status).toBe('active');
    });

    it('lanza error si el paso ya está completado', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);
      await db.runAsync(
        `UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`,
        ['2026-08-01T00:00:00.000Z', stepId],
      );

      await expect(StepService.complete(stepId)).rejects.toBeInstanceOf(ApiError);
    });

    it('lanza error si el paso no existe', async () => {
      await expect(StepService.complete(999)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
