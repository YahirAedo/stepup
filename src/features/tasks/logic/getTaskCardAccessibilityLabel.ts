import type { TaskListItem } from './buildTasksListModel';

/**
 * Etiqueta accesible de la tarjeta. Solo agrega progreso si la tarea tiene pasos.
 * Una tarea sin pasos no puede decir "0% completado".
 */
export function getTaskCardAccessibilityLabel(
  item: TaskListItem,
  isCompleted: boolean,
): string {
  if (isCompleted) {
    return `Ver detalles de ${item.name} (completada)`;
  }
  if (item.stepCount > 0) {
    if (item.progress.kind === 'segments') {
      return `Ver detalles de ${item.name}, ${item.completedStepCount} de ${item.stepCount} pasos`;
    }
    return `Ver detalles de ${item.name}, ${Math.round((item.progress.proportion ?? 0) * 100)}% completado`;
  }
  return `Ver detalles de ${item.name}`;
}
