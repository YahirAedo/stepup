import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Fixtures de la preview "Tus logros" (flujo Perfil, Variante A) del Design Lab.
 *
 * Acá vive TODO el texto visible y los datos de demo; la pantalla solo dibuja.
 * Copy en voseo rioplatense, frases cortas, tono tranquilo y practico.
 *
 * Reglas de copy (decision de producto): prohibido "consciente", "serena/sereno",
 * "calma", "respiro", "mente", "resistencia", "ritual", "mindful", "friccion",
 * "abrumamiento", "sin prisa" y "micro-paso". Nunca "racha".
 *
 * Los logros son demo: no se calculan sobre datos reales. El set son 8 logros
 * alcanzables con datos que ya existen (pasos y tareas completadas).
 */

export type LogroEstado = 'obtenido' | 'por-lograr';

export type LogroFiltroKey = 'todos' | 'obtenidos' | 'por-lograr';

export interface LogroItem {
  id: string;
  icon: MciName;
  title: string;
  description: string;
  estado: LogroEstado;
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

export const logrosFixtures: LogroItem[] = [
  {
    id: 'primer-paso',
    icon: 'foot-print',
    title: 'Primer paso',
    description: 'Completaste tu primer paso.',
    estado: 'obtenido',
  },
  {
    id: 'primera-tarea',
    icon: 'check-circle-outline',
    title: 'Primera tarea',
    description: 'Terminaste todos los pasos de una tarea.',
    estado: 'obtenido',
  },
  {
    id: 'diez-pasos',
    icon: 'numeric-10-circle-outline',
    title: 'Diez pasos',
    description: 'Acumulaste diez pasos completados.',
    estado: 'obtenido',
  },
  {
    id: 'semana-activa',
    icon: 'calendar-check',
    title: 'Semana activa',
    description: 'Completaste pasos en siete días seguidos.',
    estado: 'obtenido',
  },
  {
    id: 'arranque-temprano',
    icon: 'weather-sunset-up',
    title: 'Arranque temprano',
    description: 'Completaste un paso antes de las 8.',
    estado: 'obtenido',
  },
  {
    id: 'cincuenta-pasos',
    icon: 'flag-checkered',
    title: 'Cincuenta pasos',
    description: 'Acumulaste cincuenta pasos completados.',
    estado: 'por-lograr',
  },
  {
    id: 'mes-constante',
    icon: 'calendar-month',
    title: 'Mes constante',
    description: 'Completaste pasos en veinte días del mes.',
    estado: 'por-lograr',
  },
  {
    id: 'cien-pasos',
    icon: 'trophy-outline',
    title: 'Cien pasos',
    description: 'Acumulaste cien pasos completados.',
    estado: 'por-lograr',
  },
];

/** Resumen derivado del set (lo usan la propia pantalla y la fila de Perfil A). */
export const logrosResumen = {
  obtenidos: logrosFixtures.filter((logro) => logro.estado === 'obtenido').length,
  total: logrosFixtures.length,
};
