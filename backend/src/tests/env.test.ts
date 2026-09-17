import { resolveGeminiApiKey, resolveJwtSecret, GEMINI_MODEL } from '../config/env';

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

describe('Gemini fail-closed', () => {
  it('en producción rechaza key ausente o vacía', () => {
    expect(() => resolveGeminiApiKey(undefined, 'production')).toThrow(/GEMINI_API_KEY/);
    expect(() => resolveGeminiApiKey('   ', 'production')).toThrow(/GEMINI_API_KEY/);
  });

  it('en test permite un fallback sin key', () => {
    expect(resolveGeminiApiKey(undefined, 'test')).toBe('test-gemini-key');
  });

  it('acepta una key real', () => {
    expect(resolveGeminiApiKey('AIzaSy-test-key', 'production')).toBe('AIzaSy-test-key');
  });
});

describe('Gemini model resolution', () => {
  it('default es gemini-3.5-flash cuando no hay variable de entorno', () => {
    expect(GEMINI_MODEL).toBe('gemini-3.5-flash');
  });

  it('el modelo es un string no vacío', () => {
    expect(typeof GEMINI_MODEL).toBe('string');
    expect(GEMINI_MODEL.length).toBeGreaterThan(0);
  });

  it('el modelo sigue el patrón de nomenclatura de Google', () => {
    expect(GEMINI_MODEL).toMatch(/^gemini-\d+\.\d+-flash/);
  });
});
