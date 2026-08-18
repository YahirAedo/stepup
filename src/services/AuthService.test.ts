import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getLocalOwner, setLocalOwner } from '../database/sync';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getDb: mocks.getDb,
}));

vi.mock('./api', () => {
  const apiFetch = vi.fn();
  class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
  return {
    apiFetch,
    ApiError,
    ENDPOINTS: {
      auth: { register: '/api/auth/register', login: '/api/auth/login', me: '/api/auth/me' },
      sync: { push: '/api/sync/push', pull: '/api/sync/pull', migrate: '/api/sync/migrate' },
    },
  };
});

vi.mock('./storage', () => {
  const map = new Map<string, string>();
  return {
    storage: {
      getItem: vi.fn(async (key: string) => map.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        map.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        map.delete(key);
      }),
    },
  };
});

import { apiFetch, ApiError } from './api';
import { AuthService } from './AuthService';
import { clearSession, getSessionUser, hasSession } from './session';

const mockedApiFetch = vi.mocked(apiFetch);

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
  await clearSession();
  mockedApiFetch.mockReset();
});

async function insertTask(name = 'Tarea'): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
       VALUES (?, NULL, 'active', ?, NULL, NULL, 0, ?)`,
    [name, '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
  );
  return res.lastInsertRowId;
}

async function countTasks(): Promise<number> {
  const rows = await db.getAllAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM tasks`, []);
  return rows[0].n;
}

describe('AuthService', () => {
  it('register envía credenciales y guarda la sesión', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Ana', email: 'ana@x.com' },
      token: 'jwt-1',
    });

    await AuthService.register('Ana', 'ana@x.com', 'secreto123');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(hasSession()).toBe(true);
    await expect(getSessionUser()).resolves.toEqual({
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.com',
    });
  });

  it('login envía credenciales y guarda la sesión', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u2', name: 'Leo', email: 'leo@x.com' },
      token: 'jwt-2',
    });

    await AuthService.login('leo@x.com', 'secreto123');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(hasSession()).toBe(true);
  });

  it('logout limpia la sesión', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u2', name: 'Leo', email: 'leo@x.com' },
      token: 'jwt-2',
    });
    await AuthService.login('leo@x.com', 'secreto123');

    await AuthService.logout();

    expect(hasSession()).toBe(false);
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('propaga errores de la API sin dejar sesión', async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(401, 'Credenciales inválidas'));

    await expect(AuthService.login('leo@x.com', 'mal')).rejects.toBeInstanceOf(ApiError);
    expect(hasSession()).toBe(false);
  });

  it('login con otro owner limpia la DB local y hace pull desde cero', async () => {
    await setLocalOwner(db, 'u-old');
    await insertTask('Del usuario anterior');
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u-nuevo', name: 'Leo', email: 'leo@x.com' },
      token: 'jwt-nuevo',
    });
    mockedApiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });

    await AuthService.login('leo@x.com', 'secreto123');

    await expect(countTasks()).resolves.toBe(0);
    await expect(getLocalOwner(db)).resolves.toBe('u-nuevo');
    expect(mockedApiFetch).toHaveBeenCalledWith('/api/sync/pull');
  });

  it('login del mismo owner conserva los datos locales y hace pull incremental', async () => {
    await setLocalOwner(db, 'u-mismo');
    await insertTask('Propia');
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u-mismo', name: 'Leo', email: 'leo@x.com' },
      token: 'jwt-mismo',
    });
    mockedApiFetch.mockResolvedValueOnce({ tasks: [], steps: [] });

    await AuthService.login('leo@x.com', 'secreto123');

    await expect(countTasks()).resolves.toBe(1);
    expect(mockedApiFetch).toHaveBeenCalledTimes(2);
    expect(mockedApiFetch).toHaveBeenLastCalledWith('/api/sync/pull');
  });

  it('logout limpia la sesión y borra los datos locales', async () => {
    mockedApiFetch.mockResolvedValueOnce({
      user: { id: 'u2', name: 'Leo', email: 'leo@x.com' },
      token: 'jwt-2',
    });
    await AuthService.login('leo@x.com', 'secreto123');
    await insertTask('Queda sin borrar');

    await AuthService.logout();

    expect(hasSession()).toBe(false);
    await expect(getSessionUser()).resolves.toBeNull();
    await expect(countTasks()).resolves.toBe(0);
    await expect(getLocalOwner(db)).resolves.toBeNull();
  });
});
