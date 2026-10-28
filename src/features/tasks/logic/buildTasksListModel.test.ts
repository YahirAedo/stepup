import { describe, it, expect } from 'vitest';
import type { Step, Task } from '../../../types';
import { buildTasksListModel } from './buildTasksListModel';

const task = (overrides: Partial<Task>): Task => ({
  id: 0,
  name: 'Tarea',
  description: null,
  due_date: null,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  completed_at: null,
  server_id: null,
  dirty: 0,
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const step = (overrides: Partial<Step>): Step => ({
  id: 0,
  task_id: 0,
  name: 'Paso',
  duration_min: null,
  order_index: 0,
  status: 'pending',
  completed_at: null,
  completed_date: null,
  server_id: null,
  dirty: 0,
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('buildTasksListModel', () => {
  it('categoría derivada de pasos, no de tasks.status', () => {
    const tasks = [
      task({ id: 1, status: 'completed', name: 'Completada por status' }),
      task({ id: 2, status: 'active', name: 'Activa por status' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'pending' }),
      step({ id: 2, task_id: 2, status: 'completed' }),
      step({ id: 3, task_id: 2, status: 'pending' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    expect(model.items.find((i) => i.id === 1)?.category).toBe('notStarted');
    expect(model.items.find((i) => i.id === 2)?.category).toBe('inProgress');
  });

  it('conteos por filtro', () => {
    const tasks = [
      task({ id: 1, name: 'En curso' }),
      task({ id: 2, name: 'Por empezar' }),
      task({ id: 3, name: 'Completada' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
      step({ id: 3, task_id: 2, status: 'pending' }),
      step({ id: 4, task_id: 3, status: 'completed' }),
      step({ id: 5, task_id: 3, status: 'completed' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    expect(model.counts).toEqual({ inProgress: 1, notStarted: 1, completed: 1 });
  });

  it('"Continuar" cuenta dentro del conteo de En curso', () => {
    const tasks = [task({ id: 1, name: 'Tarea en foco' })];
    const steps = [step({ id: 1, task_id: 1, status: 'completed' }), step({ id: 2, task_id: 1, status: 'pending' })];

    const model = buildTasksListModel(tasks, steps);

    expect(model.focusIndex).toBe(0);
    expect(model.counts.inProgress).toBe(1);
  });

  it('tarea sin pasos → categoría notStarted y fuera del foco', () => {
    const tasks = [
      task({ id: 1, name: 'Sin pasos' }),
      task({ id: 2, name: 'Con pasos' }),
    ];
    const steps = [step({ id: 1, task_id: 2, status: 'pending' })];

    const model = buildTasksListModel(tasks, steps);

    const sinPasos = model.items.find((i) => i.id === 1);
    expect(sinPasos?.category).toBe('notStarted');
    expect(model.focusIndex).toBe(1);
  });

  it('completadas muestran completed_at; si es null → REQUIERE MIGRACIÓN, sin backfill', () => {
    const tasks = [
      task({ id: 1, status: 'completed', completed_at: '2026-10-20T12:00:00Z' }),
      task({ id: 2, status: 'completed', completed_at: null }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed' }),
      step({ id: 2, task_id: 1, status: 'completed' }),
      step({ id: 3, task_id: 2, status: 'completed' }),
      step({ id: 4, task_id: 2, status: 'completed' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    const conFecha = model.items.find((i) => i.id === 1);
    const sinFecha = model.items.find((i) => i.id === 2);
    expect(conFecha?.completedAt).toBe('2026-10-20T12:00:00Z');
    expect(sinFecha?.completedAt).toBeNull();
  });

  it('lista vacía → conteos en cero y foco null', () => {
    const model = buildTasksListModel([], []);

    expect(model.counts).toEqual({ inProgress: 0, notStarted: 0, completed: 0 });
    expect(model.focusIndex).toBeNull();
  });
});
