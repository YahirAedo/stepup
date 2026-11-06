import { formatLastSync } from './formatLastSync';
import type { PerfilView } from './perfilCopy';

export interface BuildPerfilViewInput {
  hasSession: boolean;
  syncing: boolean;
  syncError: boolean;
  conflictsCount: number;
  lastSyncAt: string | null;
  now: Date;
}

export function buildPerfilView(input: BuildPerfilViewInput): PerfilView {
  const { hasSession, syncing, syncError, conflictsCount, lastSyncAt, now } = input;

  if (!hasSession) {
    return {
      isGuest: true,
      syncStatus: 'guest',
      conflictsCount: 0,
      lastSyncLabel: '—',
      statusLabel: 'Sin cuenta',
      statusTone: 'neutral',
    };
  }

  if (syncing) {
    return {
      isGuest: false,
      syncStatus: 'syncing',
      conflictsCount,
      lastSyncLabel: formatLastSync(lastSyncAt, now),
      statusLabel: 'Sincronizando…',
      statusTone: 'neutral',
    };
  }

  if (syncError) {
    return {
      isGuest: false,
      syncStatus: 'error',
      conflictsCount,
      lastSyncLabel: formatLastSync(lastSyncAt, now),
      statusLabel: 'No se pudo sincronizar',
      statusTone: 'error',
    };
  }

  return {
    isGuest: false,
    syncStatus: 'idle',
    conflictsCount,
    lastSyncLabel: formatLastSync(lastSyncAt, now),
    statusLabel: 'Todo sincronizado',
    statusTone: 'positive',
  };
}
