import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getLogrosStats: vi.fn(),
  loadUnlockedLogros: vi.fn(),
  saveUnlockedLogros: vi.fn(),
}));

vi.mock('../../services/ProgressService', () => ({
  ProgressService: { getLogrosStats: mocks.getLogrosStats },
}));

vi.mock('./logic/logrosStorage', () => ({
  loadUnlockedLogros: mocks.loadUnlockedLogros,
  saveUnlockedLogros: mocks.saveUnlockedLogros,
}));

import { syncUnlockedLogros } from './logrosData';

describe('syncUnlockedLogros', () => {
  beforeEach(() => {
    mocks.getLogrosStats.mockReset();
    mocks.loadUnlockedLogros.mockReset();
    mocks.saveUnlockedLogros.mockReset();
  });

  it('conserva persistidos aunque lo calculado se achique', async () => {
    mocks.getLogrosStats.mockResolvedValue({ stepsTotal: 0, tasksCompleted: 0, completedDays: [], completedAtList: [] });
    mocks.loadUnlockedLogros.mockResolvedValue(['primer-paso']);
    mocks.saveUnlockedLogros.mockResolvedValue(undefined);

    const result = await syncUnlockedLogros(new Date(2026, 9, 15));
    expect(result).toEqual(['primer-paso']);
    expect(mocks.saveUnlockedLogros).not.toHaveBeenCalled();
  });

  it('guarda solo cuando crece', async () => {
    mocks.getLogrosStats.mockResolvedValue({ stepsTotal: 1, tasksCompleted: 0, completedDays: [], completedAtList: [] });
    mocks.loadUnlockedLogros.mockResolvedValue([]);
    mocks.saveUnlockedLogros.mockResolvedValue(undefined);

    const result = await syncUnlockedLogros(new Date(2026, 9, 15));
    expect(result).toContain('primer-paso');
    expect(mocks.saveUnlockedLogros).toHaveBeenCalled();
  });

  it('si el guardado falla igual devuelve el resultado', async () => {
    mocks.getLogrosStats.mockResolvedValue({ stepsTotal: 1, tasksCompleted: 0, completedDays: [], completedAtList: [] });
    mocks.loadUnlockedLogros.mockResolvedValue([]);
    mocks.saveUnlockedLogros.mockRejectedValue(new Error('fail'));

    const result = await syncUnlockedLogros(new Date(2026, 9, 15));
    expect(result).toContain('primer-paso');
  });
});
