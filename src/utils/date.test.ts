import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLocalDate, getLocalDateDaysAgo } from './date';

describe('getLocalDate', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
    vi.useRealTimers();
  });

  it('devuelve fecha local en zona UTC', () => {
    process.env.TZ = 'UTC';
    const date = new Date('2026-08-26T12:00:00Z');
    expect(getLocalDate(date)).toBe('2026-08-26');
  });

  it('devuelve fecha local en zona America/Argentina/Buenos_Aires (UTC-3)', () => {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
    const date = new Date('2026-08-26T04:00:00Z');
    expect(getLocalDate(date)).toBe('2026-08-26');
  });

  it('en franja 00:00-02:59 local usa fecha local, no UTC', () => {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
    // 02:00 UTC del 27 agosto = 23:00 local del 26 agosto
    // toISOString().split('T')[0] daría '2026-08-27' (incorrecto!)
    // getLocalDate() debe dar '2026-08-26' (correcto!)
    const date = new Date('2026-08-27T02:00:00Z');
    expect(getLocalDate(date)).toBe('2026-08-26');
  });

  it('usa la fecha actual si no se pasa parámetro', () => {
    process.env.TZ = 'UTC';
    const result = getLocalDate();
    const expected = new Date().toISOString().split('T')[0];
    expect(result).toBe(expected);
  });
});

describe('getLocalDateDaysAgo', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
    vi.useRealTimers();
  });

  it('devuelve fecha de hace N días en zona local', () => {
    process.env.TZ = 'UTC';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-26T12:00:00Z'));

    expect(getLocalDateDaysAgo(0)).toBe('2026-08-26');
    expect(getLocalDateDaysAgo(1)).toBe('2026-08-25');
    expect(getLocalDateDaysAgo(6)).toBe('2026-08-20');
  });

  it('devuelve fecha de hace N días en zona America/Argentina/Buenos_Aires', () => {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-27T04:00:00Z'));

    expect(getLocalDateDaysAgo(0)).toBe('2026-08-27');
    expect(getLocalDateDaysAgo(1)).toBe('2026-08-26');
  });
});
