/**
 * Convierte el modelo de foco en datos listos para la vista.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function buildFocusViewModel(model: {
  task: { id: number; name: string };
  current: { id: number; name: string; duration_min: number | null };
  upcoming: Array<{ id: number; name: string; duration_min: number | null }>;
  canPostpone: boolean;
  pendingCount: number;
  stepIndex: number;
  totalSteps: number;
  switcher: Array<{
    taskId: number;
    name: string;
    isActive: boolean;
    stepName: string;
    stepMinutes: number | null;
    stepIndex: number;
    totalSteps: number;
  }>;
}): {
  taskId: number;
  taskName: string;
  step: { id: number; title: string; minutes: number | null; stepIndex: number; totalSteps: number };
  queue: Array<{ id: number; name: string; minutes: number | null }>;
  canPostpone: boolean;
  switcher: {
    show: boolean;
    active: { id: number; name: string; stepName: string; minutes: number | null; stepIndex: number; totalSteps: number } | null;
    alternatives: Array<{ id: number; name: string; stepName: string; minutes: number | null; stepIndex: number; totalSteps: number }>;
    pendingCount: number;
  };
} {
  const switcherEntries = model.switcher.map((entry) => ({
    id: entry.taskId,
    name: entry.name,
    stepName: entry.stepName,
    minutes: entry.stepMinutes,
    stepIndex: entry.stepIndex,
    totalSteps: entry.totalSteps,
  }));

  const activeEntry = switcherEntries.find((entry, index) => model.switcher[index].isActive) ?? null;
  const alternatives = switcherEntries.filter((entry, index) => !model.switcher[index].isActive);

  return {
    taskId: model.task.id,
    taskName: model.task.name,
    step: {
      id: model.current.id,
      title: model.current.name,
      minutes: model.current.duration_min,
      stepIndex: model.stepIndex,
      totalSteps: model.totalSteps,
    },
    queue: model.upcoming.map((step) => ({
      id: step.id,
      name: step.name,
      minutes: step.duration_min,
    })),
    canPostpone: model.canPostpone,
    switcher: {
      show: alternatives.length > 0,
      active: activeEntry,
      alternatives,
      pendingCount: model.pendingCount,
    },
  };
}
