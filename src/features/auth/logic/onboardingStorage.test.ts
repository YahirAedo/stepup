import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('../../../services/storage', () => ({
  storage: {
    getItem: mocks.getItem,
    setItem: mocks.setItem,
    removeItem: vi.fn(),
  },
}));

import { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage';

describe('onboardingStorage', () => {
  beforeEach(() => {
    mocks.getItem.mockReset();
    mocks.setItem.mockReset();
  });

  it('hasSeenOnboarding devuelve true si el storage tiene "true"', async () => {
    mocks.getItem.mockResolvedValue('true');
    await expect(hasSeenOnboarding()).resolves.toBe(true);
    expect(mocks.getItem).toHaveBeenCalledWith('hasSeenOnboarding');
  });

  it('hasSeenOnboarding devuelve false si no hay valor', async () => {
    mocks.getItem.mockResolvedValue(null);
    await expect(hasSeenOnboarding()).resolves.toBe(false);
  });

  it('markOnboardingSeen guarda "true" con la misma clave', async () => {
    await markOnboardingSeen();
    expect(mocks.setItem).toHaveBeenCalledWith('hasSeenOnboarding', 'true');
  });
});
