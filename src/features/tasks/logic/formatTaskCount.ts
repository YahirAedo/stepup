/**
 * Formatea el conteo de tareas para el `accessibilityLabel` de las pills.
 *
 * Singular: 1 → "1 tarea"
 * Plural: N → "N tareas" (incluido 0 → "0 tareas")
 */
export function formatTaskCount(n: number): string {
  return n === 1 ? '1 tarea' : `${n} tareas`;
}
