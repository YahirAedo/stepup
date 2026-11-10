import Constants from 'expo-constants';

/**
 * Version de la app leida de la configuracion de Expo (app.json/app.config).
 *
 * Nunca se hardcodea: `expo-constants` ya viene instalado con el proyecto.
 * Si por algun motivo no esta disponible, devuelve un fallback visible.
 */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '—';
}
