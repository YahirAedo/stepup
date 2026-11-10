import { describe, it, expect } from 'vitest';
import { buildCompletedSummary } from './buildCompletedSummary';
import type { Task, Step } from '../../../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    name: 'Tarea prueba',
    description: null,
    due_date: null,
    status: 'completed',
    created_at: '2026-01-01T00:00:00.000Z',
    completed_at: '2026-01-02T00:00:00.000Z',
    server_id: null,
    dirty: 0,
    updated_at: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}

function makeStep(overrides: Partial<Step> = {}): Step {
  return {
    id: 1,
    task_id: 1,
    name: 'Paso prueba',
    duration_min: 5,
    order_index: 0,
    status: 'completed',
    completed_at: null,
    completed_date: null,
    server_id: null,
    dirty: 0,
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildCompletedSummary', () => {
  it('todos completados', () => {
    const task = makeTask({ name: 'Terminar informe' });
    const steps = [
      makeStep({ id: 1, duration_min: 5, status: 'completed' }),
      makeStep({ id: 2, duration_min: 10, status: 'completed' }),
    ];
    const summary = buildCompletedSummary(task, steps);
    expect(summary.taskName).toBe('Terminar informe');
    expect(summary.stepsCompleted).toBe(2);
    expect(summary.totalMinutes).toBe(15);
    expect(summary.stepsLabel).toBe('2 pasos');
  });

  it('mezcla de completados y pendientes (solo cuentan los completados)', () => {
    const task = makeTask();
    const steps = [
      makeStep({ id: 1, duration_min: 5, status: 'completed' }),
      makeStep({ id: 2, duration_min: 10, status: 'pending' }),
      makeStep({ id: 3, duration_min: 7, status: 'completed' }),
    ];
    const summary = buildCompletedSummary(task, steps);
    expect(summary.stepsCompleted).toBe(2);
    expect(summary.totalMinutes).toBe(12);
    expect(summary.stepsLabel).toBe('2 pasos');
  });

  it('duration_min null se trata como 0', () => {
    const task = makeTask();
    const steps = [
      makeStep({ id: 1, duration_min: null, status: 'completed' }),
      makeStep({ id: 2, duration_min: 5, status: 'completed' }),
    ];
    const summary = buildCompletedSummary(task, steps);
    expect(summary.stepsCompleted).toBe(2);
    expect(summary.totalMinutes).toBe(5);
  });

  it('lista de pasos vacía → 0 pasos, 0 minutos', () => {
    const task = makeTask({ name: 'Sin pasos' });
    const summary = buildCompletedSummary(task, []);
    expect(summary.taskName).toBe('Sin pasos');
    expect(summary.stepsCompleted).toBe(0);
    expect(summary.totalMinutes).toBe(0);
    expect(summary.stepsLabel).toBe('0 pasos');
  });
});
