import { describe, expect, it } from 'vitest';
import { postponeStep, canPostpone } from './postponeStep';

describe('postponeStep', () => {
  it('agrega al final', () => {
    expect(postponeStep([2, 3], 1)).toEqual([2, 3, 1]);
  });

  it('re-posponer mueve al final sin duplicar', () => {
    expect(postponeStep([2, 1, 3], 1)).toEqual([2, 3, 1]);
  });

  it('no muta la entrada', () => {
    const input = [2, 3];
    const result = postponeStep(input, 1);
    expect(input).toEqual([2, 3]);
    expect(result).not.toBe(input);
  });
});

describe('canPostpone', () => {
  it('0, 1, 2 y 5 pendientes', () => {
    expect(canPostpone(0)).toBe(false);
    expect(canPostpone(1)).toBe(false);
    expect(canPostpone(2)).toBe(true);
    expect(canPostpone(5)).toBe(true);
  });
});
