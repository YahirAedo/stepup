import { describe, expect, it } from 'vitest';
import { pickFocusTask } from './pickFocusTask';

type Candidate = { task: { id: number }; steps: Array<{ status: 'pending' | 'completed' }> };

const candidate = (id: number, statuses: Array<'pending' | 'completed'>): Candidate => ({
  task: { id },
  steps: statuses.map((status) => ({ status })),
});

describe('pickFocusTask', () => {
  it('lista vacía => null', () => {
    expect(pickFocusTask([], null)).toBeNull();
  });

  it('todas sin pasos => null', () => {
    const candidates = [candidate(1, []), candidate(2, [])];
    expect(pickFocusTask(candidates, null)).toBeNull();
  });

  it('todas con pasos solo completados => null', () => {
    const candidates = [candidate(1, ['completed']), candidate(2, ['completed'])];
    expect(pickFocusTask(candidates, null)).toBeNull();
  });

  it('salta tareas sin pendientes y toma la primera con pendiente', () => {
    const candidates = [candidate(1, ['completed']), candidate(2, ['pending']), candidate(3, ['pending'])];
    const result = pickFocusTask(candidates, null);
    expect(result?.task.id).toBe(2);
  });

  it('manual con pendientes gana sobre la primera', () => {
    const candidates = [candidate(1, ['pending']), candidate(2, ['pending'])];
    const result = pickFocusTask(candidates, 2);
    expect(result?.task.id).toBe(2);
  });

  it('manual sin pendientes cae al default', () => {
    const candidates = [candidate(1, ['pending']), candidate(2, ['completed'])];
    const result = pickFocusTask(candidates, 2);
    expect(result?.task.id).toBe(1);
  });

  it('manual inexistente cae al default', () => {
    const candidates = [candidate(1, ['pending']), candidate(2, ['pending'])];
    const result = pickFocusTask(candidates, 999);
    expect(result?.task.id).toBe(1);
  });

  it('manual null = default', () => {
    const candidates = [candidate(1, ['completed']), candidate(2, ['pending'])];
    const result = pickFocusTask(candidates, null);
    expect(result?.task.id).toBe(2);
  });
});
