import { beforeEach, describe, expect, it, vi } from 'vitest';

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

import { storage } from './storage';
import {
  SESSION_KEYS,
  clearSession,
  getSessionUser,
  getToken,
  hasSession,
  loadSession,
  saveSession,
} from './session';

const mockedStorage = vi.mocked(storage);

beforeEach(async () => {
  await clearSession();
  mockedStorage.getItem.mockClear();
  mockedStorage.setItem.mockClear();
  mockedStorage.removeItem.mockClear();
});

describe('session — persistencia de token y usuario', () => {
  it('saveSession guarda token y usuario en storage y en memoria', async () => {
    await saveSession('jwt-1', { id: 'u1', name: 'Ana', email: 'ana@x.com' });

    expect(getToken()).toBe('jwt-1');
    expect(hasSession()).toBe(true);
    expect(mockedStorage.setItem).toHaveBeenCalledWith(SESSION_KEYS.token, 'jwt-1');
    await expect(getSessionUser()).resolves.toEqual({
      id: 'u1',
      name: 'Ana',
      email: 'ana@x.com',
    });
  });

  it('loadSession restaura el token persistido en memoria', async () => {
    await storage.setItem(SESSION_KEYS.token, 'jwt-persistido');

    expect(getToken()).toBeNull();
    await loadSession();
    expect(getToken()).toBe('jwt-persistido');
    expect(hasSession()).toBe(true);
  });

  it('clearSession limpia memoria y storage', async () => {
    await saveSession('jwt-1', { id: 'u1', name: 'Ana', email: 'ana@x.com' });

    await clearSession();

    expect(getToken()).toBeNull();
    expect(hasSession()).toBe(false);
    expect(mockedStorage.removeItem).toHaveBeenCalledWith(SESSION_KEYS.token);
    expect(mockedStorage.removeItem).toHaveBeenCalledWith(SESSION_KEYS.user);
    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('getSessionUser devuelve null si el valor guardado no es JSON válido', async () => {
    await storage.setItem(SESSION_KEYS.user, 'no-es-json');

    await expect(getSessionUser()).resolves.toBeNull();
  });
});
