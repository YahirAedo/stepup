import { describe, it, expect } from 'vitest';
import { dateFromIso, formatDueDate, isoFromDate } from './dueDate';

describe('isoFromDate', () => {
  it('formatea la fecha local como YYYY-MM-DD', () => {
    expect(isoFromDate(new Date(2026, 9, 24))).toBe('2026-10-24');
  });

  it('rellena mes y dia con cero', () => {
    expect(isoFromDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('dateFromIso', () => {
  it('parsea un ISO corto a fecha local', () => {
    const date = dateFromIso('2026-10-24');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(9);
    expect(date?.getDate()).toBe(24);
  });

  it('devuelve null si falta o es invalido', () => {
    expect(dateFromIso(undefined)).toBeNull();
    expect(dateFromIso(null)).toBeNull();
    expect(dateFromIso('')).toBeNull();
    expect(dateFromIso('24/10/2026')).toBeNull();
    expect(dateFromIso('2026-13-01')).toBeNull();
    expect(dateFromIso('2026-02-30')).toBeNull();
  });
});

describe('formatDueDate', () => {
  it('formatea como dd/mm/aaaa', () => {
    expect(formatDueDate('2026-10-24')).toBe('24/10/2026');
    expect(formatDueDate('2026-01-05')).toBe('05/01/2026');
  });

  it('devuelve cadena vacia si falta o es invalido', () => {
    expect(formatDueDate(undefined)).toBe('');
    expect(formatDueDate(null)).toBe('');
    expect(formatDueDate('nope')).toBe('');
  });
});
