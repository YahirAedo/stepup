import { AppState } from 'react-native';
import { loadSession, hasSession } from './session';
import { SyncService } from './SyncService';

async function onAppActive(): Promise<void> {
  await loadSession();
  if (!hasSession()) return;
  try {
    await SyncService.push();
    await SyncService.pull();
  } catch {
    // offline o sin servidor: se reintenta en el próximo ciclo
  }
}

async function onAppBackground(): Promise<void> {
  if (!hasSession()) return;
  try {
    await SyncService.push();
  } catch {
    // offline: los cambios quedan dirty para la próxima apertura
  }
}

export function startSyncLifecycle(): () => void {
  void onAppActive();
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void onAppActive();
    } else if (state === 'background' || state === 'inactive') {
      void onAppBackground();
    }
  });
  return () => subscription.remove();
}
