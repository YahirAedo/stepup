import { describe, it, expect } from 'vitest';
import { formatDateShort } from './formatDateShort';

describe('formatDateShort', () => {
  it('null → null', () => {
    expect(formatDateShort(null)).toBeNull();
  });

  it('fecha sin hora YYYY-MM-DD → dd/mm/aaaa sin desplazamiento de zona horaria', () => {
    expect(formatDateShort('2026-10-27')).toBe('27/10/2026');
  });

  it('ISO con fecha y hora → dd/mm/aaaa en hora local', () => {
    expect(formatDateShort('2026-10-20T12:00:00Z')).toBe('20/10/2026');
  });

  it('string inválida → null', () => {
    expect(formatDateShort('no-es-una-fecha')).toBeNull();
  });
});
