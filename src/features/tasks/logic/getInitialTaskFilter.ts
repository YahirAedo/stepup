import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import type { TaskListModel } from './buildTasksListModel';

/**
 * Filtro inicial del listado de Tareas en la primera carga.
 *
 * Si el usuario todavía no eligió un filtro, se usa el primero (en este
 * orden) que tenga tareas: En curso → Por empezar → Completadas. Si no
 * hay ninguna, se queda en "En curso".
 */
export function getInitialTaskFilter(model: TaskListModel): TaskCategory {
  if (model.counts.inProgress > 0) return 'inProgress';
  if (model.counts.notStarted > 0) return 'notStarted';
  if (model.counts.completed > 0) return 'completed';
  return 'inProgress';
}