import { describe, it, expect } from 'vitest';
import { reorderSteps, buildReorderOrder } from './reorderSteps';

const step = (id: number, status: 'pending' | 'completed', pendingDelete?: boolean) => ({
  id,
  status,
  pendingDelete,
});

describe('reorderSteps', () => {
  it('mover 0→2 en 4 pendientes: el paso 0 toma el lugar del 2, los demás se corren', () => {
    const steps = [step(1, 'pending'), step(2, 'pending'), step(3, 'pending'), step(4, 'pending')];
    expect(reorderSteps(steps, 0, 2)).toEqual([2, 3, 1, 4]);
  });

  it('mover 2→0: el paso 2 va al principio', () => {
    const steps = [step(1, 'pending'), step(2, 'pending'), step(3, 'pending')];
    expect(reorderSteps(steps, 2, 0)).toEqual([3, 1, 2]);
  });

  it('mover al mismo índice: orden sin cambios', () => {
    const steps = [step(1, 'pending'), step(2, 'pending'), step(3, 'pending')];
    expect(reorderSteps(steps, 1, 1)).toEqual([1, 2, 3]);
  });

  it('completados quedan anclados en su lugar', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'completed'),
      step(3, 'pending'),
      step(4, 'completed'),
      step(5, 'pending'),
    ];
    // Solo los 3 pendientes (1, 3, 5) se reordenan; completados (2, 4) se quedan fuera
    expect(reorderSteps(steps, 0, 2)).toEqual([3, 5, 1]);
  });

  it('borrados quedan fuera de la lista resultante', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'pending', true),
      step(3, 'pending'),
    ];
    expect(reorderSteps(steps, 0, 1)).toEqual([3, 1]);
  });

  it('lista vacía → vacío', () => {
    expect(reorderSteps([], 0, 0)).toEqual([]);
  });

  it('un solo pendiente → mismo arreglo', () => {
    const steps = [step(1, 'pending')];
    expect(reorderSteps(steps, 0, 0)).toEqual([1]);
  });

  it('target fuera de rango → clampeado', () => {
    const steps = [step(1, 'pending'), step(2, 'pending'), step(3, 'pending')];
    expect(reorderSteps(steps, 0, 10)).toEqual([2, 3, 1]);
    expect(reorderSteps(steps, 2, -5)).toEqual([3, 1, 2]);
  });
});

describe('buildReorderOrder', () => {
  it('caso simple: sin completados ni borrados, mover 1→3', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'pending'),
      step(3, 'pending'),
      step(4, 'pending'),
    ];
    // pendingNotDeleted = [1,2,3,4]; mover id 1 (índice 0) a posición de id 3 (índice 2)
    // reorderSteps([1,2,3,4], 0, 2) → [2, 3, 1, 4]
    expect(buildReorderOrder(steps, 1, 3, [])).toEqual([2, 3, 1, 4]);
  });

  it('completados en el medio quedan en su índice', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'completed'),
      step(3, 'pending'),
      step(4, 'pending'),
    ];
    expect(buildReorderOrder(steps, 1, 3, [])).toEqual([3, 2, 1, 4]);
  });

  it('borrados en su lugar', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'pending'),
      step(3, 'pending'),
      step(4, 'pending'),
    ];
    expect(buildReorderOrder(steps, 1, 4, [2])).toEqual([3, 2, 4, 1]);
  });

  it('mover 0→2 con completados intercalados', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'completed'),
      step(3, 'pending'),
      step(4, 'pending'),
      step(5, 'completed'),
    ];
    expect(buildReorderOrder(steps, 1, 4, [])).toEqual([3, 2, 4, 1, 5]);
  });

  it('deshacer devuelve el orden completo original', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'pending'),
      step(3, 'pending'),
      step(4, 'pending'),
    ];
    const original = steps.map((s) => s.id);
    const reordered = buildReorderOrder(steps, 1, 3, []);
    expect(reordered).not.toEqual(original);
    expect(original).toEqual([1, 2, 3, 4]);
  });

  it('excluir un id que no existe → se ignora', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'pending'),
      step(3, 'pending'),
    ];
    expect(buildReorderOrder(steps, 1, 3, [99])).toEqual([2, 3, 1]);
  });

  it('todos excluidos → lista completa con ids originales', () => {
    const steps = [step(1, 'pending'), step(2, 'pending')];
    expect(buildReorderOrder(steps, 1, 2, [1, 2])).toEqual([1, 2]);
  });

  it('completados quedan en su índice', () => {
    const steps = [
      step(1, 'pending'),
      step(2, 'completed'),
      step(3, 'pending'),
    ];
    expect(buildReorderOrder(steps, 1, 3, [])).toEqual([3, 2, 1]);
  });
});
