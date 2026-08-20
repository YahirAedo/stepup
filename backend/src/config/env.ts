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
