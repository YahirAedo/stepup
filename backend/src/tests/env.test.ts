import { resolveJwtSecret } from '../config/env';

describe('JWT fail-closed', () => {
  it('en producción rechaza secret ausente', () => {
    expect(() => resolveJwtSecret(undefined, 'production')).toThrow(/JWT_SECRET/);
  });

  it('en producción rechaza el placeholder conocido', () => {
    expect(() => resolveJwtSecret('dev-secret-stepup', 'production')).toThrow(/JWT_SECRET/);
    expect(() => resolveJwtSecret('cambiar-en-produccion', 'production')).toThrow(/JWT_SECRET/);
  });

  it('en test permite un secret de prueba', () => {
    expect(resolveJwtSecret('test-secret-stepup', 'test')).toBe('test-secret-stepup');
  });

  it('acepta un secret real fuera de test', () => {
    expect(resolveJwtSecret('un-secreto-largo-y-unico', 'production')).toBe('un-secreto-largo-y-unico');
  });
});
