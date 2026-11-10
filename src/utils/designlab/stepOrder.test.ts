import { describe, it, expect } from 'vitest';
import { moveToPosition } from './stepOrder';

describe('moveToPosition', () => {
  it('no-op cuando no hay toque (targetId null)', () => {
    const r = moveToPosition(['a', 'b', 'c'], null, null, []);
    expect(r.order).toEqual(['a', 'b', 'c']);
    expect(r.selectedId).toBeNull();
  });

  it('no-op cuando el destino está bloqueado', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'a', 'c', ['c']);
    expect(r.order).toEqual(['a', 'b', 'c']);
    expect(r.selectedId).toBe('a');
  });

  it('selecciona el tocado cuando no hay elegido', () => {
    const r = moveToPosition(['a', 'b', 'c'], null, 'b', []);
    expect(r.order).toEqual(['a', 'b', 'c']);
    expect(r.selectedId).toBe('b');
  });

  it('suelta cuando se toca el mismo elegido', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'a', 'a', []);
    expect(r.order).toEqual(['a', 'b', 'c']);
    expect(r.selectedId).toBeNull();
  });

  it('baja: elegido al final, los demás se corren', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'a', 'c', []);
    expect(r.order).toEqual(['b', 'c', 'a']);
    expect(r.selectedId).toBe('a');
  });

  it('sube: elegido al inicio, los demás se corren', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'c', 'a', []);
    expect(r.order).toEqual(['c', 'a', 'b']);
    expect(r.selectedId).toBe('c');
  });

  it('extremos: primero al último y último al primero', () => {
    const r1 = moveToPosition(['a', 'b', 'c', 'd'], 'a', 'd', []);
    expect(r1.order).toEqual(['b', 'c', 'd', 'a']);
    const r2 = moveToPosition(['a', 'b', 'c', 'd'], 'd', 'a', []);
    expect(r2.order).toEqual(['d', 'a', 'b', 'c']);
  });

  it('completados intercalados (locked): pendientes se reordenan entre sus posiciones', () => {
    // a y c están completados (locked), b y d son pendientes
    const r = moveToPosition(['a', 'b', 'c', 'd'], 'b', 'd', ['a', 'c']);
    expect(r.order).toEqual(['a', 'd', 'c', 'b']);
    expect(r.selectedId).toBe('b');
  });

  it('completados intercalados: subir pendiente entre locked', () => {
    const r = moveToPosition(['a', 'b', 'c', 'd'], 'd', 'b', ['a', 'c']);
    expect(r.order).toEqual(['a', 'd', 'c', 'b']);
  });

  it('lista de 2: intercambio efectivo por movimiento', () => {
    const r = moveToPosition(['a', 'b'], 'a', 'b', []);
    expect(r.order).toEqual(['b', 'a']);
    expect(r.selectedId).toBe('a');
  });

  it('lista de 3: mover del medio al final', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'b', 'c', []);
    expect(r.order).toEqual(['a', 'c', 'b']);
    expect(r.selectedId).toBe('b');
  });

  it('elegido bloqueado no se mueve', () => {
    const r = moveToPosition(['a', 'b', 'c'], 'a', 'b', ['a']);
    expect(r.order).toEqual(['a', 'b', 'c']);
    expect(r.selectedId).toBe('a');
  });

  it('ids inexistentes: no-op', () => {
    const r = moveToPosition(['a', 'b'], 'x', 'b', []);
    expect(r.order).toEqual(['a', 'b']);
    expect(r.selectedId).toBe('x');
  });
});
