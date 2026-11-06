import { describe, it, expect } from 'vitest';
import { buildPerfilView } from './buildPerfilView';

describe('buildPerfilView', () => {
  const now = new Date('2026-10-15T12:00:00');

  it('invitado tiene prioridad y muestra Sin cuenta', () => {
    expect(
      buildPerfilView({
        hasSession: false,
        syncing: true,
        syncError: true,
        conflictsCount: 5,
        lastSyncAt: '2026-10-14T12:00:00.000Z',
        now,
      }),
    ).toEqual({
      isGuest: true,
      syncStatus: 'guest',
      conflictsCount: 0,
      lastSyncLabel: '—',
      statusLabel: 'Sin cuenta',
      statusTone: 'neutral',
    });
  });

  it('sincronizando muestra Sincronizando…', () => {
    expect(
      buildPerfilView({
        hasSession: true,
        syncing: true,
        syncError: false,
        conflictsCount: 0,
        lastSyncAt: '2026-10-15T11:50:00.000Z',
        now,
      }),
    ).toMatchObject({
      isGuest: false,
      syncStatus: 'syncing',
      statusLabel: 'Sincronizando…',
      statusTone: 'neutral',
    });
  });

  it('error muestra No se pudo sincronizar', () => {
    expect(
      buildPerfilView({
        hasSession: true,
        syncing: false,
        syncError: true,
        conflictsCount: 0,
        lastSyncAt: '2026-10-13T12:00:00.000Z',
        now,
      }),
    ).toMatchObject({
      isGuest: false,
      syncStatus: 'error',
      statusLabel: 'No se pudo sincronizar',
      statusTone: 'error',
    });
  });

  it('idle muestra Todo sincronizado', () => {
    expect(
      buildPerfilView({
        hasSession: true,
        syncing: false,
        syncError: false,
        conflictsCount: 2,
        lastSyncAt: '2026-10-15T11:50:00.000Z',
        now,
      }),
    ).toMatchObject({
      isGuest: false,
      syncStatus: 'idle',
      conflictsCount: 2,
      statusLabel: 'Todo sincronizado',
      statusTone: 'positive',
    });
  });
});
