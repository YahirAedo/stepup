import { describe, expect, it } from 'vitest';
import { ringProgress, ringDashOffset } from './ringProgress';

describe('ringProgress', () => {
  it('casos', () => {
    expect(ringProgress(10, 10)).toBe(0);
    expect(ringProgress(5, 10)).toBe(0.5);
    expect(ringProgress(0, 10)).toBe(1);
    expect(ringProgress(5, 0)).toBe(0);
    expect(ringProgress(12, 10)).toBe(0);
    expect(ringProgress(-3, 10)).toBe(1);
  });
});

describe('ringDashOffset', () => {
  it('casos', () => {
    const r = 84;
    const c = 2 * Math.PI * r;
    expect(ringDashOffset(1, r)).toBeCloseTo(0);
    expect(ringDashOffset(0, r)).toBeCloseTo(c);
  });
});
