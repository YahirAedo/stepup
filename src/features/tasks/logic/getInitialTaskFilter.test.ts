import { describe, expect, it } from 'vitest';
import { getInitialTaskFilter } from './getInitialTaskFilter';
import { buildTasksListModel } from './buildTasksListModel';
import type { Task, Step } from '../../../types';

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

describe('getInitialTaskFilter', () => {
  it('prioriza En curso si tiene tareas', () => {
    const tasks = [task({ id: 1 })];
    const steps = [step({ id: 1, task_id: 1, status: 'completed' }), step({ id: 2, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    expect(getInitialTaskFilter(model)).toBe('inProgress');
  });

  it('si no hay En curso, usa Por empezar', () => {
    const tasks = [task({ id: 1 })];
    const steps = [step({ id: 1, task_id: 1, status: 'pending' })];
    const model = buildTasksListModel(tasks, steps);
    expect(getInitialTaskFilter(model)).toBe('notStarted');
  });

  it('si solo hay Completadas, usa Completadas', () => {
    const tasks = [task({ id: 1 })];
    const steps = [step({ id: 1, task_id: 1, status: 'completed' })];
    const model = buildTasksListModel(tasks, steps);
    expect(getInitialTaskFilter(model)).toBe('completed');
  });

  it('si no hay tareas, usa En curso', () => {
    const model = buildTasksListModel([], []);
    expect(getInitialTaskFilter(model)).toBe('inProgress');
  });
});