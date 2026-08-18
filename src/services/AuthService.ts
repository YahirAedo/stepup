import { apiFetch, ENDPOINTS } from './api';
import { clearSession, getSessionUser, hasSession, saveSession, type SessionUser } from './session';
import { clearLocalData, ensureLocalOwner } from './localOwner';
import { SyncService } from './SyncService';

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
    await ensureLocalOwner(res.user.id);
    await saveSession(res.token, res.user);
  },

  async login(email: string, password: string): Promise<void> {
    const res = await apiFetch<AuthResponse>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await ensureLocalOwner(res.user.id);
    await saveSession(res.token, res.user);
    try {
      // Si la DB se limpió por cambio de dueño, last_sync_at también se borró
      // y el pull trae todo desde cero; si no, es un pull incremental.
      await SyncService.pull();
    } catch {
      // offline: el próximo ciclo de vida reintenta el pull
    }
  },

  async logout(): Promise<void> {
    await clearLocalData();
    await clearSession();
  },

  isLoggedIn(): boolean {
    return hasSession();
  },

  async getUser(): Promise<SessionUser | null> {
    return getSessionUser();
  },
};
