import type { Task } from '../../../types';
import { formatDateShort } from './formatDateShort';

/**
 * Devuelve la etiqueta de fecha a mostrar en el Detalle de una tarea.
 *
 * Reglas:
 * - Tarea completada: fecha de finalización (`completed_at`). Si es null, no mostrar nada (sin backfill).
 * - Tarea no completada: `due_date`. Si no hay fecha, no mostrar nada (sin "+": editar la fecha es 3c).
 * - Devuelve string con formato dd/mm/aaaa o null si no hay fecha que mostrar.
 */
export function getTaskDetailDateLabel(task: Task): string | null {
  if (task.status === 'completed') {
    if (!task.completed_at) return null;
    return formatDateShort(task.completed_at);
  }
  if (!task.due_date) return null;
  return formatDateShort(task.due_date);
}
