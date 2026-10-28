import { describe, it, expect } from 'vitest';
import { togglePendingDelete } from './togglePendingDelete';

describe('togglePendingDelete', () => {
  it('agrega un paso nuevo al conjunto', () => {
    expect(togglePendingDelete([], 5)).toEqual([5]);
  });

  it('agrega manteniendo orden ascendente', () => {
    expect(togglePendingDelete([1, 3], 2)).toEqual([1, 2, 3]);
  });

  it('elimina un paso ya en el conjunto (deshacer)', () => {
    expect(togglePendingDelete([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('elimina el único elemento', () => {
    expect(togglePendingDelete([7], 7)).toEqual([]);
  });

  it('alternar dos veces el mismo id devuelve el conjunto original', () => {
    expect(togglePendingDelete(togglePendingDelete([1], 2), 2)).toEqual([1]);
  });

  it('deshacer borrado: agregar y remover mismo id', () => {
    expect(togglePendingDelete(togglePendingDelete([], 5), 5)).toEqual([]);
  });

  it('no muta el arreglo original', () => {
    const original = [1, 3];
    togglePendingDelete(original, 2);
    expect(original).toEqual([1, 3]);
  });
});
