import { ApiError } from '../../../services/api';
import { loginCopy, authCopy } from './authCopy';

export type AuthErrorKind = 'invalid-credentials' | 'offline' | 'server' | 'unknown';

export interface MappedAuthError {
  kind: AuthErrorKind;
  message: string;
}

export function mapAuthError(error: unknown): MappedAuthError {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return { kind: 'invalid-credentials', message: loginCopy.errorMessage };
    }
    if (error.status === 0) {
      return { kind: 'offline', message: loginCopy.offline.body };
    }
    return { kind: 'server', message: error.message !== '' ? error.message : authCopy.serverError };
  }
  return { kind: 'unknown', message: authCopy.unknownError };
}
