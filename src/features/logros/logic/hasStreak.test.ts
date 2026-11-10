import { describe, it, expect } from 'vitest';
import { hasStreak } from './hasStreak';

describe('hasStreak', () => {
  it('detecta 7 días seguidos', () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 9, 1 + i));
      return d.toISOString().slice(0, 10);
    });
    expect(hasStreak(days, 7)).toBe(true);
  });

  it('no detecta con 6 días', () => {
    const days = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 9, 1 + i));
      return d.toISOString().slice(0, 10);
    });
    expect(hasStreak(days, 7)).toBe(false);
  });

  it('no detecta si hay un hueco', () => {
    const days = ['2026-10-01', '2026-10-02', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08'];
    expect(hasStreak(days, 7)).toBe(false);
  });

  it('funciona con días desordenados', () => {
    const days = ['2026-10-05', '2026-10-03', '2026-10-01', '2026-10-04', '2026-10-02', '2026-10-07', '2026-10-06'];
    expect(hasStreak(days, 7)).toBe(true);
  });

  it('cruza mes y año', () => {
    const days = ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04', '2027-01-05'];
    expect(hasStreak(days, 7)).toBe(true);
  });
});
