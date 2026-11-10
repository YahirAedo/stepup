import { describe, expect, it } from 'vitest';
import { buildCreatePayload } from './buildCreatePayload';
import type { DraftStep } from '../hooks/draftStep';

const step = (name: string, duration_min: number | null = null): DraftStep => ({
  key: `k-${name}`,
  id: null,
  name,
  duration_min,
  status: 'pending',
});

describe('buildCreatePayload', () => {
  it('recorta título y notas', () => {
    const payload = buildCreatePayload({
      title: '  Hola  ',
      notes: '  mundo  ',
      dueDate: '2026-11-04',
      steps: [],
    });
    expect(payload.input.name).toBe('Hola');
    expect(payload.input.description).toBe('mundo');
    expect(payload.input.due_date).toBe('2026-11-04');
  });

  it('notas vacías van a null', () => {
    expect(buildCreatePayload({ title: 'T', notes: '   ', dueDate: undefined, steps: [] }).input.description).toBeNull();
  });

  it('descarta pasos con nombre vacío', () => {
    const payload = buildCreatePayload({
      title: 'T',
      notes: '',
      dueDate: undefined,
      steps: [step('  '), step('Válido'), step('')],
    });
    expect(payload.steps).toEqual([{ name: 'Válido', duration_min: null }]);
  });

  it('respeta el orden de los pasos', () => {
    const payload = buildCreatePayload({
      title: 'T',
      notes: '',
      dueDate: undefined,
      steps: [step('B', 5), step('A', 3)],
    });
    expect(payload.steps.map((s) => s.name)).toEqual(['B', 'A']);
  });
});
