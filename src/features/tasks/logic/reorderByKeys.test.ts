import { describe, expect, it } from 'vitest';
import { reorderByKeys } from './reorderByKeys';

describe('reorderByKeys', () => {
  it('ordena completamente', () => {
    const steps = [
      { key: 'a', name: 'A' },
      { key: 'b', name: 'B' },
      { key: 'c', name: 'C' },
    ];
    expect(reorderByKeys(steps, ['c', 'a', 'b'])).toEqual([
      { key: 'c', name: 'C' },
      { key: 'a', name: 'A' },
      { key: 'b', name: 'B' },
    ]);
  });

  it('ordena parcialmente', () => {
    const steps = [
      { key: 'a', name: 'A' },
      { key: 'b', name: 'B' },
      { key: 'c', name: 'C' },
    ];
    expect(reorderByKeys(steps, ['b', 'a'])).toEqual([
      { key: 'b', name: 'B' },
      { key: 'a', name: 'A' },
      { key: 'c', name: 'C' },
    ]);
  });

  it('ignora key inexistente', () => {
    const steps = [{ key: 'a', name: 'A' }];
    expect(reorderByKeys(steps, ['z', 'a', 'x'])).toEqual([{ key: 'a', name: 'A' }]);
  });

  it('lista vacia', () => {
    expect(reorderByKeys([], ['a'])).toEqual([]);
  });
});
