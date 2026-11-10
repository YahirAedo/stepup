import { useMemo, useState } from 'react';
import {
  perfilMetricsFixtures,
  resolvePerfilView,
  type PerfilDemoState,
} from './perfilFixtures';
import { countActiveDays } from '../../utils/profileActivity';
import { getAppVersion } from '../../utils/appVersion';

/**
 * Estado compartido por las 3 previews de Perfil (A/B/C): estado de demo,
 * metricas, recordatorio, version y visibilidad de los sheets.
 *
 * Los handlers son de demo: no tocan servicios ni backend. "Sincronizar ahora"
 * pasa el estado a `sincronizando` y confirmar el cierre de sesion deja el
 * estado en `invitado`.
 */
export function usePerfilPreview() {
  const [state, setState] = useState<PerfilDemoState>('sesion');
  // REQUIERE DEPENDENCIA: expo-notifications (no instalado). Aca el recordatorio
  // es solo estado de demo; no se programa ningun aviso real.
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const view = useMemo(() => resolvePerfilView(state), [state]);

  const activeDaysWeek = useMemo(
    () => countActiveDays(perfilMetricsFixtures.completedDates, 7, new Date()),
    [],
  );
  const activeDaysMonth = useMemo(
    () => countActiveDays(perfilMetricsFixtures.completedDates, 30, new Date()),
    [],
  );

  const appVersion = useMemo(() => getAppVersion(), []);

  const onSync = () => setState('sincronizando');

  const onGuestCta = () => {
    // Placeholder Design Lab: en produccion abre el alta de cuenta.
    console.log('[DesignLab] Perfil — crear cuenta');
  };

  const onPressConflicts = () => {
    // Placeholder Design Lab: en produccion abre la pantalla de conflictos.
    console.log('[DesignLab] Perfil — ver conflictos de sincronización');
  };

  const onSupport = () => {
    console.log('[DesignLab] Perfil — soporte');
  };

  const onConfirmLogout = () => {
    setLogoutVisible(false);
    setState('invitado');
  };

  return {
    state,
    setState,
    view,
    reminderEnabled,
    setReminderEnabled,
    privacyVisible,
    setPrivacyVisible,
    logoutVisible,
    setLogoutVisible,
    activeDaysWeek,
    activeDaysMonth,
    stepsTotal: perfilMetricsFixtures.stepsCompletedTotal,
    appVersion,
    onSync,
    onGuestCta,
    onPressConflicts,
    onSupport,
    onConfirmLogout,
  };
}
