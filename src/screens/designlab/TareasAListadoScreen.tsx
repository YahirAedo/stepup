// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.
// Alimenta TasksListView con fixtures. La app real usa TasksListScreen + useTasksList.

import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation';
import type { Task, Step } from '../../types';
import { flujoAListadoFixtures } from './tareasFlujoAFixtures';
import { buildTasksListModel, type TaskListModel } from '../../features/tasks/logic/buildTasksListModel';
import TasksListView from '../../features/tasks/views/TasksListView';
import type { TaskCategory } from '../../utils/designlab/deriveTaskCategory';

/**
 * Mapea un FlujoATask (fixture del Lab) a Task (modelo real).
 * Campos que el fixture no tiene se rellenan con valores por defecto.
 * // REQUIERE MIGRACIÓN: cuando el Lab use el modelo real, este mapeo sobra.
 */
function toTask(t: typeof flujoAListadoFixtures.tasks[0], index: number): Task {
  const allCompleted = t.steps.length > 0 && t.steps.every((step) => step.status === 'completed');
  const lastCompleted = allCompleted
    ? [...t.steps]
        .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
        .pop()?.completedAt ?? null
    : null;

  return {
    id: index + 1,
    name: t.name,
    description: null,
    due_date: t.dueDate ?? null,
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    completed_at: lastCompleted,
    server_id: null,
    dirty: 0,
    updated_at: '2026-01-01T00:00:00Z',
  };
}

/**
 * Mapea un FlujoAStep (fixture del Lab) a Step (modelo real).
 * // REQUIERE MIGRACIÓN: cuando el Lab use el modelo real, este mapeo sobra.
 */
function toStep(s: typeof flujoAListadoFixtures.tasks[0]['steps'][0], taskId: number, globalIndex: number): Step {
  return {
    id: globalIndex,
    task_id: taskId,
    name: s.name,
    duration_min: s.minutes ?? null,
    order_index: globalIndex,
    status: s.status,
    completed_at: s.completedAt ?? null,
    completed_date: null,
    server_id: null,
    dirty: 0,
    updated_at: '2026-01-01T00:00:00Z',
  };
}

/**
 * Variante A "Enfoque" — Tareas / Listado (Design Lab).
 *
 * Ahora es un contenedor del Lab que alimenta TasksListView con fixtures.
 * La pantalla real (TasksListScreen) alimenta la misma vista con servicios.
 */
export default function TareasAListadoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasAListado'>>();
  const [activeFilter, setActiveFilter] = useState<TaskCategory>('inProgress');

  const f = flujoAListadoFixtures;
  const tasks: Task[] = f.tasks.map((t, i) => toTask(t, i));
  let stepGlobalIndex = 0;
  const steps: Step[] = [];
  for (const [ti, t] of tasks.entries()) {
    for (const s of f.tasks[ti].steps) {
      stepGlobalIndex += 1;
      steps.push(toStep(s, t.id, stepGlobalIndex));
    }
  }

  const model: TaskListModel = buildTasksListModel(tasks, steps);

  const handleFilterChange = useCallback((key: TaskCategory) => {
    setActiveFilter(key);
  }, []);

  return (
    <TasksListView
      model={model}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
      onCreateTask={() => navigation.navigate('TareasACrear')}
      onOpenTask={() => navigation.navigate('TareasADetalle')}
      onResumeFocus={() => navigation.navigate('EnfoqueFocus')}
    />
  );
}
