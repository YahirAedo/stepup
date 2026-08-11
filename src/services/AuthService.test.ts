import { beforeEach, describe, expect, it, vi } from 'vitest';

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

beforeEach(async () => {
  await clearSession();
  mockedApiFetch.mockReset();
});

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
});
