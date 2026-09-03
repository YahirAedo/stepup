import { resolveGeminiApiKey, resolveJwtSecret } from '../config/env';

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
