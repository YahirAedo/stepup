import { describe, it, expect } from 'vitest';
import { appendProposedNames } from './appendProposedNames';

describe('appendProposedNames', () => {
  it('vacío + vacío', () => {
    expect(appendProposedNames([], [])).toEqual([]);
  });

  it('agrega nuevos y dedupe (case-insensitive, trim)', () => {
    const r = appendProposedNames(['Paso A'], ['paso a', 'Paso B', '  Paso C  ']);
    expect(r).toEqual(['Paso A', 'Paso B', 'Paso C']);
  });

  it('supera límite → quedan los últimos', () => {
    const current = Array.from({ length: 24 }, (_, i) => `P${i}`);
    const incoming = ['New1', 'New2', 'New3'];
    const r = appendProposedNames(current, incoming, 24);
    expect(r).toHaveLength(24);
    expect(r[r.length - 1]).toBe('New3');
    expect(r).not.toContain('P0');
  });

  it('check de que está bien retornada', () => {
    expect(appendProposedNames(['A'], ['B'], 2)).toEqual(['A', 'B']);
  });

  it('no muta la entrada', () => {
    const current = ['A', 'B'];
    const incoming = ['C'];
    appendProposedNames(current, incoming);
    expect(current).toEqual(['A', 'B']);
    expect(incoming).toEqual(['C']);
  });

  it('orden: los nuevos se agregan al final, luego recorte mantiene últimos', () => {
    const r = appendProposedNames(['A', 'B', 'C'], ['D', 'E'], 3);
    expect(r).toEqual(['C', 'D', 'E']);
  });
});
