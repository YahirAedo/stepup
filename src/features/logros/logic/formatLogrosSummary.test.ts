import { describe, it, expect } from 'vitest';
import { formatLogrosSummary } from './formatLogrosSummary';

describe('formatLogrosSummary', () => {
  it('arma "X de Y"', () => {
    expect(formatLogrosSummary(3, 8)).toBe('3 de 8');
    expect(formatLogrosSummary(0, 8)).toBe('0 de 8');
  });
});
