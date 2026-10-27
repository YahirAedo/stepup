/**
 * Fixtures de la parte "Perfil" de las previews del Design Lab.
 *
 * Aca vive TODO el texto visible y los datos de demo de las 3 variantes
 * (A tarjetas, B ajustes nativos, C resumen + datos primero). Las pantallas
 * solo dibujan; no hardcodean copy.
 *
 * Reglas de copy (decision de producto):
 * - Voseo rioplatense, frases cortas, tono tranquilo y practico.
 * - Prohibido: "consciente", "serena/sereno", "calma", "respiro", "mente",
 *   "resistencia", "ritual", "manifiesto", "soberania", "organico",
 *   "tibetana", "sin prisa". Nunca "racha".
 * - Se dice "tarea", "paso" (no "micro-paso"), "foco".
 *
 * Los datos de privacidad son VERDADEROS (verificados en codigo): base local
 * SQLite sin cifrado, sync con cuenta, y texto de tarea al servicio de IA solo
 * al usar "Sugerir pasos".
 */

export type PerfilDemoState =
  | 'sesion'
  | 'invitado'
  | 'sincronizando'
  | 'error'
  | 'conflictos'
  | 'sin-conflictos';

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

  demo: {
    label: string;
    options: { key: PerfilDemoState; label: string }[];
  };

  identity: {
    sessionName: string;
    sessionEmail: string;
    sessionCaption: string;
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

  achievements: {
    title: string;
    value: string;
    caption: string;
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

  reminder: {
    sectionTitle: string;
    title: string;
    caption: string;
    hour: string;
    dependencyNote: string;
  };

  account: {
    sectionTitle: string;
    support: string;
    supportCaption: string;
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

  demo: {
    label: 'Estado (solo Design Lab)',
    options: [
      { key: 'sesion', label: 'Sesión' },
      { key: 'invitado', label: 'Invitado' },
      { key: 'sincronizando', label: 'Sincronizando' },
      { key: 'error', label: 'Error de sync' },
      { key: 'conflictos', label: 'Con conflictos' },
      { key: 'sin-conflictos', label: 'Sin conflictos' },
    ],
  },

  identity: {
    sessionName: 'Sofía Martínez',
    sessionEmail: 'sofia@ejemplo.com',
    sessionCaption: 'Cuenta con sesión iniciada',
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

  achievements: {
    title: 'Logros',
    value: '6 de 12',
    caption: 'Desbloqueados',
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

  reminder: {
    sectionTitle: 'Recordatorios',
    title: 'Recordatorio diario',
    caption: 'Un aviso corto para arrancar con tus pasos.',
    hour: '09:00',
    // REQUIERE DEPENDENCIA: expo-notifications (hoy NO instalado). El switch y la
    // hora son solo visuales en la preview; en produccion el horario se persiste.
    dependencyNote: 'Requiere notificaciones del sistema.',
  },

  account: {
    sectionTitle: 'Privacidad y soporte',
    support: 'Soporte',
    supportCaption: '¿Necesitás ayuda? Escribinos.',
    privacy: 'Privacidad',
    privacyCaption: 'Qué datos se guardan y dónde.',
    versionRowLabel: 'Versión de la app',
    logout: 'Cerrar sesión',
    logoutConfirmTitle: '¿Cerrar sesión?',
    // REQUIERE MIGRACIÓN: hoy AuthService.logout() llama a clearLocalData() y
    // borra tareas y pasos del teléfono; debe quedar solo clearSession().
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

/** Datos de demo por estado (lo que el fixture no puede inventar como texto). */
export function resolvePerfilView(state: PerfilDemoState): PerfilView {
  switch (state) {
    case 'invitado':
      return {
        isGuest: true,
        syncStatus: 'guest',
        conflictsCount: 0,
        lastSyncLabel: '—',
        statusLabel: 'Sin cuenta',
        statusTone: 'neutral',
      };
    case 'sincronizando':
      return {
        isGuest: false,
        syncStatus: 'syncing',
        conflictsCount: 0,
        lastSyncLabel: 'Hace 12 min',
        statusLabel: 'Sincronizando…',
        statusTone: 'neutral',
      };
    case 'error':
      return {
        isGuest: false,
        syncStatus: 'error',
        conflictsCount: 0,
        lastSyncLabel: 'Hace 2 días',
        statusLabel: 'No se pudo sincronizar',
        statusTone: 'error',
      };
    case 'conflictos':
      return {
        isGuest: false,
        syncStatus: 'idle',
        conflictsCount: 2,
        lastSyncLabel: 'Hace 1 día',
        statusLabel: 'Todo sincronizado',
        statusTone: 'positive',
      };
    case 'sin-conflictos':
      return {
        isGuest: false,
        syncStatus: 'idle',
        conflictsCount: 0,
        lastSyncLabel: 'Recién ahora',
        statusLabel: 'Todo sincronizado',
        statusTone: 'positive',
      };
    case 'sesion':
    default:
      return {
        isGuest: false,
        syncStatus: 'idle',
        conflictsCount: 0,
        lastSyncLabel: 'Hace 12 min',
        statusLabel: 'Todo sincronizado',
        statusTone: 'positive',
      };
  }
}

/**
 * Fechas de pasos completados de demo (ultimos 30 dias), generadas relativas a
 * hoy para que la ventana de "dias activos" no se venza con el tiempo.
 *
 * Con estos offsets, `countActiveDays(dates, 7, hoy)` = 4 y con 30 = 8.
 */
export function buildCompletedDateKeys(today: Date = new Date()): string[] {
  const offsets = [0, 0, 1, 2, 5, 9, 13, 21, 27];
  return offsets.map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  });
}

export const perfilMetricsFixtures = {
  completedDates: buildCompletedDateKeys(),
  stepsCompletedTotal: 186,
};
