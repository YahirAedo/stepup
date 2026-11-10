import { describe, it, expect } from 'vitest';
import { validateLogin } from './validateLogin';

describe('validateLogin', () => {
  it('devuelve null cuando email y password están completos', () => {
    expect(validateLogin('a@b.com', 'secreto')).toBeNull();
  });

  it('devuelve empty si el email está vacío (con trim)', () => {
    expect(validateLogin('   ', 'secreto')).toBe('empty');
  });

  it('devuelve empty si la contraseña está vacía', () => {
    expect(validateLogin('a@b.com', '')).toBe('empty');
  });
});
