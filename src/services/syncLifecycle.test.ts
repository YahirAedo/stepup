import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPush, mockPull, mockLoadSession, mockHasSession } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockPull: vi.fn(),
  mockLoadSession: vi.fn(),
  mockHasSession: vi.fn(() => true),
}));

vi.mock('./SyncService', () => ({
  SyncService: {
    push: mockPush,
    pull: mockPull,
  },
}));

vi.mock('./session', () => ({
  loadSession: mockLoadSession,
  hasSession: mockHasSession,
}));

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}));

import { onAppActive, onAppBackground } from './syncLifecycle';

describe('syncLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasSession.mockReturnValue(true);
  });

  describe('onAppActive', () => {
    it('ejecuta push y pull cuando hay sesión', async () => {
      mockPush.mockResolvedValue(undefined);
      mockPull.mockResolvedValue(undefined);

      await onAppActive();

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPull).toHaveBeenCalledTimes(1);
    });

    it('no ejecuta nada si no hay sesión', async () => {
      mockHasSession.mockReturnValue(false);

      await onAppActive();

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockPull).not.toHaveBeenCalled();
    });

    it('traga errores de push (offline) sin romper el flujo', async () => {
      mockPush.mockRejectedValue(new Error('Network error'));

      await expect(onAppActive()).resolves.toBeUndefined();

      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('traga errores de pull (offline) sin romper el flujo', async () => {
      mockPush.mockResolvedValue(undefined);
      mockPull.mockRejectedValue(new Error('Network error'));

      await expect(onAppActive()).resolves.toBeUndefined();

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPull).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAppBackground', () => {
    it('ejecuta push cuando hay sesión', async () => {
      mockPush.mockResolvedValue(undefined);

      await onAppBackground();

      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('no ejecuta nada si no hay sesión', async () => {
      mockHasSession.mockReturnValue(false);

      await onAppBackground();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('traga errores de push (offline) sin romper el flujo', async () => {
      mockPush.mockRejectedValue(new Error('Network error'));

      await expect(onAppBackground()).resolves.toBeUndefined();

      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });
});
