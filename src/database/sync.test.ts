import { describe, expect, it } from 'vitest';
import { runMigrations } from './migrations';
import { makeSqlJsDb } from './testDb';
import {
  applyServerIds,
  clearDirty,
  deleteConflict,
  getConflicts,
  getDirtySteps,
  getDirtyTasks,
  getLastSyncAt,
  getTaskIdByServerId,
  isNearTimestamp,
  markDirty,
  resolveConflictKeepLocal,
  resolveConflictKeepServer,
  setLastSyncAt,
  upsertServerStep,
  upsertServerTask,
  type ServerStep,
  type ServerTask,
} from './sync';

const serverTask: ServerTask = {
  id: 'uuid-task',
  name: 'Tarea del servidor',
  description: null,
  dueDate: null,
  status: 'active',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
  completedAt: null,
};

const serverStep: ServerStep = {
  id: 'uuid-step',
  taskId: 'uuid-task',
  name: 'Paso del servidor',
  durationMin: 15,
  orderIndex: 0,
  status: 'pending',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
  completedAt: null,
};

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

describe('sync — upserts desde el servidor (pull)', () => {
  it('upsertServerTask inserta un registro nuevo con server_id y dirty=0', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);

    await upsertServerTask(db, serverTask);

    const rows = await db.getAllAsync<{ name: string; server_id: string | null; dirty: number }>(
      `SELECT name, server_id, dirty FROM tasks`,
      [],
    );
    expect(rows).toEqual([{ name: 'Tarea del servidor', server_id: 'uuid-task', dirty: 0 }]);
  });

  it('upsertServerTask persiste description no nula (AC4 sync)', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);

    await upsertServerTask(db, {
      ...serverTask,
      description: 'Contexto detallado de la tarea para IA',
    });

    const [row] = await db.getAllAsync<{ description: string | null }>(
      `SELECT description FROM tasks WHERE server_id = ?`,
      ['uuid-task'],
    );
    expect(row.description).toBe('Contexto detallado de la tarea para IA');
  });

  it('upsertServerTask actualiza si el servidor es más nuevo', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await upsertServerTask(db, serverTask);

    await upsertServerTask(db, {
      ...serverTask,
      name: 'Renombrada',
      updatedAt: '2026-08-03T00:00:00.000Z',
    });

    const [row] = await db.getAllAsync<{ name: string }>(`SELECT name FROM tasks`, []);
    expect(row.name).toBe('Renombrada');
  });

  it('upsertServerTask no pisa un cambio local más nuevo (LWW)', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('Local nueva', NULL, 'active', ?, NULL, 'uuid-task', 1, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-05T00:00:00.000Z'],
    );

    await upsertServerTask(db, serverTask);

    const [row] = await db.getAllAsync<{ name: string; dirty: number }>(
      `SELECT name, dirty FROM tasks`,
      [],
    );
    expect(row).toEqual({ name: 'Local nueva', dirty: 1 });
  });

  it('getTaskIdByServerId resuelve el id local a partir del UUID', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await upsertServerTask(db, serverTask);

    await expect(getTaskIdByServerId(db, 'uuid-task')).resolves.toBe(1);
    await expect(getTaskIdByServerId(db, 'no-existe')).resolves.toBeNull();
  });

  it('upsertServerStep inserta con task_id resuelto y dirty=0', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await upsertServerTask(db, serverTask);
    const taskId = (await getTaskIdByServerId(db, 'uuid-task')) as number;

    await upsertServerStep(db, serverStep, taskId);

    const rows = await db.getAllAsync<{ task_id: number; server_id: string | null; dirty: number }>(
      `SELECT task_id, server_id, dirty FROM steps`,
      [],
    );
    expect(rows).toEqual([{ task_id: taskId, server_id: 'uuid-step', dirty: 0 }]);
  });

  it('upsertServerStep actualiza si el servidor es más nuevo', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await upsertServerTask(db, serverTask);
    const taskId = (await getTaskIdByServerId(db, 'uuid-task')) as number;
    await upsertServerStep(db, serverStep, taskId);

    await upsertServerStep(
      db,
      { ...serverStep, name: 'Paso actualizado', updatedAt: '2026-08-04T00:00:00.000Z' },
      taskId,
    );

    const [row] = await db.getAllAsync<{ name: string }>(`SELECT name FROM steps`, []);
    expect(row.name).toBe('Paso actualizado');
  });
});

describe('sync — conflictos (timestamps cercanos)', () => {
  it('isNearTimestamp detecta fechas dentro de la ventana', () => {
    expect(isNearTimestamp('2026-08-05T00:00:00.000Z', '2026-08-05T00:00:30.000Z')).toBe(true);
    expect(isNearTimestamp('2026-08-05T00:00:00.000Z', '2026-08-05T00:02:00.000Z')).toBe(false);
  });

  it('upsertServerTask guarda un conflicto sin pisar lo local si las fechas son cercanas', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('Local nueva', NULL, 'active', ?, NULL, 'uuid-task', 1, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-05T00:00:00.000Z'],
    );

    await upsertServerTask(db, {
      ...serverTask,
      name: 'Servidor editada',
      updatedAt: '2026-08-05T00:00:30.000Z',
    });

    const [task] = await db.getAllAsync<{ name: string; dirty: number }>(
      `SELECT name, dirty FROM tasks`,
      [],
    );
    expect(task).toEqual({ name: 'Local nueva', dirty: 1 });

    const conflicts = await getConflicts(db);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      tableName: 'tasks',
      localId: 1,
      serverId: 'uuid-task',
      local: { name: 'Local nueva', status: 'active', updatedAt: '2026-08-05T00:00:00.000Z' },
      server: { name: 'Servidor editada', updatedAt: '2026-08-05T00:00:30.000Z' },
    });
  });

  it('no crea conflicto si las fechas no son cercanas (LWW normal)', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('Local', NULL, 'active', ?, NULL, 'uuid-task', 1, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-05T00:00:00.000Z'],
    );

    await upsertServerTask(db, serverTask);

    await expect(getConflicts(db)).resolves.toEqual([]);
  });

  it('resolver conservando el servidor aplica el payload remoto y elimina el conflicto', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await upsertServerTask(db, serverTask);
    await db.runAsync(
      `INSERT INTO sync_conflicts (table_name, local_id, server_id, local_payload, server_payload, created_at)
         VALUES ('tasks', 1, 'uuid-task', ?, ?, ?)`,
      [
        JSON.stringify({ name: 'Local', status: 'active', updatedAt: '2026-08-05T00:00:00.000Z' }),
        JSON.stringify({ ...serverTask, name: 'Servidor editada', updatedAt: '2026-08-05T00:00:30.000Z' }),
        '2026-08-05T00:01:00.000Z',
      ],
    );

    await resolveConflictKeepServer(db, 1);

    const [task] = await db.getAllAsync<{ name: string; dirty: number }>(
      `SELECT name, dirty FROM tasks`,
      [],
    );
    expect(task).toEqual({ name: 'Servidor editada', dirty: 0 });
    await expect(getConflicts(db)).resolves.toEqual([]);
  });

  it('resolver conservando lo local borra el conflicto y deja el registro dirty', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('Local', NULL, 'active', ?, NULL, 'uuid-task', 1, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-05T00:00:00.000Z'],
    );
    await db.runAsync(
      `INSERT INTO sync_conflicts (table_name, local_id, server_id, local_payload, server_payload, created_at)
         VALUES ('tasks', 1, 'uuid-task', ?, ?, ?)`,
      [
        JSON.stringify({ name: 'Local', status: 'active', updatedAt: '2026-08-05T00:00:00.000Z' }),
        JSON.stringify(serverTask),
        '2026-08-05T00:01:00.000Z',
      ],
    );

    await resolveConflictKeepLocal(db, 1);

    const [task] = await db.getAllAsync<{ name: string; dirty: number }>(
      `SELECT name, dirty FROM tasks`,
      [],
    );
    expect(task).toEqual({ name: 'Local', dirty: 1 });
    await expect(getConflicts(db)).resolves.toEqual([]);
  });

  it('deleteConflict elimina solo el conflicto indicado', async () => {
    const { db } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO sync_conflicts (table_name, local_id, server_id, local_payload, server_payload, created_at)
         VALUES ('tasks', 1, 'uuid-task', ?, ?, ?)`,
      [
        JSON.stringify({ name: 'A', status: 'active', updatedAt: '2026-08-05T00:00:00.000Z' }),
        JSON.stringify(serverTask),
        '2026-08-05T00:01:00.000Z',
      ],
    );

    await deleteConflict(db, 1);

    await expect(getConflicts(db)).resolves.toEqual([]);
  });
});
