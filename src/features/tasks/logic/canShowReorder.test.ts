import { describe, it, expect } from 'vitest';
import { canShowReorder } from './canShowReorder';

type StepForReorder = { id: number; status: 'pending' | 'completed' };

describe('canShowReorder', () => {
  it('3 pendientes sin borrados → true', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'pending' },
    ];
    expect(canShowReorder(steps, [])).toBe(true);
  });

  it('2 pendientes → false', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
    ];
    expect(canShowReorder(steps, [])).toBe(false);
  });

  it('1 pendiente → false', () => {
    const steps: StepForReorder[] = [{ id: 1, status: 'pending' }];
    expect(canShowReorder(steps, [])).toBe(false);
  });

  it('0 pasos → false', () => {
    expect(canShowReorder([], [])).toBe(false);
  });

  it('4 pendientes + 1 borrado → 3 pendientes efectivos → true', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'pending' },
      { id: 4, status: 'pending' },
    ];
    expect(canShowReorder(steps, [4])).toBe(true);
  });

  it('3 pendientes + 1 borrado → 2 pendientes efectivos → false', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'pending' },
    ];
    expect(canShowReorder(steps, [3])).toBe(false);
  });

  it('todos completados → false', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'completed' },
      { id: 2, status: 'completed' },
      { id: 3, status: 'completed' },
    ];
    expect(canShowReorder(steps, [])).toBe(false);
  });

  it('mezcla completados y pendientes → solo cuenta pendientes no borrados', () => {
    const steps: StepForReorder[] = [
      { id: 1, status: 'completed' },
      { id: 2, status: 'pending' },
      { id: 3, status: 'pending' },
      { id: 4, status: 'pending' },
    ];
    expect(canShowReorder(steps, [])).toBe(true);
  });
});
