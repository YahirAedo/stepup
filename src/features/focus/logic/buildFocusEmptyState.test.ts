import { describe, expect, it } from 'vitest';
import { buildFocusEmptyState } from './buildFocusEmptyState';

type Candidate = { task: { id: number }; steps: Array<{ status: 'pending' | 'completed' }> };

const c = (id: number, steps: Array<{ status: 'pending' | 'completed' }>): Candidate => ({
  task: { id },
  steps,
});

describe('buildFocusEmptyState', () => {
  it('lista vacía => no-tasks', () => {
    expect(buildFocusEmptyState([])).toEqual({ kind: 'no-tasks' });
  });

  it('una sola tarea sin pasos => needs-steps', () => {
    expect(buildFocusEmptyState([c(1, [])])).toEqual({ kind: 'needs-steps', taskIds: [1] });
  });

  it('tarea sin pasos más una completada => needs-steps', () => {
    expect(buildFocusEmptyState([c(1, []), c(2, [{ status: 'completed' }])])).toEqual({
      kind: 'needs-steps',
      taskIds: [1],
    });
  });

  it('solo completadas => all-done', () => {
    expect(buildFocusEmptyState([c(1, [{ status: 'completed' }])])).toEqual({ kind: 'all-done' });
  });

  it('hay un paso pendiente => null', () => {
    expect(buildFocusEmptyState([c(1, [{ status: 'pending' }])])).toBeNull();
  });

  it('varias sin pasos conservan el orden', () => {
    expect(buildFocusEmptyState([c(3, []), c(1, []), c(2, [])])).toEqual({
      kind: 'needs-steps',
      taskIds: [3, 1, 2],
    });
  });

  it('tarea con todos los pasos completados más otra sin pasos => needs-steps', () => {
    expect(
      buildFocusEmptyState([
        c(1, [{ status: 'completed' }, { status: 'completed' }]),
        c(2, []),
      ]),
    ).toEqual({ kind: 'needs-steps', taskIds: [2] });
  });
});