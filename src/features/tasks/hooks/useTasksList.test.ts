import { describe, it, expect, vi } from 'vitest';

/**
 * useTasksList no puede probarse con renderHook (no existe esa infraestructura
 * en el proyecto, y no se agregan dependencias). El hook importa TaskService y
 * StepService, que a su vez dependen de expo-sqlite y fallan en vitest sin
 * __DEV__ definido.
 *
 * Este test verifica que el módulo se puede importar y que exporta el hook
 * como una función. No llama al hook directamente (los hooks solo se pueden
 * ejecutar dentro de un componente React).
 *
 * La lógica pura que el hook consume (buildTasksListModel, getProgressBar)
 * está testeada en buildTasksListModel.test.ts y getProgressBar.test.ts.
 *
 * Los mocks de TaskService y StepService evitan que vitest intente cargar
 * expo-sqlite (que usa Flow y no puede parsearse con rolldown).
 */
vi.mock('../../../services/TaskService', () => ({
  TaskService: { getAll: vi.fn() },
}));
vi.mock('../../../services/StepService', () => ({
  StepService: { getByTask: vi.fn() },
}));

import { useTasksList } from './useTasksList';

describe('useTasksList', () => {
  it('exporta useTasksList como función', () => {
    expect(typeof useTasksList).toBe('function');
  });
});
