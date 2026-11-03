import { describe, it, expect } from 'vitest';
import { getCompleteAllPlan, getReopenAllPlan } from './getCompleteAllPlan';

describe('getCompleteAllPlan', () => {
  it('lista vacía → canComplete false', () => {
    const plan = getCompleteAllPlan([]);
    expect(plan.pendingIds).toEqual([]);
    expect(plan.pendingCount).toBe(0);
    expect(plan.canComplete).toBe(false);
  });

  it('todos pendientes → todos los ids', () => {
    const steps = [
      { id: 1, status: 'pending' as const },
      { id: 2, status: 'pending' as const },
    ];
    const plan = getCompleteAllPlan(steps);
    expect(plan.pendingIds).toEqual([1, 2]);
    expect(plan.pendingCount).toBe(2);
    expect(plan.canComplete).toBe(true);
  });

  it('todos completados → pendingIds vacío, canComplete false', () => {
    const steps = [
      { id: 1, status: 'completed' as const },
      { id: 2, status: 'completed' as const },
    ];
    const plan = getCompleteAllPlan(steps);
    expect(plan.pendingIds).toEqual([]);
    expect(plan.pendingCount).toBe(0);
    expect(plan.canComplete).toBe(false);
  });

  it('mezcla → solo pendientes, en orden', () => {
    const steps = [
      { id: 1, status: 'completed' as const },
      { id: 2, status: 'pending' as const },
      { id: 3, status: 'pending' as const },
    ];
    const plan = getCompleteAllPlan(steps);
    expect(plan.pendingIds).toEqual([2, 3]);
    expect(plan.pendingCount).toBe(2);
    expect(plan.canComplete).toBe(true);
  });

  it('no muta la entrada', () => {
    const steps = [{ id: 1, status: 'pending' as const }];
    const copy = [...steps];
    getCompleteAllPlan(steps);
    expect(steps).toEqual(copy);
  });
});

describe('getReopenAllPlan', () => {
  it('lista vacía → canReopen false', () => {
    const plan = getReopenAllPlan([]);
    expect(plan.completedIds).toEqual([]);
    expect(plan.completedCount).toBe(0);
    expect(plan.canReopen).toBe(false);
  });

  it('todos completados → todos los ids', () => {
    const steps = [
      { id: 1, status: 'completed' as const },
      { id: 2, status: 'completed' as const },
    ];
    const plan = getReopenAllPlan(steps);
    expect(plan.completedIds).toEqual([1, 2]);
    expect(plan.completedCount).toBe(2);
    expect(plan.canReopen).toBe(true);
  });

  it('todos pendientes → vacío, canReopen false', () => {
    const steps = [
      { id: 1, status: 'pending' as const },
      { id: 2, status: 'pending' as const },
    ];
    const plan = getReopenAllPlan(steps);
    expect(plan.completedIds).toEqual([]);
    expect(plan.completedCount).toBe(0);
    expect(plan.canReopen).toBe(false);
  });

  it('mezcla → solo completados, en orden', () => {
    const steps = [
      { id: 1, status: 'pending' as const },
      { id: 2, status: 'completed' as const },
      { id: 3, status: 'completed' as const },
    ];
    const plan = getReopenAllPlan(steps);
    expect(plan.completedIds).toEqual([2, 3]);
    expect(plan.completedCount).toBe(2);
    expect(plan.canReopen).toBe(true);
  });

  it('no muta la entrada', () => {
    const steps = [{ id: 1, status: 'completed' as const }];
    const copy = [...steps];
    getReopenAllPlan(steps);
    expect(steps).toEqual(copy);
  });
});
