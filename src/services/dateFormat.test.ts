import { describe, expect, it } from 'vitest';
import { parseISODate, toISODate, formatDateForDisplay } from './dateFormat';

describe('dateFormat — helpers de fecha ISO', () => {
  it('toISODate da formato YYYY-MM-DD con padding de mes y día', () => {
    expect(toISODate(new Date(2026, 4, 5))).toBe('2026-05-05');
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('parseISODate y toISODate son inversos (roundtrip)', () => {
    const iso = '2026-08-15';
    expect(toISODate(parseISODate(iso))).toBe(iso);
  });

  it('formatDateForDisplay devuelve string vacío sin fecha', () => {
    expect(formatDateForDisplay('')).toBe('');
  });

  it('formatDateForDisplay formatea en es-AR', () => {
    expect(formatDateForDisplay('2026-08-15')).toContain('sáb');
  });
});
