import { describe, expect, it } from 'vitest';
import { ringProgress, ringDashOffset, ringRemaining } from './ringProgress';

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

describe('ringRemaining', () => {
  it('al arrancar (seconds = total) => 1', () => {
    expect(ringRemaining(10, 10)).toBe(1);
  });
  it('a la mitad => 0.5', () => {
    expect(ringRemaining(5, 10)).toBe(0.5);
  });
  it('al terminar (seconds = 0) => 0', () => {
    expect(ringRemaining(0, 10)).toBe(0);
  });
  it('seconds negativo => 0', () => {
    expect(ringRemaining(-3, 10)).toBe(0);
  });
  it('seconds mayor al total => 1', () => {
    expect(ringRemaining(12, 10)).toBe(1);
  });
  it('totalSeconds = 0 => 0', () => {
    expect(ringRemaining(5, 0)).toBe(0);
  });
  it('totalSeconds negativo => 0', () => {
    expect(ringRemaining(5, -3)).toBe(0);
  });
});
