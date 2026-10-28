import { describe, it, expect } from 'vitest';
import { formatTaskCount } from './formatTaskCount';

describe('formatTaskCount', () => {
  it('0 → "0 tareas"', () => {
    expect(formatTaskCount(0)).toBe('0 tareas');
  });

  it('1 → "1 tarea" (singular)', () => {
    expect(formatTaskCount(1)).toBe('1 tarea');
  });

  it('2 → "2 tareas" (plural)', () => {
    expect(formatTaskCount(2)).toBe('2 tareas');
  });

  it('N → "N tareas" (plural)', () => {
    expect(formatTaskCount(10)).toBe('10 tareas');
  });
});
