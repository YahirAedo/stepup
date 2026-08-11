import { describe, expect, it } from 'vitest';
import { runMigrations } from './migrations';
import { makeSqlJsDb } from './testDb';
import {
  applyServerIds,
  clearDirty,
  getDirtySteps,
  getDirtyTasks,
  getLastSyncAt,
  markDirty,
  setLastSyncAt,
} from './sync';

describe('sync — capa de datos local', () => {
  async function setup() {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);

    const task = await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, updated_at)
         VALUES (?, NULL, 'active', ?, NULL, ?)`,
      ['Tarea A', '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
    );
    const step = await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, updated_at)
         VALUES (?, 'Paso 1', 30, 0, 'pending', NULL, ?)`,
      [task.lastInsertRowId, '2026-08-01T00:00:00.000Z'],
    );
    return { db, taskId: task.lastInsertRowId, stepId: step.lastInsertRowId };
  }

  it('markDirty marca dirty=1 y renueva updated_at', async () => {
    const { db, taskId } = await setup();

    await markDirty(db, 'tasks', taskId);

    const [row] = await db.getAllAsync<{ dirty: number; updated_at: string }>(
      `SELECT dirty, updated_at FROM tasks WHERE id = ?`,
      [taskId],
    );
    expect(row.dirty).toBe(1);
    expect(row.updated_at).not.toBe('2026-08-01T00:00:00.000Z');
  });

  it('getDirtyTasks/getDirtySteps devuelven solo registros con dirty=1', async () => {
    const { db, taskId, stepId } = await setup();
    await markDirty(db, 'tasks', taskId);
    await markDirty(db, 'steps', stepId);

    const dirtyTasks = await getDirtyTasks(db);
    const dirtySteps = await getDirtySteps(db);

    expect(dirtyTasks).toHaveLength(1);
    expect(dirtyTasks[0]).toMatchObject({ id: taskId, dirty: 1 });
    expect(dirtySteps).toHaveLength(1);
    expect(dirtySteps[0]).toMatchObject({ id: stepId, dirty: 1 });
  });

  it('applyServerIds guarda el UUID del servidor y limpia dirty', async () => {
    const { db, taskId, stepId } = await setup();
    await markDirty(db, 'tasks', taskId);
    await markDirty(db, 'steps', stepId);

    await applyServerIds(db, 'tasks', { [String(taskId)]: 'uuid-task' });
    await applyServerIds(db, 'steps', { [String(stepId)]: 'uuid-step' });

    const [task] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM tasks WHERE id = ?`,
      [taskId],
    );
    const [step] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM steps WHERE id = ?`,
      [stepId],
    );
    expect(task.server_id).toBe('uuid-task');
    expect(task.dirty).toBe(0);
    expect(step.server_id).toBe('uuid-step');
    expect(step.dirty).toBe(0);
  });

  it('clearDirty limpia dirty sin tocar server_id', async () => {
    const { db, taskId } = await setup();
    await applyServerIds(db, 'tasks', { [String(taskId)]: 'uuid-task' });
    await markDirty(db, 'tasks', taskId);
    await clearDirty(db, 'tasks', taskId);

    const [row] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM tasks WHERE id = ?`,
      [taskId],
    );
    expect(row.dirty).toBe(0);
    expect(row.server_id).toBe('uuid-task');
  });

  it('get/setLastSyncAt usan la fila singleton de sync_meta', async () => {
    const { db } = await setup();

    expect(await getLastSyncAt(db)).toBeNull();

    await setLastSyncAt(db, '2026-08-10T12:00:00.000Z');
    await setLastSyncAt(db, '2026-08-10T13:00:00.000Z');

    expect(await getLastSyncAt(db)).toBe('2026-08-10T13:00:00.000Z');

    const rows = await db.getAllAsync<{ id: number; last_sync_at: string }>(
      `SELECT id, last_sync_at FROM sync_meta`,
      [],
    );
    expect(rows).toEqual([{ id: 1, last_sync_at: '2026-08-10T13:00:00.000Z' }]);
  });
});
