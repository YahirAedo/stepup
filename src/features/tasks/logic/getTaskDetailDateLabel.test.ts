import { describe, it, expect } from 'vitest';
import type { Task } from '../../../types';
import { getTaskDetailDateLabel } from './getTaskDetailDateLabel';

const task = (overrides: Partial<Task>): Task => ({
  id: 1,
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

describe('getTaskDetailDateLabel', () => {
  it('completada con fecha → devuelve fecha de finalización formateada', () => {
    const t = task({ status: 'completed', completed_at: '2026-10-20T12:00:00Z' });
    expect(getTaskDetailDateLabel(t)).toBe('20/10/2026');
  });

  it('completada sin fecha → null (sin backfill)', () => {
    const t = task({ status: 'completed', completed_at: null });
    expect(getTaskDetailDateLabel(t)).toBeNull();
  });

  it('no completada con due_date → devuelve due_date formateado', () => {
    const t = task({ status: 'active', due_date: '2026-11-05' });
    expect(getTaskDetailDateLabel(t)).toBe('05/11/2026');
  });

  it('no completada sin due_date → null (sin "+")', () => {
    const t = task({ status: 'active', due_date: null });
    expect(getTaskDetailDateLabel(t)).toBeNull();
  });
});
