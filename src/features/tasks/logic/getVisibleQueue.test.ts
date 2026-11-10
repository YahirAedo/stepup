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
  it('Activas con una tarea En curso → tarjeta y cola vacía', () => {
    const tasks = [task({ id: 1, name: 'En foco' })];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed', completed_at: '2026-01-01T00:00:00Z' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
    ];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'inProgress');
    expect(focusItem?.id).toBe(1);
    expect(queue.length).toBe(0);
    expect(isEmpty).toBe(false);
  });

  it('Activas con varias En curso → tarjeta más el resto en la cola', () => {
    const tasks = [
      task({ id: 1, name: 'En foco' }),
      task({ id: 2, name: 'Otra en curso' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed', completed_at: '2026-01-01T00:00:00Z' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
      step({ id: 3, task_id: 2, status: 'completed', completed_at: '2026-01-02T00:00:00Z' }),
      step({ id: 4, task_id: 2, status: 'pending' }),
    ];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue } = getVisibleQueue(model, 'inProgress');
    expect(focusItem).not.toBeNull();
    expect(queue.length).toBe(1);
  });

  it('Pendientes con una sola tarea Por empezar → focusItem null y la tarea en la cola', () => {
    const tasks = [task({ id: 1, name: 'Por empezar' })];
    const steps = [step({ id: 1, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'notStarted');
    expect(focusItem).toBeNull();
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe(1);
    expect(isEmpty).toBe(false);
  });

  it('Pendientes con varias → todas en la cola en orden', () => {
    const tasks = [
      task({ id: 1, name: 'P1' }),
      task({ id: 2, name: 'P2' }),
    ];
    const steps = [
      step({ id: 1, task_id: 1, status: 'pending' }),
      step({ id: 2, task_id: 2, status: 'pending' }),
    ];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue } = getVisibleQueue(model, 'notStarted');
    expect(focusItem).toBeNull();
    expect(queue.map((i) => i.id)).toEqual([1, 2]);
  });

  it('Pendientes incluye una tarea sin pasos', () => {
    const tasks = [task({ id: 1, name: 'Sin pasos' })];
    const steps: Step[] = [];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue } = getVisibleQueue(model, 'notStarted');
    expect(focusItem).toBeNull();
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe(1);
  });

  it('Completadas → todas en la cola', () => {
    const tasks = [task({ id: 1, name: 'Completada' })];
    const steps = [step({ id: 1, task_id: 1, status: 'completed' })];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue } = getVisibleQueue(model, 'completed');
    expect(focusItem).toBeNull();
    expect(queue.length).toBe(1);
    expect(queue[0]?.id).toBe(1);
  });

  it('Activas con solo una Por empezar → isEmpty true y sin tarjeta', () => {
    const tasks = [task({ id: 1, name: 'Por empezar' })];
    const steps = [step({ id: 1, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'inProgress');
    expect(focusItem).toBeNull();
    expect(queue.length).toBe(0);
    expect(isEmpty).toBe(true);
  });
});