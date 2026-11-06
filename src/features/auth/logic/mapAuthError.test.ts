import { describe, it, expect, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-constants', () => ({
  default: { expoConfig: null },
}));

vi.mock('../../../services/storage', () => ({
  storage: {
    getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => undefined),
    removeItem: vi.fn(async () => undefined),
  },
}));

import { ApiError } from '../../../services/api';
import { mapAuthError } from './mapAuthError';
import { loginCopy, authCopy } from './authCopy';

describe('mapAuthError', () => {
  it('401 → invalid-credentials con el mensaje de login', () => {
    expect(mapAuthError(new ApiError(401, 'nope'))).toEqual({
      kind: 'invalid-credentials',
      message: loginCopy.errorMessage,
    });
  });

  it('status 0 → offline con el body del bloque offline', () => {
    expect(mapAuthError(new ApiError(0, ''))).toEqual({
      kind: 'offline',
      message: loginCopy.offline.body,
    });
  });

  it('otro ApiError → server con su message', () => {
    expect(mapAuthError(new ApiError(500, 'boom'))).toEqual({
      kind: 'server',
      message: 'boom',
    });
  });

  it('ApiError con message vacío → server con serverError', () => {
    expect(mapAuthError(new ApiError(500, ''))).toEqual({
      kind: 'server',
      message: authCopy.serverError,
    });
  });

  it('cualquier otro error → unknown', () => {
    expect(mapAuthError(new Error('x'))).toEqual({
      kind: 'unknown',
      message: authCopy.unknownError,
    });
  });
});
