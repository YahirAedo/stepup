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
  it('tarjeta destacada en su filtro: sí', () => {
    const tasks = [task({ id: 1, name: 'En foco' })];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed', completed_at: '2026-01-01T00:00:00Z' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
    ];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, isEmpty } = getVisibleQueue(model, 'inProgress');
    expect(focusItem?.id).toBe(1);
    expect(isEmpty).toBe(false);
  });

  it('tarjeta destacada en otro filtro: no', () => {
    const tasks = [task({ id: 1, name: 'En foco' })];
    const steps = [
      step({ id: 1, task_id: 1, status: 'completed', completed_at: '2026-01-01T00:00:00Z' }),
      step({ id: 2, task_id: 1, status: 'pending' }),
    ];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, isEmpty } = getVisibleQueue(model, 'notStarted');
    expect(focusItem).toBeNull();
    expect(isEmpty).toBe(true);
  });

  it('una sola tarea por empezar con filtro Activas → vacío', () => {
    const tasks = [task({ id: 1, name: 'Por empezar' })];
    const steps = [step({ id: 1, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, queue, isEmpty } = getVisibleQueue(model, 'inProgress');
    expect(focusItem).toBeNull();
    expect(queue.length).toBe(0);
    expect(isEmpty).toBe(true);
  });

  it('una sola tarea por empezar con filtro Pendientes → la tarjeta', () => {
    const tasks = [task({ id: 1, name: 'Por empezar' })];
    const steps = [step({ id: 1, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    const { focusItem, isEmpty } = getVisibleQueue(model, 'notStarted');
    expect(focusItem?.id).toBe(1);
    expect(isEmpty).toBe(false);
  });
});