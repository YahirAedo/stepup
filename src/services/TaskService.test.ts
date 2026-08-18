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

import { TaskService } from './TaskService';

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

async function insertTask() {
  const res = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, dirty, updated_at)
       VALUES ('Tarea', NULL, 'active', '2026-08-01T00:00:00.000Z', NULL, 0, '2026-08-01T00:00:00.000Z')`,
    [],
  );
  return res.lastInsertRowId;
}

describe('TaskService', () => {
  it('create inserta local con dirty=1 y dispara sync', async () => {
    const task = await TaskService.create({ name: 'Nueva' });

    expect(task.id).toBeGreaterThan(0);
    expect(task).toMatchObject({ name: 'Nueva', status: 'active', dirty: 1 });
    expect(task.server_id).toBeNull();
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  it('getAll ordena por created_at desc', async () => {
    await insertTask();
    await db.runAsync(
      `INSERT INTO tasks (name, status, created_at, dirty, updated_at)
         VALUES ('Reciente', 'active', '2026-08-05T00:00:00.000Z', 0, '2026-08-05T00:00:00.000Z')`,
      [],
    );

    const tasks = await TaskService.getAll();
    expect(tasks.map((t) => t.name)).toEqual(['Reciente', 'Tarea']);
  });

  it('getById devuelve la tarea o null', async () => {
    const id = await insertTask();

    await expect(TaskService.getById(id)).resolves.toMatchObject({ name: 'Tarea' });
    await expect(TaskService.getById(999)).resolves.toBeNull();
  });

  it('update cambia campos y marca dirty', async () => {
    const id = await insertTask();

    await TaskService.update(id, { name: 'Editada', due_date: '2026-09-01' });

    const [row] = await db.getAllAsync<{ name: string; due_date: string | null; dirty: number }>(
      `SELECT name, due_date, dirty FROM tasks WHERE id = ?`,
      [id],
    );
    expect(row).toEqual({ name: 'Editada', due_date: '2026-09-01', dirty: 1 });
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  it('delete borra la tarea y sus pasos', async () => {
    const id = await insertTask();
    await db.runAsync(`INSERT INTO steps (task_id, name, order_index, dirty, updated_at)
       VALUES (?, 'Paso', 0, 0, '2026-08-01T00:00:00.000Z')`, [id]);

    await TaskService.delete(id);

    const tasks = await db.getAllAsync<{ id: number }>(`SELECT id FROM tasks`, []);
    const steps = await db.getAllAsync<{ id: number }>(`SELECT id FROM steps`, []);
    expect(tasks).toEqual([]);
    expect(steps).toEqual([]);
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('delete avisa al servidor cuando hay sesión y server_id', async () => {
    const id = await insertTask();
    await db.runAsync(`UPDATE tasks SET server_id = 'uuid-task' WHERE id = ?`, [id]);
    mocks.hasSession.mockReturnValue(true);
    mocks.apiFetch.mockResolvedValue(undefined);

    await TaskService.delete(id);

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      '/api/tasks/uuid-task',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('complete marca la tarea como completada', async () => {
    const id = await insertTask();

    await expect(TaskService.complete(id)).resolves.toBe(true);

    const [row] = await db.getAllAsync<{ status: string; completed_at: string | null; dirty: number }>(
      `SELECT status, completed_at, dirty FROM tasks WHERE id = ?`,
      [id],
    );
    expect(row.status).toBe('completed');
    expect(row.completed_at).not.toBeNull();
    expect(row.dirty).toBe(1);
    expect(mocks.syncNow).toHaveBeenCalled();
  });

  it('getCompleted devuelve solo completadas', async () => {
    await insertTask();
    await db.runAsync(
      `INSERT INTO tasks (name, status, created_at, completed_at, dirty, updated_at)
         VALUES ('Hecha', 'completed', '2026-08-01T00:00:00.000Z', '2026-08-02T00:00:00.000Z', 0, '2026-08-02T00:00:00.000Z')`,
      [],
    );

    const completed = await TaskService.getCompleted();
    expect(completed.map((t) => t.name)).toEqual(['Hecha']);
  });
});
