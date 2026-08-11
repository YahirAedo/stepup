import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-constants', () => ({
  default: { expoConfig: null },
}));

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

import { apiFetch } from './api';
import { clearSession, saveSession } from './session';

const fetchMock = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(async () => {
  await clearSession();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiFetch — autenticación', () => {
  it('agrega Authorization: Bearer cuando hay sesión', async () => {
    await saveSession('jwt-123', { id: 'u1', name: 'Ana', email: 'ana@x.com' });
    fetchMock.mockResolvedValueOnce(okResponse({ ok: true }));

    await apiFetch('/api/tasks');

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/tasks$/);
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jwt-123');
  });

  it('no envía Authorization sin sesión', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ ok: true }));

    await apiFetch('/api/tasks');

    const [, options] = fetchMock.mock.calls[0];
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('lanza ApiError con el status en respuestas no OK', async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ message: 'No autorizado' }, 401));

    await expect(apiFetch('/api/tasks')).rejects.toMatchObject({ status: 401 });
  });

  it('lanza ApiError(0) cuando no hay conexión', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(apiFetch('/api/tasks')).rejects.toMatchObject({ status: 0 });
  });
});
