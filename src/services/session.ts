import { storage } from './storage';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export const SESSION_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
} as const;

let cachedToken: string | null = null;

export async function loadSession(): Promise<void> {
  cachedToken = await storage.getItem(SESSION_KEYS.token);
}

export function getToken(): string | null {
  return cachedToken;
}

export function hasSession(): boolean {
  return getToken() !== null;
}

export async function saveSession(token: string, user: SessionUser): Promise<void> {
  cachedToken = token;
  await storage.setItem(SESSION_KEYS.token, token);
  await storage.setItem(SESSION_KEYS.user, JSON.stringify(user));
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = await storage.getItem(SESSION_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  await storage.removeItem(SESSION_KEYS.token);
  await storage.removeItem(SESSION_KEYS.user);
}
