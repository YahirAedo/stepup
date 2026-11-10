import { describe, it, expect } from 'vitest';
import { resolveStepIds } from './resolveStepIds';

describe('resolveStepIds', () => {
  it('solo originales → mapa con sus ids', () => {
    const original = [
      { key: 's1', id: 1 },
      { key: 's2', id: 2 },
    ];
    const map = resolveStepIds(original, ['s1', 's2'], []);
    expect(map.get('s1')).toBe(1);
    expect(map.get('s2')).toBe(2);
    expect(map.size).toBe(2);
  });

  it('originales + nuevos intercalados (orden respeta finalOrder)', () => {
    const original = [{ key: 's1', id: 1 }];
    const map = resolveStepIds(original, ['s1', 'new-1', 'new-2'], [10, 11]);
    expect(map.get('s1')).toBe(1);
    expect(map.get('new-1')).toBe(10);
    expect(map.get('new-2')).toBe(11);
  });

  it('más claves nuevas que ids → las que sobran no se incluyen', () => {
    const original = [{ key: 's1', id: 1 }];
    const map = resolveStepIds(original, ['s1', 'new-1', 'new-2', 'new-3'], [10]);
    expect(map.get('new-1')).toBe(10);
    expect(map.has('new-2')).toBe(false);
    expect(map.has('new-3')).toBe(false);
  });

  it('sin nuevos → solo originales', () => {
    const original = [
      { key: 's1', id: 1 },
      { key: 's2', id: 2 },
    ];
    const map = resolveStepIds(original, ['s2', 's1'], []);
    expect(map.get('s2')).toBe(2);
    expect(map.get('s1')).toBe(1);
    expect(map.size).toBe(2);
  });

  it('finalOrder vacío → mapa vacío', () => {
    const original = [{ key: 's1', id: 1 }];
    const map = resolveStepIds(original, [], [10]);
    expect(map.size).toBe(0);
  });

  it('no muta la entrada', () => {
    const original = [{ key: 's1', id: 1 }];
    const finalOrder = ['s1', 'new-1'];
    const newIds = [10];
    const origCopy = [...original];
    const finalCopy = [...finalOrder];
    const newCopy = [...newIds];
    resolveStepIds(original, finalOrder, newIds);
    expect(original).toEqual(origCopy);
    expect(finalOrder).toEqual(finalCopy);
    expect(newIds).toEqual(newCopy);
  });
});
