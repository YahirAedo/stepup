import { describe, it, expect } from 'vitest';
import { resolveCompletedDay } from './completedDay';

describe('resolveCompletedDay', () => {
  it('prefiere completed_date cuando está presente', () => {
    expect(resolveCompletedDay('2026-10-10', '2026-10-15T10:00:00.000Z')).toBe('2026-10-10');
  });

  it('deriva el día local a partir de completed_at', () => {
    const iso = new Date(2026, 9, 15, 23, 30).toISOString();
    expect(resolveCompletedDay(null, iso)).toBe('2026-10-15');
  });

  it('devuelve null si ambos son null', () => {
    expect(resolveCompletedDay(null, null)).toBeNull();
  });

  it('devuelve null si completed_at es inválido', () => {
    expect(resolveCompletedDay(null, 'no-es-fecha')).toBeNull();
  });
});
