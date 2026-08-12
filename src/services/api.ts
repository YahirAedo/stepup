import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, clearSession } from './session';

const API_PORT = 3000;

export const ENDPOINTS = {
  health: '/api/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
  },
  sync: {
    push: '/api/sync/push',
    pull: '/api/sync/pull',
    migrate: '/api/sync/migrate',
  },
  tasks: {
    list: '/api/tasks',
    completed: '/api/tasks/completed',
    create: '/api/tasks',
    detail: (id: number) => `/api/tasks/${id}`,
    update: (id: number) => `/api/tasks/${id}`,
    remove: (id: number) => `/api/tasks/${id}`,
    complete: (id: number) => `/api/tasks/${id}/complete`,
  },
  steps: {
    list: (taskId: number) => `/api/steps?taskId=${taskId}`,
    create: '/api/steps',
    update: (id: number) => `/api/steps/${id}`,
    remove: (id: number) => `/api/steps/${id}`,
    complete: (id: number) => `/api/steps/${id}/complete`,
    reorder: '/api/steps/reorder',
  },
  progress: {
    list: '/api/progress',
  },
} as const;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${API_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiFetchOptions = RequestInit & { idempotencyKey?: string };

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { idempotencyKey, ...rest } = options;
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...(rest.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.',
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (res.status === 401) {
    void clearSession();
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (body as { message?: string } | null)?.message ?? `Error ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return body as T;
}
