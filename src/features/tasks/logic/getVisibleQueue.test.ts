import { describe, it, expect } from 'vitest';
import type { Task, Step } from '../../../types';
import { buildTasksListModel } from './buildTasksListModel';
import { getVisibleQueue } from './getVisibleQueue';

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

describe('getVisibleQueue', () => {
  it('foco en el filtro activo + tarea en otro filtro: cola vacía, isEmpty=false', () => {
    const tasks = [
      task({ id: 1, name: 'En foco' }),
      task({ id: 2, name: 'También en curso' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
      step({ id: 3, task_id: 2, status: 'pending' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'inProgress');

    expect(focusItem?.id).toBe(1);
    expect(queue.length).toBe(0);
    expect(isEmpty).toBe(false);
  });

  it('foco + tarea en otro filtro: cola del filtro actual tiene 1, isEmpty=false', () => {
    const tasks = [
      task({ id: 1, name: 'En foco, inProgress' }),
      task({ id: 2, name: 'En notStarted' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
      step({ id: 3, task_id: 2, status: 'pending' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'notStarted');

    expect(focusItem?.id).toBe(1);
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe(2);
    expect(isEmpty).toBe(false);
  });

  it('sin foco y sin tareas en el filtro: isEmpty=true', () => {
    const tasks = [task({ id: 1, name: 'Completada' })];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed' }),
      step({ id: 2, task_id: 1, status: 'completed' }),
    ];

    const model = buildTasksListModel(tasks, steps);

    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'inProgress');

    expect(focusItem).toBeNull();
    expect(queue.length).toBe(0);
    expect(isEmpty).toBe(true);
  });
});
