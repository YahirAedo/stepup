export type LogroFiltroKey = 'todos' | 'obtenidos' | 'por-lograr';

export interface LogroItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const logrosCopy = {
  headerTitle: 'Tus logros',
  resumenLabel: 'Logros obtenidos',
  filtros: [
    { key: 'todos' as LogroFiltroKey, label: 'Todos' },
    { key: 'obtenidos' as LogroFiltroKey, label: 'Obtenidos' },
    { key: 'por-lograr' as LogroFiltroKey, label: 'Por lograr' },
  ],
  vacioTitle: 'Sin logros en este filtro',
  vacioBody: 'Probá con otro filtro para ver el resto.',
  nota: 'Los logros salen de tus pasos y tareas completadas. Una vez obtenidos, quedan.',
} as const;

export const LOGROS_CATALOG: LogroItem[] = [
  { id: 'primer-paso', icon: 'foot-print', title: 'Primer paso', description: 'Completaste tu primer paso.' },
  { id: 'primera-tarea', icon: 'check-circle-outline', title: 'Primera tarea', description: 'Terminaste todos los pasos de una tarea.' },
  { id: 'diez-pasos', icon: 'numeric-10-circle-outline', title: 'Diez pasos', description: 'Acumulaste diez pasos completados.' },
  { id: 'semana-activa', icon: 'calendar-check', title: 'Semana activa', description: 'Completaste pasos en siete días seguidos.' },
  { id: 'arranque-temprano', icon: 'weather-sunset-up', title: 'Arranque temprano', description: 'Completaste un paso antes de las 8.' },
  { id: 'cincuenta-pasos', icon: 'flag-checkered', title: 'Cincuenta pasos', description: 'Acumulaste cincuenta pasos completados.' },
  { id: 'mes-constante', icon: 'calendar-month', title: 'Mes constante', description: 'Completaste pasos en veinte días del mes.' },
  { id: 'cien-pasos', icon: 'trophy-outline', title: 'Cien pasos', description: 'Acumulaste cien pasos completados.' },
];
