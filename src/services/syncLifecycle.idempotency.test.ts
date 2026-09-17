import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getPendingIdempotencyKey } from '../database/sync';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  apiFetch: vi.fn(),
  loadSession: vi.fn(),
  hasSession: vi.fn(() => true),
  saveSession: vi.fn(),
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
  hasSession: mocks.hasSession,
  loadSession: mocks.loadSession,
  saveSession: mocks.saveSession,
}));

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

import { onAppActive } from './syncLifecycle';
import { SyncService } from './SyncService';

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
  mocks.apiFetch.mockReset();
  mocks.loadSession.mockReset();
  mocks.loadSession.mockResolvedValue(undefined);
  mocks.hasSession.mockReturnValue(true);
  mocks.saveSession.mockReset();
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
    [taskId, overrides.server_id ?? null, overrides.dirty ?? 0, '2026-08-01T00:00:00.000Z'],
  );
  return step.lastInsertRowId;
}

function keyOfCall(index: number): string | undefined {
  return (mocks.apiFetch.mock.calls[index][1] as { idempotencyKey?: string }).idempotencyKey;
}

// Issue #199 (AC4 #124): el retry de syncLifecycle (ciclos active/background) debe
// reutilizar la MISMA key persistida tras un fallo de red, y el catch {} de
// syncLifecycle debe tragar el error sin romper el flujo.
describe('syncLifecycle idempotencia (issue #199)', () => {
  it('onAppActive: reintento tras fallo de red en push usa la misma key persistida', async () => {
    const taskId = await insertTask({ dirty: 1 });
    await insertStep(taskId, { dirty: 1 });
    mocks.apiFetch.mockRejectedValueOnce(new Error('network timeout'));
    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [{ id: 'uuid-task', applied: true, localId: taskId }],
      steps: [{ id: 'uuid-step', applied: true, localId: 1 }],
    });
    mocks.apiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });

    await expect(onAppActive()).resolves.toBeUndefined();
    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.not.toBeNull();

    await expect(onAppActive()).resolves.toBeUndefined();

    expect(mocks.apiFetch).toHaveBeenCalledTimes(3);
    expect(keyOfCall(0)).toBeDefined();
    expect(keyOfCall(1)).toBe(keyOfCall(0));
    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.toBeNull();
  });

  it('onAppActive: la key queda persistida entre ciclos hasta confirmar éxito', async () => {
    const taskId = await insertTask({ dirty: 1 });
    mocks.apiFetch.mockRejectedValueOnce(new Error('offline'));
    mocks.apiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });

    await expect(onAppActive()).resolves.toBeUndefined();

    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.not.toBeNull();

    mocks.apiFetch.mockResolvedValueOnce({
      tasks: [{ id: 'uuid-task', applied: true, localId: taskId }],
      steps: [],
    });
    mocks.apiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });
    await onAppActive();

    expect(keyOfCall(1)).toBe(keyOfCall(0));
    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.toBeNull();
  });

  it('migrate: reintento tras timeout reutiliza la misma key y recibe token + maps', async () => {
    const taskId = await insertTask();
    const stepId = await insertStep(taskId);
    const response = {
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-migrate',
      taskMap: { [String(taskId)]: 'uuid-task' },
      stepMap: { [String(stepId)]: 'uuid-step' },
    };
    mocks.apiFetch.mockRejectedValueOnce(new Error('network timeout'));
    mocks.apiFetch.mockResolvedValueOnce(response);

    await expect(SyncService.migrate('Ana', 'ana@x.com', 'secreto123')).rejects.toThrow(
      'network timeout',
    );
    await expect(getPendingIdempotencyKey(db, 'sync-migrate')).resolves.not.toBeNull();

    await expect(SyncService.migrate('Ana', 'ana@x.com', 'secreto123')).resolves.toEqual({
      tasks: 1,
      steps: 1,
    });

    expect(keyOfCall(1)).toBe(keyOfCall(0));
    expect(mocks.saveSession).toHaveBeenCalledWith('jwt-migrate', {
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.com',
    });
    await expect(getPendingIdempotencyKey(db, 'sync-migrate')).resolves.toBeNull();
  });
});