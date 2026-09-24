import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { formatModifiedAt, statusLabel } from '../utils/syncConflict';

describe('formatModifiedAt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formatea fecha de hoy como "Hoy, HH:MM"', () => {
    vi.setSystemTime(new Date('2026-09-21T15:30:00'));
    const result = formatModifiedAt('2026-09-21T14:45:00');
    expect(result).toBe('Hoy, 14:45');
  });

  it('formatea fecha de ayer como "Ayer, HH:MM"', () => {
    vi.setSystemTime(new Date('2026-09-21T10:00:00'));
    const result = formatModifiedAt('2026-09-20T16:30:00');
    expect(result).toBe('Ayer, 16:30');
  });

  it('formatea fecha anterior como "DD/MM, HH:MM"', () => {
    vi.setSystemTime(new Date('2026-09-21T10:00:00'));
    const result = formatModifiedAt('2026-09-15T09:15:00');
    expect(result).toBe('15/09, 09:15');
  });

  it('maneja fechas de meses anteriores', () => {
    vi.setSystemTime(new Date('2026-09-21T10:00:00'));
    const result = formatModifiedAt('2026-08-10T12:00:00');
    expect(result).toBe('10/08, 12:00');
  });
});

describe('statusLabel', () => {
  it('traduce "completed" a "Completada"', () => {
    expect(statusLabel('completed')).toBe('Completada');
  });

  it('traduce "active" a "Activa"', () => {
    expect(statusLabel('active')).toBe('Activa');
  });

  it('traduce "pending" a "Pendiente"', () => {
    expect(statusLabel('pending')).toBe('Pendiente');
  });

  it('retorna el status original si no es reconocido', () => {
    expect(statusLabel('unknown')).toBe('unknown');
    expect(statusLabel('custom-status')).toBe('custom-status');
  });

  it('es case-sensitive', () => {
    expect(statusLabel('Completed')).toBe('Completed');
    expect(statusLabel('ACTIVE')).toBe('ACTIVE');
  });
});
