import { describe, expect, it } from 'vitest';
import { formatStepMinutes } from './formatStepMinutes';

describe('formatStepMinutes', () => {
  it('formatea minutos', () => {
    expect(formatStepMinutes(25)).toBe('25 min');
    expect(formatStepMinutes(1)).toBe('1 min');
  });

  it('null o no positivos => Sin duración', () => {
    expect(formatStepMinutes(null)).toBe('Sin duración');
    expect(formatStepMinutes(0)).toBe('Sin duración');
  });
});
