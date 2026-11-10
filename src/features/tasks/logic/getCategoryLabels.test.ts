import { describe, it, expect } from 'vitest';
import { getCategoryLabels } from './getCategoryLabels';

describe('getCategoryLabels', () => {
  it('devuelve las etiquetas correctas para pills, secciones y mensajes vacíos', () => {
    const labels = getCategoryLabels();
    expect(labels.pills).toEqual({
      inProgress: 'Activas',
      notStarted: 'Pendientes',
      completed: 'Completadas',
    });
    expect(labels.sections).toEqual({
      inProgress: 'En curso',
      notStarted: 'Por empezar',
      completed: 'Historial',
    });
    expect(labels.emptyMessages).toEqual({
      inProgress: 'No hay tareas en curso.',
      notStarted: 'No hay tareas por empezar.',
      completed: 'Todavía no hay tareas completadas.',
    });
  });

  it('las claves internas no cambian', () => {
    const labels = getCategoryLabels();
    expect(Object.keys(labels.pills)).toEqual(['inProgress', 'notStarted', 'completed']);
    expect(Object.keys(labels.sections)).toEqual(['inProgress', 'notStarted', 'completed']);
  });
});
