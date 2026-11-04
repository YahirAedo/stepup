import { getProgressBar } from '../../tasks/logic/getProgressBar';

/**
 * Arma el progreso de la barra para el paso actual en foco.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function buildStepProgress(stepIndex: number, totalSteps: number) {
  if (totalSteps <= 0) return getProgressBar([]);
  const statuses = Array.from({ length: totalSteps }, (_, i) =>
    i < stepIndex - 1 ? 'completed' : 'pending',
  );
  return getProgressBar(statuses.map((status) => ({ status })));
}
