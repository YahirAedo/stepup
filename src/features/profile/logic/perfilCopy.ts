export type PerfilSyncStatus = 'idle' | 'syncing' | 'error' | 'guest';

export type PerfilStatusTone = 'positive' | 'neutral' | 'error';

export interface PerfilView {
  isGuest: boolean;
  syncStatus: PerfilSyncStatus;
  conflictsCount: number;
  lastSyncLabel: string;
  statusLabel: string;
  statusTone: PerfilStatusTone;
}

export interface PerfilCopy {
  headerTitle: string;

  identity: {
    guestTitle: string;
    guestBody: string;
    guestCta: string;
    accountSectionTitle: string;
  };

  metrics: {
    sectionTitle: string;
    activeDaysTitle: string;
    activeDaysWeekCaption: string;
    activeDaysMonthCaption: string;
    stepsTitle: string;
    stepsCaption: string;
    activeDaysNote: string;
  };

  sync: {
    sectionTitle: string;
    statusRowLabel: string;
    lastSyncRowLabel: string;
    syncCta: string;
    syncingCta: string;
    retryCta: string;
    conflictsRowLabel: string;
    conflictsHint: string;
    guestBody: string;
  };

  account: {
    sectionTitle: string;
    support: string;
    privacy: string;
    privacyCaption: string;
    versionRowLabel: string;
    logout: string;
    logoutConfirmTitle: string;
    logoutConfirmBody: string;
    logoutConfirmCta: string;
    cancelCta: string;
  };

  privacy: {
    title: string;
    paragraphs: string[];
    closeCta: string;
  };
}

export const perfilCopy: PerfilCopy = {
  headerTitle: 'Perfil',

  identity: {
    guestTitle: 'Estás usando StepUp sin cuenta',
    guestBody: 'Tus tareas y pasos quedan solo en este teléfono.',
    guestCta: 'Crear cuenta',
    accountSectionTitle: 'Cuenta',
  },

  metrics: {
    sectionTitle: 'Actividad',
    activeDaysTitle: 'Días activos',
    activeDaysWeekCaption: 'Esta semana',
    activeDaysMonthCaption: 'Últimos 30 días',
    stepsTitle: 'Pasos completados',
    stepsCaption: 'En total',
    activeDaysNote: 'Contamos los días en los que completaste al menos un paso.',
  },

  sync: {
    sectionTitle: 'Datos y sincronización',
    statusRowLabel: 'Estado',
    lastSyncRowLabel: 'Última sincronización',
    syncCta: 'Sincronizar ahora',
    syncingCta: 'Sincronizando…',
    retryCta: 'Reintentar',
    conflictsRowLabel: 'Conflictos de sincronización',
    conflictsHint: 'Revisalos para elegir qué versión conservar.',
    guestBody: 'Creá una cuenta para sincronizar tus datos entre teléfonos.',
  },

  account: {
    sectionTitle: 'Privacidad y soporte',
    support: 'Soporte',
    privacy: 'Privacidad',
    privacyCaption: 'Qué datos se guardan y dónde.',
    versionRowLabel: 'Versión de la app',
    logout: 'Cerrar sesión',
    logoutConfirmTitle: '¿Cerrar sesión?',
    logoutConfirmBody:
      'Tus tareas y pasos siguen en este teléfono. Dejan de sincronizarse hasta que vuelvas a iniciar sesión.',
    logoutConfirmCta: 'Cerrar sesión',
    cancelCta: 'Cancelar',
  },

  privacy: {
    title: 'Privacidad',
    paragraphs: [
      'Tus tareas y pasos se guardan en una base de datos local en este teléfono (SQLite), sin cifrado.',
      'Si creás una cuenta, además se sincronizan con el servidor de StepUp para que los veas en otros teléfonos.',
      'Cuando usás "Sugerir pasos", el nombre y las notas de la tarea se envían al servicio de IA para generar la propuesta.',
      'Podés usar la app sin cuenta: en ese caso todo queda solo en este teléfono.',
    ],
    closeCta: 'Entendido',
  },
};
