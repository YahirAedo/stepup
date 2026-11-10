import { describe, it, expect } from 'vitest';
import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import type { TaskListItem } from './buildTasksListModel';
import { getTaskCardAccessibilityLabel } from './getTaskCardAccessibilityLabel';

const item = (overrides: Partial<TaskListItem>): TaskListItem => ({
  id: 1,
  name: 'Tarea',
  category: 'inProgress' as TaskCategory,
  targetDate: null,
  completedAt: null,
  stepCount: 0,
  completedStepCount: 0,
  progress: { kind: 'continuous', proportion: 0 },
  steps: [],
  ...overrides,
});

describe('getTaskCardAccessibilityLabel', () => {
  it('completada → solo nombre y (completada)', () => {
    const i = item({
      category: 'completed',
      stepCount: 3,
      completedStepCount: 3,
      progress: { kind: 'segments', statuses: ['done', 'done', 'done'] },
    });
    expect(getTaskCardAccessibilityLabel(i, true)).toBe('Ver detalles de Tarea (completada)');
  });

  it('con pasos, segmentos → nombre + progreso de pasos', () => {
    const i = item({
      category: 'inProgress',
      stepCount: 5,
      completedStepCount: 2,
      progress: { kind: 'segments', statuses: ['done', 'done', 'pending', 'pending', 'pending'] },
    });
    expect(getTaskCardAccessibilityLabel(i, false)).toBe('Ver detalles de Tarea, 2 de 5 pasos');
  });

  it('con pasos, continuous → nombre + porcentaje', () => {
    const i = item({
      category: 'inProgress',
      stepCount: 20,
      completedStepCount: 5,
      progress: { kind: 'continuous', proportion: 0.25 },
    });
    expect(getTaskCardAccessibilityLabel(i, false)).toBe('Ver detalles de Tarea, 25% completado');
  });

  it('sin pasos → solo nombre, sin progreso', () => {
    const i = item({
      category: 'inProgress',
      stepCount: 0,
      completedStepCount: 0,
      progress: { kind: 'continuous', proportion: 0 },
    });
    expect(getTaskCardAccessibilityLabel(i, false)).toBe('Ver detalles de Tarea');
  });
});
