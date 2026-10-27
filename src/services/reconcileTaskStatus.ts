import { nowIso } from '../database/sync';

/**
 * Recalcula el estado de una tarea (active/completed) a partir de sus pasos.
 * 
 * - Si todos los pasos están completados (status = 'completed' y completed_at no nulo):
 *   - task.status = 'completed'
 *   - completed_at = max(steps.completed_at)  // máximo timestamp de los pasos completados
 *   - Si algún paso tiene completed_at NULL, no es válido para 'completed'
 * - Si NO todos los pasos están completados:
 *   - task.status = 'active'
 *   - completed_at = NULL
 * 
 * La función es idempotente: si el estado ya coincide con la realidad, no cambia nada.
 * 
 * @param steps Array de pasos de la tarea (cada uno tiene status y completed_at)
 * @returns {status: 'active'|'completed', completed_at: string | null}
 */
export function reconcileTaskStatus(steps: ReadonlyArray<{ status: 'pending'|'completed'; completed_at?: string | null }>): { status: 'active'|'completed'; completed_at: string | null } {
  if (steps.length === 0) {
    return { status: 'active', completed_at: null };
  }
  
  // Verificar si todos los pasos están completados
  const allCompleted = steps.every(step => step.status === 'completed' && step.completed_at !== null);
  
  if (allCompleted) {
    // Encontrar el timestamp más reciente de completed_at; fallback a now si algún paso completado lo tiene NULL
    let maxCompletedAt = '';
    for (const step of steps) {
      const ts = step.completed_at || '';
      if (ts > maxCompletedAt) maxCompletedAt = ts;
    }
    const completedAt = maxCompletedAt || nowIso(); // shortcut: si es vacío, usamos ahora
    return { status: 'completed', completed_at: completedAt };
  } else {
    return {
      status: 'active',
      completed_at: null
    };
  }
}