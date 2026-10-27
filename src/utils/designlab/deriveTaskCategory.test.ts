import { describe, it, expect } from 'vitest';
import { deriveTaskCategory, pickFocusTask, type FocusCandidate } from './deriveTaskCategory';

const pending = { status: 'pending' as const };
const done = { status: 'completed' as const };
const completedAt = (at: string) => ({ status: 'completed' as const, completed_at: at });
const waiting = { status: 'pending' as const, completed_at: null };

describe('deriveTaskCategory', () => {
  it('sin pasos es Por empezar', () => {
    expect(deriveTaskCategory([])).toBe('notStarted');
  });

  it('con pasos y ninguno completado es Por empezar', () => {
    expect(deriveTaskCategory([pending, pending])).toBe('notStarted');
  });

  it('con algunos completados es En curso', () => {
    expect(deriveTaskCategory([done, pending, pending])).toBe('inProgress');
  });

  it('con todos completados es Completadas', () => {
    expect(deriveTaskCategory([done, done])).toBe('completed');
  });

  it('agregar un paso a una completada la vuelve En curso', () => {
    expect(deriveTaskCategory([done, done, pending])).toBe('inProgress');
  });
});

describe('pickFocusTask', () => {
  it('sin pasos + con pasos → elige la que tiene pasos', () => {
    const empty = { steps: [] as FocusCandidate['steps'] };
    const withSteps = { steps: [{ status: 'pending' as const }] };
    expect(pickFocusTask([empty, withSteps])).toBe(1);
  });

  it('solo sin pasos → null', () => {
    const empty1 = { steps: [] as FocusCandidate['steps'] };
    const empty2 = { steps: [] as FocusCandidate['steps'] };
    expect(pickFocusTask([empty1, empty2])).toBeNull();
  });

  it('elige la En curso con el paso completado mas reciente', () => {
    const candidates = [
      { steps: [completedAt('2026-10-10T10:00:00Z'), waiting] },
      { steps: [completedAt('2026-10-15T10:00:00Z'), waiting] },
    ];
    expect(pickFocusTask(candidates)).toBe(1);
  });

  it('si no hay En curso, cae en la primera Por empezar', () => {
    const candidates = [
      { steps: [done, done] },
      { steps: [pending] },
      { steps: [pending, pending] },
    ];
    expect(pickFocusTask(candidates)).toBe(1);
  });

  it('sin candidatas devuelve null', () => {
    expect(pickFocusTask([])).toBeNull();
    expect(pickFocusTask([{ steps: [done, done] }])).toBeNull();
  });
});