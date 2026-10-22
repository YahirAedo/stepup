/**
 * Helpers puros para el campo "Vencimiento" (dato neutro y opcional) de las
 * previews de Tareas del Design Lab.
 *
 * El modelo guarda `due_date` como ISO corto `YYYY-MM-DD` (ver `src/utils/date.ts`
 * y `migrations.ts`). Aca solo se traduce a/desde `Date` y a un label legible.
 */

import { getLocalDate } from '../date';

const ISO_SHORT = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `Date` -> ISO corto `YYYY-MM-DD` (hora local). */
export function isoFromDate(date: Date): string {
  return getLocalDate(date);
}

/** ISO corto `YYYY-MM-DD` -> `Date` local; `null` si falta o es invalido. */
export function dateFromIso(iso?: string | null): Date | null {
  if (!iso) return null;
  const match = ISO_SHORT.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/** ISO corto -> "dd/mm/aaaa". Vacio o invalido -> cadena vacia. */
export function formatDueDate(iso?: string | null): string {
  const date = dateFromIso(iso);
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}
