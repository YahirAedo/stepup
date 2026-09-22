const UNSAFE_JWT_SECRETS = new Set([
  '',
  'dev-secret-stepup',
  'cambiar-en-produccion',
  'secret',
  'jwt_secret',
  'JWT_SECRET',
]);

export function resolveJwtSecret(secret: string | undefined, nodeEnv: string | undefined): string {
  const value = secret?.trim() ?? '';
  const unsafe = UNSAFE_JWT_SECRETS.has(value);
  if (unsafe) {
    if (nodeEnv === 'test') {
      return value || 'test-secret-stepup';
    }
    throw new Error(
      'JWT_SECRET es obligatorio y no puede ser un valor por defecto. Definilo en las variables de entorno.',
    );
  }
  return value;
}

export const JWT_SECRET = resolveJwtSecret(process.env.JWT_SECRET, process.env.NODE_ENV);

export function resolveGeminiApiKey(key: string | undefined, nodeEnv: string | undefined): string {
  const value = key?.trim() ?? '';
  if (!value) {
    if (nodeEnv === 'test') {
      return 'test-gemini-key';
    }
    throw new Error(
      'GEMINI_API_KEY es obligatoria y debe definirse en las variables de entorno (fail-closed).',
    );
  }
  return value;
}

export const GEMINI_API_KEY = resolveGeminiApiKey(process.env.GEMINI_API_KEY, process.env.NODE_ENV);

export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';

function readEnvInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const AI_CACHE_TTL_SECONDS = readEnvInt(process.env.AI_CACHE_TTL_SECONDS, 3600);
export const AI_CACHE_MAX_SIZE = readEnvInt(process.env.AI_CACHE_MAX_SIZE, 100);
