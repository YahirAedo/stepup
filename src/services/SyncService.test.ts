import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getDirtySteps, getDirtyTasks, getLastSyncAt, getLocalOwner, setLastSyncAt, setLocalOwner, type ServerStep, type ServerTask } from '../database/sync';

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
  saveSession: vi.fn(),
}));

import { hasSession, saveSession } from './session';
import { SyncService } from './SyncService';

const mockedHasSession = vi.mocked(hasSession);
const mockedSaveSession = vi.mocked(saveSession);

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
  mocks.apiFetch.mockReset();
  mockedHasSession.mockReturnValue(true);
  mockedSaveSession.mockReset();
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

  it('push de un step nuevo con tarea ya sincronizada (no dirty) manda taskId y no 404', async () => {
    // La tarea ya se sincronizó (server_id asignado, dirty=0). Se agrega un step nuevo (dirty=1).
    // El push debe mandar el step con taskId (server_id de la tarea), NO taskLocalId,
    // porque la tarea no viaja en el batch → el backend respondería 404 TASK_NOT_FOUND.
    const taskId = await insertTask({ server_id: 'uuid-task', dirty: 0 });
    const stepId = await insertStep(taskId, { dirty: 1 });
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [],
      steps: [{ id: 'uuid-step', applied: true, localId: stepId }],
    });

    await expect(SyncService.push()).resolves.toEqual({ tasks: 0, steps: 1 });

    const body = pushBody();
    expect(body.tasks).toHaveLength(0);
    expect(body.steps).toHaveLength(1);
    expect(body.steps[0]).toMatchObject({ localId: stepId, taskId: 'uuid-task' });
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

describe('SyncService.pull', () => {
  it('no hace nada sin sesión', async () => {
    mockedHasSession.mockReturnValue(false);

    await expect(SyncService.pull()).resolves.toEqual({ tasks: 0, steps: 0 });
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  it('aplica tareas y pasos del servidor y avanza last_sync_at', async () => {
    const serverTask: ServerTask = {
      id: 'uuid-task',
      name: 'Remota',
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
      name: 'Paso',
      durationMin: 10,
      orderIndex: 0,
      status: 'pending',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-02T00:00:00.000Z',
      completedAt: null,
    };
    mocks.apiFetch.mockResolvedValueOnce({ tasks: [serverTask], steps: [serverStep] });

    await expect(SyncService.pull()).resolves.toEqual({ tasks: 1, steps: 1 });

    const [task] = await db.getAllAsync<{ name: string; server_id: string | null; dirty: number }>(
      `SELECT name, server_id, dirty FROM tasks`,
      [],
    );
    const [step] = await db.getAllAsync<{ task_id: number; server_id: string | null; dirty: number }>(
      `SELECT task_id, server_id, dirty FROM steps`,
      [],
    );
    expect(task).toEqual({ name: 'Remota', server_id: 'uuid-task', dirty: 0 });
    expect(step).toEqual({ task_id: 1, server_id: 'uuid-step', dirty: 0 });
    await expect(getLastSyncAt(db)).resolves.not.toBeNull();
  });

  it('manda ?since= cuando ya hay una sync previa', async () => {
    await setLastSyncAt(db, '2026-08-01T00:00:00.000Z');
    mocks.apiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });

    await SyncService.pull();

    expect(mocks.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/api/sync/pull?since='));
  });

  it('salta pasos cuya tarea no existe localmente', async () => {
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [],
      steps: [
        {
          id: 'uuid-step',
          taskId: 'uuid-desconocida',
          name: 'Huerfano',
          durationMin: 5,
          orderIndex: 0,
          status: 'pending',
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-02T00:00:00.000Z',
          completedAt: null,
        },
      ],
    });

    await expect(SyncService.pull()).resolves.toEqual({ tasks: 0, steps: 0 });

    const rows = await db.getAllAsync<{ id: number }>(`SELECT id FROM steps`, []);
    expect(rows).toEqual([]);
  });

  it('no pisa un cambio local más nuevo (LWW)', async () => {
    const taskId = await insertTask({ server_id: 'uuid-task', dirty: 1 });
    await db.runAsync(`UPDATE tasks SET updated_at = ? WHERE id = ?`, [
      '2026-08-10T00:00:00.000Z',
      taskId,
    ]);
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [
        {
          id: 'uuid-task',
          name: 'Version servidor',
          dueDate: null,
          status: 'active',
          createdAt: '2026-08-01T00:00:00.000Z',
          updatedAt: '2026-08-01T00:00:00.000Z',
          completedAt: null,
        },
      ],
      steps: [],
    });

    await SyncService.pull();

    const [task] = await db.getAllAsync<{ name: string; dirty: number }>(
      `SELECT name, dirty FROM tasks WHERE id = ?`,
      [taskId],
    );
    expect(task).toEqual({ name: 'Tarea', dirty: 1 });
  });
});

describe('SyncService.migrate', () => {
  it('envía todos los datos locales, guarda sesión y aplica los maps', async () => {
    const taskId = await insertTask();
    const stepId = await insertStep(taskId);
    mocks.apiFetch.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-migrate',
      taskMap: { [String(taskId)]: 'uuid-task' },
      stepMap: { [String(stepId)]: 'uuid-step' },
    });

    await expect(SyncService.migrate('Ana', 'ana@x.com', 'secreto123')).resolves.toEqual({
      tasks: 1,
      steps: 1,
    });

    expect(mocks.apiFetch).toHaveBeenCalledWith(
      '/api/sync/migrate',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(
      String((mocks.apiFetch.mock.calls[0][1] as RequestInit).body),
    ) as { name: string; email: string; tasks: Array<Record<string, unknown>>; steps: Array<Record<string, unknown>> };
    expect(body).toMatchObject({ name: 'Ana', email: 'ana@x.com' });
    expect(body.tasks[0]).toMatchObject({ localId: taskId, name: 'Tarea' });
    expect(body.steps[0]).toMatchObject({ localId: stepId, taskLocalId: taskId });

    expect(mockedSaveSession).toHaveBeenCalledWith('jwt-migrate', {
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.com',
    });

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
  });

  it('migra también registros sin dirty y exige taskLocalId en cada paso', async () => {
    const taskId = await insertTask();
    await insertStep(taskId);
    mocks.apiFetch.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-migrate',
      taskMap: {},
      stepMap: {},
    });

    await SyncService.migrate('Ana', 'ana@x.com', 'secreto123');

    const body = JSON.parse(
      String((mocks.apiFetch.mock.calls[0][1] as RequestInit).body),
    ) as { tasks: Array<Record<string, unknown>>; steps: Array<Record<string, unknown>> };
    expect(body.tasks).toHaveLength(1);
    expect(body.steps[0]).toMatchObject({ taskLocalId: taskId });
  });

  it('normaliza timestamps null/viejos a ISO antes de enviar (no rompe con datos legacy)', async () => {
    // Datos locales viejos: updated_at = NULL (columna agregada sin default en migración v2)
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES (?, NULL, 'active', ?, NULL, NULL, 0, NULL)`,
      ['Tarea legacy', '2026-08-01T00:00:00.000Z'],
    );

    mocks.apiFetch.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-migrate',
      taskMap: {},
      stepMap: {},
    });

    await SyncService.migrate('Ana', 'ana@x.com', 'secreto123');

    const body = pushBody();
    expect(body.tasks).toHaveLength(1);
    expect(Number.isNaN(Date.parse(body.tasks[0].updatedAt as string))).toBe(false);
    expect(Number.isNaN(Date.parse(body.tasks[0].createdAt as string))).toBe(false);
  });

  it('no migra datos de otra cuenta: si hay owner previo limpia antes de subir', async () => {
    await setLocalOwner(db, 'u-old');
    const taskId = await insertTask();
    await insertStep(taskId);
    mocks.apiFetch.mockResolvedValueOnce({
      user: { id: 'u-new', name: 'Beto', email: 'beto@x.com' },
      token: 'jwt-new',
      taskMap: {},
      stepMap: {},
    });

    await expect(SyncService.migrate('Beto', 'beto@x.com', 'secreto123')).resolves.toEqual({
      tasks: 0,
      steps: 0,
    });

    const body = pushBody();
    expect(body.tasks).toEqual([]);
    expect(body.steps).toEqual([]);
    await expect(getLocalOwner(db)).resolves.toBe('u-new');
  });

  it('marca el owner local tras un migrate exitoso (datos sin owner se migran)', async () => {
    await insertTask();
    mocks.apiFetch.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-migrate',
      taskMap: {},
      stepMap: {},
    });

    await SyncService.migrate('Ana', 'ana@x.com', 'secreto123');

    await expect(getLocalOwner(db)).resolves.toBe('u1');
    const rows = await db.getAllAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM tasks`, []);
    expect(rows[0].n).toBe(1);
  });
});
