import { apiFetch, ENDPOINTS } from './api';
import { clearSession, getSessionUser, hasSession, saveSession, type SessionUser } from './session';

type AuthResponse = {
  user: SessionUser;
  token: string;
};

export const AuthService = {
  async register(name: string, email: string, password: string): Promise<void> {
    const res = await apiFetch<AuthResponse>(ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    await saveSession(res.token, res.user);
  },

  async login(email: string, password: string): Promise<void> {
    const res = await apiFetch<AuthResponse>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await saveSession(res.token, res.user);
  },

  async logout(): Promise<void> {
    await clearSession();
  },

  isLoggedIn(): boolean {
    return hasSession();
  },

  async getUser(): Promise<SessionUser | null> {
    return getSessionUser();
  },
};
