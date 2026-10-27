import { describe, it, expect } from 'vitest';
import { reconcileTaskStatus } from './reconcileTaskStatus';

describe('reconcileTaskStatus', () => {
  it('tarea sin pasos → active + NULL', () => {
    expect(reconcileTaskStatus([])).toEqual({ status: 'active', completed_at: null });
  });

  it('todos pasos completados con timestamps → completed + max completed_at', () => {
    const steps = [
      { status: 'completed' as const, completed_at: '2026-10-20T10:00:00Z' },
      { status: 'completed' as const, completed_at: '2026-10-20T12:00:00Z' },
      { status: 'completed' as const, completed_at: '2026-10-20T11:00:00Z' },
    ];
    expect(reconcileTaskStatus(steps)).toEqual({ status: 'completed', completed_at: '2026-10-20T12:00:00Z' });
  });

  it('algún paso pendiente → active + NULL', () => {
    const steps = [
      { status: 'completed' as const, completed_at: '2026-10-20T10:00:00Z' },
      { status: 'pending' as const, completed_at: null },
    ];
    expect(reconcileTaskStatus(steps)).toEqual({ status: 'active', completed_at: null });
  });

  it('un paso completado sin completed_at (NULL) → active + NULL', () => {
    const steps = [
      { status: 'completed' as const, completed_at: null },
      { status: 'completed' as const, completed_at: '2026-10-20T10:00:00Z' },
    ];
    expect(reconcileTaskStatus(steps)).toEqual({ status: 'active', completed_at: null });
  });

  it('un solo paso completado → completed + su completed_at', () => {
    const steps = [
      { status: 'completed' as const, completed_at: '2026-10-20T10:00:00Z' },
    ];
    expect(reconcileTaskStatus(steps)).toEqual({ status: 'completed', completed_at: '2026-10-20T10:00:00Z' });
  });

  it('un solo paso pendiente → active + NULL', () => {
    const steps = [
      { status: 'pending' as const, completed_at: null },
    ];
    expect(reconcileTaskStatus(steps)).toEqual({ status: 'active', completed_at: null });
  });
});