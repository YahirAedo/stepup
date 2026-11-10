import { describe, it, expect } from 'vitest';
import { formatCompletedMeta } from './formatCompletedMeta';

describe('formatCompletedMeta', () => {
  it('con minutos', () => {
    expect(formatCompletedMeta({ stepsLabel: '2 pasos', totalMinutes: 15 })).toBe('2 pasos · ~15 min');
  });
  it('con 0 minutos devuelve solo stepsLabel', () => {
    expect(formatCompletedMeta({ stepsLabel: '3 pasos', totalMinutes: 0 })).toBe('3 pasos');
  });
  it('1 paso', () => {
    expect(formatCompletedMeta({ stepsLabel: '1 paso', totalMinutes: 5 })).toBe('1 paso · ~5 min');
  });
});
