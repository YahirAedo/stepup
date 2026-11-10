import { describe, it, expect } from 'vitest';
import { activeDaysRatioLabel, countActiveDays } from './profileActivity';

const TODAY = new Date(2026, 9, 15); // 2026-10-15 (mes 9 = octubre)

describe('countActiveDays', () => {
  it('cuenta dias distintos con al menos un paso', () => {
    const dates = ['2026-10-15', '2026-10-14', '2026-10-12'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(3);
  });

  it('varios pasos el mismo dia cuentan una sola vez', () => {
    const dates = ['2026-10-15', '2026-10-15', '2026-10-15T09:00:00Z'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(1);
  });

  it('incluye el borde de la ventana (hoy y hoy - 6 en 7 dias)', () => {
    const dates = ['2026-10-15', '2026-10-09'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(2);
  });

  it('excluye el dia justo fuera de la ventana', () => {
    expect(countActiveDays(['2026-10-08'], 7, TODAY)).toBe(0);
  });

  it('la ventana de 30 dias llega mas atras que la de 7', () => {
    const dates = ['2026-10-15', '2026-10-09', '2026-09-20'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(2);
    expect(countActiveDays(dates, 30, TODAY)).toBe(3);
  });

  it('ignora fechas invalidas', () => {
    const dates = ['no-es-fecha', '2026-13-40', '2026-10-15'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(1);
  });

  it('ignora fechas futuras', () => {
    expect(countActiveDays(['2026-10-16', '2026-10-15'], 7, TODAY)).toBe(1);
  });

  it('lista vacia da 0', () => {
    expect(countActiveDays([], 7, TODAY)).toBe(0);
  });

  it('ventana no positiva da 0', () => {
    expect(countActiveDays(['2026-10-15'], 0, TODAY)).toBe(0);
    expect(countActiveDays(['2026-10-15'], -3, TODAY)).toBe(0);
  });

  it('no se reinicia por dias sin actividad', () => {
    // Una semana con huecos: los dias activos se suman igual, no se resetean.
    const dates = ['2026-10-15', '2026-10-11', '2026-10-10'];
    expect(countActiveDays(dates, 7, TODAY)).toBe(3);
  });
});

describe('activeDaysRatioLabel', () => {
  it('arma "X de Y"', () => {
    expect(activeDaysRatioLabel(4, 7)).toBe('4 de 7');
    expect(activeDaysRatioLabel(0, 7)).toBe('0 de 7');
    expect(activeDaysRatioLabel(12, 30)).toBe('12 de 30');
  });
});
