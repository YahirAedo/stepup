import { describe, it, expect } from 'vitest';
import { formatLastSync } from './formatLastSync';

describe('formatLastSync', () => {
  const now = new Date('2026-10-15T12:00:00');

  it('devuelve Nunca si iso es null', () => {
    expect(formatLastSync(null, now)).toBe('Nunca');
  });

  it('devuelve Recién ahora si pasó menos de 1 minuto', () => {
    const iso = new Date(now.getTime() - 30_000).toISOString();
    expect(formatLastSync(iso, now)).toBe('Recién ahora');
  });

  it('devuelve Hace N min si pasó menos de 1 hora', () => {
    const iso = new Date(now.getTime() - 5 * 60_000).toISOString();
    expect(formatLastSync(iso, now)).toBe('Hace 5 min');
  });

  it('devuelve Hace N h si pasó menos de 24 horas', () => {
    const iso = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatLastSync(iso, now)).toBe('Hace 3 h');
  });

  it('devuelve Ayer si pasó entre 24 y 48 horas', () => {
    const iso = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
    expect(formatLastSync(iso, now)).toBe('Ayer');
  });

  it('devuelve Hace N días si pasó 2 días o más', () => {
    const iso = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatLastSync(iso, now)).toBe('Hace 3 días');
  });
});
