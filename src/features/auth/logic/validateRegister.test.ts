import { describe, it, expect } from 'vitest';
import { validateRegister } from './validateRegister';

describe('validateRegister', () => {
  it('devuelve null cuando todos los campos son válidos', () => {
    expect(validateRegister('Ana', 'a@b.com', 'secreto123')).toBeNull();
  });

  it('devuelve empty si falta algún campo', () => {
    expect(validateRegister('', 'a@b.com', 'secreto123')).toBe('empty');
    expect(validateRegister('Ana', '   ', 'secreto123')).toBe('empty');
    expect(validateRegister('Ana', 'a@b.com', '')).toBe('empty');
  });

  it('devuelve short si la contraseña tiene menos de 8 caracteres', () => {
    expect(validateRegister('Ana', 'a@b.com', '1234567')).toBe('short');
  });

  it('devuelve long si la contraseña supera 72 bytes', () => {
    const longPassword = 'ñ'.repeat(37);
    expect(new TextEncoder().encode(longPassword).length).toBeGreaterThan(72);
    expect(validateRegister('Ana', 'a@b.com', longPassword)).toBe('long');
  });

  it('acepta una contraseña de exactamente 72 bytes', () => {
    const password = 'a'.repeat(72);
    expect(validateRegister('Ana', 'a@b.com', password)).toBeNull();
  });
});
