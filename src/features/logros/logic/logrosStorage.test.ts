import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-constants', () => ({
  default: { expoConfig: null },
}));

const mocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

vi.mock('../../../services/storage', () => ({
  storage: {
    getItem: mocks.getItem,
    setItem: mocks.setItem,
    removeItem: mocks.removeItem,
  },
}));

import { loadUnlockedLogros, saveUnlockedLogros } from './logrosStorage';

describe('logrosStorage', () => {
  beforeEach(() => {
    mocks.getItem.mockReset();
    mocks.setItem.mockReset();
  });

  it('loadUnlockedLogros devuelve [] si no hay valor', async () => {
    mocks.getItem.mockResolvedValue(null);
    await expect(loadUnlockedLogros()).resolves.toEqual([]);
  });

  it('loadUnlockedLogros parsea un array de strings', async () => {
    mocks.getItem.mockResolvedValue(JSON.stringify(['primer-paso', 'diez-pasos']));
    await expect(loadUnlockedLogros()).resolves.toEqual(['primer-paso', 'diez-pasos']);
  });

  it('loadUnlockedLogros devuelve [] si el JSON está roto', async () => {
    mocks.getItem.mockResolvedValue('{broken');
    await expect(loadUnlockedLogros()).resolves.toEqual([]);
  });

  it('loadUnlockedLogros devuelve [] si no es array de strings', async () => {
    mocks.getItem.mockResolvedValue(JSON.stringify([1, 2]));
    await expect(loadUnlockedLogros()).resolves.toEqual([]);
  });

  it('saveUnlockedLogros guarda JSON con la clave logrosUnlocked', async () => {
    await saveUnlockedLogros(['primer-paso']);
    expect(mocks.setItem).toHaveBeenCalledWith('logrosUnlocked', JSON.stringify(['primer-paso']));
  });
});
