import { resolveGeminiApiKey, resolveJwtSecret } from '../config/env';

function loadEnvFresh(overrides: Record<string, string | undefined>): typeof import('../config/env') {
  const saved = new Map<string, string | undefined>();
  for (const key of Object.keys(overrides)) {
    saved.set(key, process.env[key]);
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  jest.resetModules();
  const mod = require('../config/env') as typeof import('../config/env');
  for (const [key, value] of saved) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  return mod;
}

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
    const mod = loadEnvFresh({ GEMINI_MODEL: undefined });
    expect(mod.GEMINI_MODEL).toBe('gemini-3.5-flash');
  });

  it('respeta GEMINI_MODEL configurado', () => {
    const mod = loadEnvFresh({ GEMINI_MODEL: 'gemini-2.5-flash' });
    expect(mod.GEMINI_MODEL).toBe('gemini-2.5-flash');
  });

  it('el modelo es un string no vacío', () => {
    const mod = loadEnvFresh({ GEMINI_MODEL: undefined });
    expect(typeof mod.GEMINI_MODEL).toBe('string');
    expect(mod.GEMINI_MODEL.length).toBeGreaterThan(0);
  });

  it('el default sigue el patrón de nomenclatura de Google', () => {
    const mod = loadEnvFresh({ GEMINI_MODEL: undefined });
    expect(mod.GEMINI_MODEL).toMatch(/^gemini-\d+\.\d+-flash/);
  });
});

describe('AI cache env resolution', () => {
  it('un 0 explícito desactiva la caché (no cae al default)', () => {
    const mod = loadEnvFresh({ AI_CACHE_TTL_SECONDS: '0', AI_CACHE_MAX_SIZE: '0' });
    expect(mod.AI_CACHE_TTL_SECONDS).toBe(0);
    expect(mod.AI_CACHE_MAX_SIZE).toBe(0);
  });

  it('valores vacíos usan los defaults', () => {
    const mod = loadEnvFresh({ AI_CACHE_TTL_SECONDS: undefined, AI_CACHE_MAX_SIZE: undefined });
    expect(mod.AI_CACHE_TTL_SECONDS).toBe(3600);
    expect(mod.AI_CACHE_MAX_SIZE).toBe(100);
  });

  it('valores inválidos usan los defaults', () => {
    const mod = loadEnvFresh({ AI_CACHE_TTL_SECONDS: 'abc', AI_CACHE_MAX_SIZE: '-5' });
    expect(mod.AI_CACHE_TTL_SECONDS).toBe(3600);
    expect(mod.AI_CACHE_MAX_SIZE).toBe(100);
  });
});
