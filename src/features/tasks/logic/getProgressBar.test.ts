import { describe, it, expect } from 'vitest';
import { getProgressBar, getCurrentStepIndex, getFillWidthPercent } from './getProgressBar';

const step = (status: 'pending' | 'completed') => ({ status });

describe('getProgressBar', () => {
  it('sin pasos → continua con proporción 0', () => {
    expect(getProgressBar([])).toEqual({ kind: 'continuous', proportion: 0 });
  });

  it('1 paso pendiente → segmentos, estado pending', () => {
    const result = getProgressBar([step('pending')]);
    expect(result.kind).toBe('segments');
    if (result.kind === 'segments') {
      expect(result.statuses).toEqual(['pending']);
    }
  });

  it('8 pasos completados → segmentos, todos done', () => {
    const result = getProgressBar(Array(8).fill(null).map(() => step('completed')));
    expect(result.kind).toBe('segments');
    if (result.kind === 'segments') {
      expect(result.statuses).toEqual(Array(8).fill('done'));
    }
  });

  it('9 pasos, 3 completados → continua, proporción 1/3', () => {
    const steps = Array(9).fill(null).map(() => step('pending'));
    steps[0] = step('completed');
    steps[1] = step('completed');
    steps[2] = step('completed');
    expect(getProgressBar(steps)).toEqual({ kind: 'continuous', proportion: 1 / 3 });
  });

  it('20 pasos, 5 completados → continua, proporción 0.25', () => {
    const steps = Array(20).fill(null).map(() => step('pending'));
    steps[0] = step('completed');
    steps[1] = step('completed');
    steps[2] = step('completed');
    steps[3] = step('completed');
    steps[4] = step('completed');
    expect(getProgressBar(steps)).toEqual({ kind: 'continuous', proportion: 0.25 });
  });
});

describe('getCurrentStepIndex', () => {
  it('todos pendientes → 0 (primero es el índice 0)', () => {
    expect(getCurrentStepIndex(['pending', 'pending', 'pending'])).toBe(0);
  });

  it('algunos completados → índice del primer pending', () => {
    expect(getCurrentStepIndex(['done', 'done', 'pending', 'pending'])).toBe(2);
  });

  it('todos completados → -1 (no hay pending)', () => {
    expect(getCurrentStepIndex(['done', 'done', 'done'])).toBe(-1);
  });

  it('vacío → -1', () => {
    expect(getCurrentStepIndex([])).toBe(-1);
  });
});

describe('getFillWidthPercent', () => {
  it('continuous 0.25 → 25', () => {
    expect(getFillWidthPercent({ kind: 'continuous', proportion: 0.25 })).toBe(25);
  });

  it('continuous 0 → 0', () => {
    expect(getFillWidthPercent({ kind: 'continuous', proportion: 0 })).toBe(0);
  });

  it('continuous 1 → 100', () => {
    expect(getFillWidthPercent({ kind: 'continuous', proportion: 1 })).toBe(100);
  });

  it('segments → null', () => {
    expect(
      getFillWidthPercent({
        kind: 'segments',
        statuses: ['done', 'pending'],
      }),
    ).toBeNull();
  });
});
