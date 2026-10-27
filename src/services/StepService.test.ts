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

  describe('addMany', () => {
    it('agrega pasos al final de la secuencia existente sin tocarla', async () => {
      const taskId = await insertTask();
      await insertStep(taskId, 'Uno', 0);
      await insertStep(taskId, 'Dos', 1);

      const created = await StepService.addMany(taskId, [
        { name: 'Tres', duration_min: 10 },
        { name: 'Cuatro', duration_min: null },
      ]);

      expect(created).toHaveLength(2);
      expect(created.map((s) => s.order_index)).toEqual([2, 3]);
      expect(created.map((s) => s.dirty)).toEqual([1, 1]);
      expect(created.every((s) => s.status === 'pending')).toBe(true);

      const all = await StepService.getByTask(taskId);
      expect(all.map((s) => s.name)).toEqual(['Uno', 'Dos', 'Tres', 'Cuatro']);
      expect(mocks.syncNow).toHaveBeenCalledTimes(1);
    });

    it('sin pasos existentes arranca desde order_index 0', async () => {
      const taskId = await insertTask();

      const created = await StepService.addMany(taskId, [{ name: 'Uno', duration_min: 5 }]);

      expect(created).toHaveLength(1);
      expect(created[0]).toMatchObject({ task_id: taskId, name: 'Uno', order_index: 0, dirty: 1 });
      expect(mocks.syncNow).toHaveBeenCalledTimes(1);
    });

    it('con lista vacía no inserta ni sincroniza', async () => {
      const taskId = await insertTask();

      const created = await StepService.addMany(taskId, []);

      expect(created).toEqual([]);
      expect(mocks.syncNow).not.toHaveBeenCalled();
    });
  });

  it('reconcileTaskStatus: delete [completed, pending] borrando pendiente → completed', async () => {
    const taskId = await insertTask();
    const done = await insertStep(taskId, 'Hecho', 0);
    await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', done]);
    const pend = await insertStep(taskId, 'Pendiente', 1);

    await StepService.delete(pend);

    const [task] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(task.status).toBe('completed');
    expect(task.completed_at).toBe('2026-10-20T10:00:00Z');
  });

  it('reconcileTaskStatus: delete único paso borrado → active, NULL', async () => {
    const taskId = await insertTask();
    const s = await insertStep(taskId, 'Solo', 0);

    await StepService.delete(s);

    const [task] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(task.status).toBe('active');
    expect(task.completed_at).toBeNull();
  });

  it('reconcileTaskStatus: add a tarea completed → vuelve a active', async () => {
    const taskId = await insertTask();
    const s = await insertStep(taskId, 'Solo', 0);
    await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`,
      ['2026-10-20T10:00:00Z', s]);
    await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?`,
      ['2026-10-20T10:00:00Z', taskId]);

    await StepService.add({ task_id: taskId, name: 'Nuevo paso', duration_min: 5 });

    const [task] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(task.status).toBe('active');
    expect(task.completed_at).toBeNull();
  });

  it('reconcileTaskStatus: complete último paso → completed; uncomplete → active NULL', async () => {
    const taskId = await insertTask();
    const s = await insertStep(taskId, 'Solo', 0);
    await StepService.complete(s);
    const [t1] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(t1.status).toBe('completed');
    expect(t1.completed_at).not.toBeNull();

    await StepService.uncomplete(s);
    const [t2] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(t2.status).toBe('active');
    expect(t2.completed_at).toBeNull();
  });

  it('reconcileTaskStatus: idempotencia syncTaskStatus no cambia updated_at segunda vez', async () => {
    const taskId = await insertTask();
    const s = await insertStep(taskId, 'Uno', 0);
    await StepService.complete(s);
    const [t1] = await db.getAllAsync<{ updated_at: string }>(
      `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
    );
    // Llamar syncTaskStatus de nuevo (simulado por complete de nuevo sin cambio de paso)
    await db.runAsync(`UPDATE steps SET completed_at = ? WHERE id = ?`, [t1.updated_at, s]);
    await StepService.complete(s); // idempotente, paso ya completo
    const [t2] = await db.getAllAsync<{ updated_at: string }>(
      `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(t2.updated_at).toBe(t1.updated_at);
  });

  it('reconcileTaskStatus: idempotencia syncTaskStatus no cambia updated_at segunda vez', async () => {
    const taskId = await insertTask();
    const s = await insertStep(taskId, 'Uno', 0);
    await StepService.complete(s);
    const [t1] = await db.getAllAsync<{ updated_at: string }>(
      `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
    );
    // Llamar syncTaskStatus de nuevo (simulado por complete de nuevo sin cambio de paso)
    await db.runAsync(`UPDATE steps SET completed_at = ? WHERE id = ?`, [t1.updated_at, s]);
    await StepService.complete(s); // idempotente, paso ya completo
    const [t2] = await db.getAllAsync<{ updated_at: string }>(
      `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(t2.updated_at).toBe(t1.updated_at);
  });

  describe('reconcileState con datos desincronizados (Lote 2)', () => {
    it('tarea completed con pasos pending → corrige a active/NULL', async () => {
      const taskId = await insertTask();
      const s = await insertStep(taskId, 'Solo', 0);
      await db.runAsync(`UPDATE steps SET status = 'pending', completed_at = NULL WHERE id = ?`, [s]);
      await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', taskId]);

      await StepService.reconcileState(taskId);

      const [t] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
      );
      expect(t.status).toBe('active');
      expect(t.completed_at).toBeNull();
    });

    it('tarea active con todos pasos completed → corrige a completed/max', async () => {
      const taskId = await insertTask();
      const s = await insertStep(taskId, 'Solo', 0);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T12:00:00Z', s]);
      await db.runAsync(`UPDATE tasks SET status = 'active', completed_at = NULL WHERE id = ?`, [taskId]);

      await StepService.reconcileState(taskId);

      const [t] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
      );
      expect(t.status).toBe('completed');
      expect(t.completed_at).toBe('2026-10-20T12:00:00Z');
    });

    it('tarea completed sin pasos → active/NULL', async () => {
      const taskId = await insertTask();
      await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?`,
        ['2026-10-20T10:00:00Z', taskId]);

      await StepService.reconcileState(taskId);

      const [t] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
        `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
      );
      expect(t.status).toBe('active');
      expect(t.completed_at).toBeNull();
    });

    it('idempotente: reconcileState dos veces no cambia updated_at', async () => {
      const taskId = await insertTask();
      const s = await insertStep(taskId, 'Solo', 0);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', s]);

      await StepService.reconcileState(taskId);
      const [t1] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
      );

      await StepService.reconcileState(taskId);
      const [t2] = await db.getAllAsync<{ updated_at: string }>(
        `SELECT updated_at FROM tasks WHERE id = ?`, [taskId],
      );
      expect(t2.updated_at).toBe(t1.updated_at);
    });
  });

  it('reorder: orden resultante y completados anclados', async () => {
    const taskId = await insertTask();
    const a = await insertStep(taskId, 'A', 0);
    const b = await insertStep(taskId, 'B', 1);
    const c = await insertStep(taskId, 'C', 2);
    await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', b]);

    await StepService.reorder(taskId, [c, a, b]);

    const steps = await db.getAllAsync<{ id: number; order_index: number; status: string }>(
      `SELECT id, order_index, status FROM steps ORDER BY order_index ASC`,
      [],
    );
    expect(steps.map((s) => s.id)).toEqual([c, a, b]);
    expect(steps.map((s) => s.order_index)).toEqual([0, 1, 2]);
    // completado (b) queda en su posición
    expect(steps.find((s) => s.id === b)?.status).toBe('completed');
  });

  it('reorder: lista vacía no cambia nada', async () => {
    const taskId = await insertTask();
    const a = await insertStep(taskId, 'A', 0);

    await StepService.reorder(taskId, []);

    const steps = await db.getAllAsync<{ id: number; order_index: number }>(
      `SELECT id, order_index FROM steps`,
      [],
    );
    expect(steps).toEqual([{ id: a, order_index: 0 }]);
  });

  it('deleteBatch: 2 pasos de una tarea → restantes reordenados + estado recalculado', async () => {
    const taskId = await insertTask();
    const s1 = await insertStep(taskId, 'Uno', 0);
    const s2 = await insertStep(taskId, 'Dos', 1);
    const s3 = await insertStep(taskId, 'Tres', 2);
    await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', s1]);

    await StepService.deleteBatch([s2, s3]);

    const remaining = await db.getAllAsync<{ id: number; order_index: number }>(
      `SELECT id, order_index FROM steps ORDER BY order_index ASC`,
      [],
    );
    expect(remaining).toEqual([{ id: s1, order_index: 0 }]);

    const [task] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [taskId],
    );
    expect(task.status).toBe('completed');
    expect(task.completed_at).toBe('2026-10-20T10:00:00Z');
  });

  it('deleteBatch: ids de varias tareas → recalcula cada tarea', async () => {
    const t1 = await insertTask();
    const t2 = await insertTask();
    const s1 = await insertStep(t1, 'A', 0);
    const s2 = await insertStep(t2, 'B', 0);
    await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', s1]);

    await StepService.deleteBatch([s1, s2]);

    const [task1] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [t1],
    );
    const [task2] = await db.getAllAsync<{ status: string; completed_at: string | null }>(
      `SELECT status, completed_at FROM tasks WHERE id = ?`, [t2],
    );
    expect(task1.status).toBe('active');
    expect(task1.completed_at).toBeNull();
    expect(task2.status).toBe('active');
    expect(task2.completed_at).toBeNull();
  });

  it('deleteBatch: lista vacía no hace nada', async () => {
    await StepService.deleteBatch([]);
    expect(mocks.syncNow).not.toHaveBeenCalled();
  });

  it('withTransactionAsync mock: ROLLBACK cuando el callback lanza', async () => {
    const { db: testDb } = await makeSqlJsDb();
    await testDb.execAsync('CREATE TABLE t (v INTEGER)');
    await testDb.runAsync('INSERT INTO t (v) VALUES (?)', [1]);

    await expect(
      testDb.withTransactionAsync!(async () => {
        await testDb.runAsync('INSERT INTO t (v) VALUES (?)', [2]);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    const rows = await testDb.getAllAsync<{ v: number }>('SELECT v FROM t', []);
    expect(rows).toEqual([{ v: 1 }]); // rollback: no se insertó el 2
  });

  describe('reconcileAllTasks', () => {
    it('corrige tareas desincronizadas y cuenta', async () => {
      const t1 = await insertTask();
      const s1 = await insertStep(t1, 'A', 0);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', s1]);
      await db.runAsync(`UPDATE tasks SET status = 'active', completed_at = NULL WHERE id = ?`, [t1]);

      const t2 = await insertTask();
      await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', t2]);

      const corrected = await StepService.reconcileAllTasks();
      expect(corrected).toBe(2);

      const [task1] = await db.getAllAsync<{ status: string }>(`SELECT status FROM tasks WHERE id = ?`, [t1]);
      const [task2] = await db.getAllAsync<{ status: string }>(`SELECT status FROM tasks WHERE id = ?`, [t2]);
      expect(task1.status).toBe('completed');
      expect(task2.status).toBe('active');
    });

    it('idempotencia: segunda llamada no cambia updated_at', async () => {
      const t1 = await insertTask();
      const s1 = await insertStep(t1, 'A', 0);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, ['2026-10-20T10:00:00Z', s1]);
      await db.runAsync(`UPDATE tasks SET status = 'active', completed_at = NULL WHERE id = ?`, [t1]);

      await StepService.reconcileAllTasks();
      const [t1a] = await db.getAllAsync<{ updated_at: string }>(`SELECT updated_at FROM tasks WHERE id = ?`, [t1]);

      await StepService.reconcileAllTasks();
      const [t1b] = await db.getAllAsync<{ updated_at: string }>(`SELECT updated_at FROM tasks WHERE id = ?`, [t1]);

      expect(t1b.updated_at).toBe(t1a.updated_at);
    });

    it('tarea active sin pasos no cambia', async () => {
      const t1 = await insertTask();
      const [before] = await db.getAllAsync<{ status: string; completed_at: string | null; updated_at: string }>(
        `SELECT status, completed_at, updated_at FROM tasks WHERE id = ?`, [t1],
      );

      const corrected = await StepService.reconcileAllTasks();
      expect(corrected).toBe(0);

      const [after] = await db.getAllAsync<{ status: string; completed_at: string | null; updated_at: string }>(
        `SELECT status, completed_at, updated_at FROM tasks WHERE id = ?`, [t1],
      );
      expect(after.status).toBe(before.status);
      expect(after.completed_at).toBe(before.completed_at);
      expect(after.updated_at).toBe(before.updated_at);
    });

    it('syncNow no se llama si no hubo correcciones', async () => {
      mocks.syncNow.mockReset();
      await StepService.reconcileAllTasks();
      expect(mocks.syncNow).not.toHaveBeenCalled();
    });
  });

  it('reorder: si un UPDATE falla a mitad, rollback deja el orden intacto', async () => {
    const taskId = await insertTask();
    const a = await insertStep(taskId, 'A', 0);
    const b = await insertStep(taskId, 'B', 1);

    const origRunAsync = db.runAsync.bind(db);
    let callCount = 0;
    db.runAsync = async (sql: string, params: SqlParam[] = []) => {
      callCount++;
      if (callCount === 2) throw new Error('boom');
      return origRunAsync(sql, params);
    };

    await expect(StepService.reorder(taskId, [b, a])).rejects.toThrow('boom');

    db.runAsync = origRunAsync;

    const steps = await db.getAllAsync<{ id: number; order_index: number }>(
      `SELECT id, order_index FROM steps ORDER BY id ASC`, [],
    );
    expect(steps).toEqual([
      { id: a, order_index: 0 },
      { id: b, order_index: 1 },
    ]);
  });

  it('deleteBatch: tras éxito, apiFetch se llama con los server_id correctos', async () => {
    const taskId = await insertTask();
    const s1 = await insertStep(taskId, 'Uno', 0);
    const s2 = await insertStep(taskId, 'Dos', 1);
    await db.runAsync(`UPDATE steps SET server_id = 'uuid-1' WHERE id = ?`, [s1]);
    await db.runAsync(`UPDATE steps SET server_id = 'uuid-2' WHERE id = ?`, [s2]);
    mocks.hasSession.mockReturnValue(true);
    mocks.apiFetch.mockResolvedValue(undefined);

    await StepService.deleteBatch([s1, s2]);

    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/steps/uuid-1', expect.objectContaining({ method: 'DELETE' }));
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/steps/uuid-2', expect.objectContaining({ method: 'DELETE' }));
  });

  it('deleteBatch: si la transacción lanza, no se llama a apiFetch', async () => {
    const taskId = await insertTask();
    const s1 = await insertStep(taskId, 'Uno', 0);
    await db.runAsync(`UPDATE steps SET server_id = 'uuid-1' WHERE id = ?`, [s1]);
    mocks.hasSession.mockReturnValue(true);
    mocks.apiFetch.mockReset();

    const origWithTx = db.withTransactionAsync!.bind(db);
    db.withTransactionAsync = async () => { throw new Error('tx boom'); };

    await expect(StepService.deleteBatch([s1])).rejects.toThrow('tx boom');
    expect(mocks.apiFetch).not.toHaveBeenCalled();

    db.withTransactionAsync = origWithTx;
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

    it('es idempotente: completar un paso ya completado no lanza error y reconcilia', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);
      const other = await insertStep(taskId, 'Pendiente', 1);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, [
        '2026-08-01T00:00:00.000Z',
        stepId,
      ]);

      const result = await StepService.complete(stepId);

      expect(result.taskCompleted).toBe(false);
      expect(result.nextStep).toMatchObject({ id: other, name: 'Pendiente' });
      expect(mocks.syncNow).toHaveBeenCalled();
    });

    it('idempotente sin pasos pendientes devuelve taskCompleted=true', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);
      await db.runAsync(`UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`, [
        '2026-08-01T00:00:00.000Z',
        stepId,
      ]);

      const result = await StepService.complete(stepId);

      expect(result).toEqual({ nextStep: null, taskCompleted: true });
    });

    it('lanza error si el paso no existe', async () => {
      await expect(StepService.complete(999)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('uncomplete', () => {
    it('desmarca un paso completado a pending y lo marca dirty', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);
      await StepService.complete(stepId);

      const result = await StepService.uncomplete(stepId);

      const [step] = await db.getAllAsync<{
        status: string;
        completed_at: string | null;
        dirty: number;
      }>(`SELECT status, completed_at, dirty FROM steps WHERE id = ?`, [stepId]);
      const [task] = await db.getAllAsync<{ status: string; dirty: number }>(
        `SELECT status, dirty FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(result.taskCompleted).toBe(false);
      expect(result.nextStep).toMatchObject({ id: stepId });
      expect(step.status).toBe('pending');
      expect(step.completed_at).toBeNull();
      expect(step.dirty).toBe(1);
      expect(task.status).toBe('active');
      expect(task.dirty).toBe(1);
      expect(mocks.syncNow).toHaveBeenCalled();
    });

    it('si la tarea estaba completada, la vuelve a activa', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);
      await StepService.complete(stepId); // completa el último paso → tarea completed

      const [taskBefore] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(taskBefore.status).toBe('completed');

      await StepService.uncomplete(stepId);

      const [taskAfter] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM tasks WHERE id = ?`,
        [taskId],
      );
      expect(taskAfter.status).toBe('active');
    });

    it('no hace cambios si el paso ya está pending (idempotente)', async () => {
      const taskId = await insertTask();
      const stepId = await insertStep(taskId);

      const result = await StepService.uncomplete(stepId);

      expect(result.taskCompleted).toBe(false);
      expect(result.nextStep).toMatchObject({ id: stepId });
      const [step] = await db.getAllAsync<{ status: string }>(
        `SELECT status FROM steps WHERE id = ?`,
        [stepId],
      );
      expect(step.status).toBe('pending');
    });

    it('lanza error si el paso no existe', async () => {
      await expect(StepService.uncomplete(999)).rejects.toBeInstanceOf(ApiError);
    });
  });
});
