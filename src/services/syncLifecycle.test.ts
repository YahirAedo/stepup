import { beforeEach, describe, expect, it, vi } from 'vitest';
import { startSyncLifecycle } from './syncLifecycle';

const mocks = vi.hoisted(() => ({
  loadSession: vi.fn(),
  hasSession: vi.fn(() => false),
  push: vi.fn(),
  pull: vi.fn(),
  handler: vi.fn<(state: string) => void>(),
}));

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn((_event: string, handler: (state: string) => void) => {
      mocks.handler.mockImplementation(handler);
      return { remove: vi.fn() };
    }),
  },
}));

vi.mock('./session', () => ({
  loadSession: mocks.loadSession,
  hasSession: mocks.hasSession,
}));

vi.mock('./SyncService', () => ({
  SyncService: { push: mocks.push, pull: mocks.pull },
}));

beforeEach(() => {
  mocks.loadSession.mockReset().mockResolvedValue(undefined);
  mocks.hasSession.mockReset().mockReturnValue(false);
  mocks.push.mockReset().mockResolvedValue({ tasks: 0, steps: 0 });
  mocks.pull.mockReset().mockResolvedValue({ tasks: 0, steps: 0 });
});

describe('startSyncLifecycle', () => {
  it('carga la sesión y sincroniza al iniciar', async () => {
    mocks.hasSession.mockReturnValue(true);

    startSyncLifecycle();
    await vi.waitFor(() => expect(mocks.push).toHaveBeenCalled());
    expect(mocks.loadSession).toHaveBeenCalled();
    expect(mocks.pull).toHaveBeenCalled();
  });

  it('no sincroniza al iniciar sin sesión', async () => {
    startSyncLifecycle();
    await vi.waitFor(() => expect(mocks.loadSession).toHaveBeenCalled());
    await Promise.resolve();
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.pull).not.toHaveBeenCalled();
  });

  it('hace push al pasar a background', async () => {
    mocks.hasSession.mockReturnValue(true);
    startSyncLifecycle();
    await vi.waitFor(() => expect(mocks.loadSession).toHaveBeenCalled());

    await mocks.handler('background');
    expect(mocks.push).toHaveBeenCalled();
  });

  it('sincroniza al volver a active', async () => {
    mocks.hasSession.mockReturnValue(true);
    startSyncLifecycle();
    await vi.waitFor(() => expect(mocks.loadSession).toHaveBeenCalled());
    mocks.push.mockClear();
    mocks.pull.mockClear();

    await mocks.handler('active');
    expect(mocks.push).toHaveBeenCalled();
    expect(mocks.pull).toHaveBeenCalled();
  });

  it('tolera fallos de red sin propagar', async () => {
    mocks.hasSession.mockReturnValue(true);
    mocks.push.mockRejectedValue(new Error('offline'));

    startSyncLifecycle();
    await vi.waitFor(() => expect(mocks.loadSession).toHaveBeenCalled());

    await mocks.handler('background');
    expect(mocks.push).toHaveBeenCalled();
  });
});
