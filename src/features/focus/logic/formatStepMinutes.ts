/**
 * Formatea la duración de un paso en texto legible.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function formatStepMinutes(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return 'Sin duración';
  return `${minutes} min`;
}
