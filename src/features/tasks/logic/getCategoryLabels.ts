import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';

export type CategoryLabels = {
  pills: Record<TaskCategory, string>;
  sections: Record<TaskCategory, string>;
  emptyMessages: Record<TaskCategory, string>;
};

/**
 * Devuelve las etiquetas de las pills (filtro) y de los títulos de sección.
 *
 * Pills: En curso → "Activas", Por empezar → "Pendientes", Completadas → "Completadas"
 * Secciones: En curso → "En curso", Por empezar → "Por empezar", Completadas → "Historial"
 *
 * Las claves internas (inProgress, notStarted, completed) no cambian.
 */
export function getCategoryLabels(): CategoryLabels {
  return {
    pills: {
      inProgress: 'Activas',
      notStarted: 'Pendientes',
      completed: 'Completadas',
    },
    sections: {
      inProgress: 'En curso',
      notStarted: 'Por empezar',
      completed: 'Historial',
    },
    emptyMessages: {
      inProgress: 'No hay tareas en curso.',
      notStarted: 'No hay tareas por empezar.',
      completed: 'Todavía no hay tareas completadas.',
    },
  };
}
