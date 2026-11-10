/**
 * Decide la acción del timer a partir de su estado actual.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function getTimerAction(s: {
  started: boolean;
  running: boolean;
  finished: boolean;
}): 'start' | 'pause' | 'resume' | 'none' {
  if (s.finished) return 'none';
  if (!s.started) return 'start';
  if (s.running) return 'pause';
  return 'resume';
}
