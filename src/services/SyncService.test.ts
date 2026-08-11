import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getDirtySteps, getDirtyTasks } from '../database/sync';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getDb: mocks.getDb,
}));

vi.mock('./api', () => {
  class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
  return {
    apiFetch: mocks.apiFetch,
    ApiError,
    ENDPOINTS: {
      sync: { push: '/api/sync/push', pull: '/api/sync/pull', migrate: '/api/sync/migrate' },
    },
  };
});

vi.mock('./session', () => ({
  hasSession: vi.fn(() => true),
}));

import { hasSession } from './session';
import { SyncService } from './SyncService';

const mockedHasSession = vi.mocked(hasSession);

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
  mocks.apiFetch.mockReset();
  mockedHasSession.mockReturnValue(true);
});

async function insertTask(overrides: { server_id?: string | null; dirty?: number } = {}) {
  const task = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
       VALUES (?, NULL, 'active', ?, NULL, ?, ?, ?)`,
    [
      'Tarea',
      '2026-08-01T00:00:00.000Z',
      overrides.server_id ?? null,
      overrides.dirty ?? 0,
      '2026-08-01T00:00:00.000Z',
    ],
  );
  return task.lastInsertRowId;
}

async function insertStep(
  taskId: number,
  overrides: { server_id?: string | null; dirty?: number } = {},
) {
  const step = await db.runAsync(
    `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at)
       VALUES (?, 'Paso', 30, 0, 'pending', NULL, ?, ?, ?)`,
    [
      taskId,
      overrides.server_id ?? null,
      overrides.dirty ?? 0,
      '2026-08-01T00:00:00.000Z',
    ],
  );
  return step.lastInsertRowId;
}

function pushBody(): { tasks: Array<Record<string, unknown>>; steps: Array<Record<string, unknown>> } {
  const options = mocks.apiFetch.mock.calls[0][1] as RequestInit;
  return JSON.parse(String(options.body)) as {
    tasks: Array<Record<string, unknown>>;
    steps: Array<Record<string, unknown>>;
  };
}

describe('SyncService.push', () => {
  it('no hace nada sin sesión', async () => {
    mockedHasSession.mockReturnValue(false);

    await expect(SyncService.push()).resolves.toEqual({ tasks: 0, steps: 0 });
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('no hace nada sin registros dirty', async () => {
    await insertTask();
    await insertStep(1);

    await expect(SyncService.push()).resolves.toEqual({ tasks: 0, steps: 0 });
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('envía registros dirty con taskLocalId y aplica server_ids', async () => {
    const taskId = await insertTask({ dirty: 1 });
    const stepId = await insertStep(taskId, { dirty: 1 });
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [{ id: 'uuid-task', applied: true, localId: taskId }],
      steps: [{ id: 'uuid-step', applied: true, localId: stepId }],
    });

    await expect(SyncService.push()).resolves.toEqual({ tasks: 1, steps: 1 });

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      '/api/sync/push',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = pushBody();
    expect(body.tasks[0]).toMatchObject({ localId: taskId, name: 'Tarea' });
    expect(body.tasks[0]).not.toHaveProperty('id');
    expect(body.steps[0]).toMatchObject({ localId: stepId, taskLocalId: taskId });

    const [task] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM tasks WHERE id = ?`,
      [taskId],
    );
    const [step] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM steps WHERE id = ?`,
      [stepId],
    );
    expect(task).toEqual({ server_id: 'uuid-task', dirty: 0 });
    expect(step).toEqual({ server_id: 'uuid-step', dirty: 0 });
    await expect(getDirtyTasks(db)).resolves.toEqual([]);
    await expect(getDirtySteps(db)).resolves.toEqual([]);
  });

  it('re-envía con id (UUID) y taskId cuando ya tiene server_id', async () => {
    const taskId = await insertTask({ server_id: 'uuid-task', dirty: 1 });
    await insertStep(taskId, { dirty: 1 });
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [{ id: 'uuid-task', applied: true, localId: taskId }],
      steps: [{ id: 'uuid-step', applied: true, localId: 1 }],
    });

    await SyncService.push();

    const body = pushBody();
    expect(body.tasks[0]).toMatchObject({ id: 'uuid-task', localId: taskId });
    expect(body.steps[0]).toMatchObject({ taskId: 'uuid-task' });
    expect(body.steps[0]).not.toHaveProperty('taskLocalId');
  });

  it('guarda server_id y limpia dirty aunque el servidor rechace (applied:false)', async () => {
    const taskId = await insertTask({ dirty: 1 });
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [{ id: 'uuid-task', applied: false, localId: taskId }],
      steps: [],
    });

    await expect(SyncService.push()).resolves.toEqual({ tasks: 1, steps: 0 });

    const [task] = await db.getAllAsync<{ server_id: string | null; dirty: number }>(
      `SELECT server_id, dirty FROM tasks WHERE id = ?`,
      [taskId],
    );
    expect(task).toEqual({ server_id: 'uuid-task', dirty: 0 });
  });
});
