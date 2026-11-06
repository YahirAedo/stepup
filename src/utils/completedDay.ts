import { getLocalDate } from './date';

/**
 * Resuelve el día en que se completó un paso.
 *
 * Prefiere `completed_date` si está presente; si no, deriva el día local a partir
 * de `completed_at`. Devuelve `null` si no hay datos válidos.
 */
export function resolveCompletedDay(
  completedDate: string | null,
  completedAt: string | null,
): string | null {
  if (completedDate !== null && completedDate !== '') return completedDate;

  if (completedAt === null || completedAt === '') return null;

  const parsed = new Date(completedAt);
  if (Number.isNaN(parsed.getTime())) return null;

  return getLocalDate(parsed);
}
