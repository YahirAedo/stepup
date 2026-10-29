export interface DraftStep {
  key: string;
  id: number | null;
  name: string;
  duration_min: number | null;
}

export interface OriginalStep {
  key: string;
  id: number;
  name: string;
  duration_min: number | null;
}

export interface OriginalState {
  name: string;
  description: string | null;
  due_date: string | null;
  steps: OriginalStep[];
}

export interface DraftState {
  name: string;
  description: string;
  due_date: string | null;
  steps: DraftStep[];
  pendingDeletes: ReadonlySet<string>;
}

export interface EditPlan {
  taskPatch: Partial<{ name: string; description: string | null; due_date: string | null }>;
  stepUpdates: Array<{ id: number; name: string; duration_min: number | null }>;
  stepDeletes: number[];
  stepAdds: Array<{ name: string; duration_min: number | null }>;
  finalOrder: string[];
}

export function buildEditPlan(
  original: OriginalState,
  draft: DraftState,
): EditPlan {
  const taskPatch: EditPlan['taskPatch'] = {};
  if (original.name !== draft.name.trim()) {
    taskPatch.name = draft.name.trim();
  }
  const draftDesc = draft.description.trim() || null;
  if (original.description !== draftDesc) {
    taskPatch.description = draftDesc;
  }
  if (original.due_date !== draft.due_date) {
    taskPatch.due_date = draft.due_date;
  }

  const stepUpdates: EditPlan['stepUpdates'] = [];
  const stepDeletes: number[] = [];
  const stepAdds: EditPlan['stepAdds'] = [];

  for (const origStep of original.steps) {
    if (draft.pendingDeletes.has(origStep.key)) {
      stepDeletes.push(origStep.id);
    } else {
      const draftStep = draft.steps.find((s) => s.key === origStep.key);
      if (draftStep) {
        if (
          origStep.name !== draftStep.name.trim() ||
          origStep.duration_min !== draftStep.duration_min
        ) {
          stepUpdates.push({
            id: origStep.id,
            name: draftStep.name.trim(),
            duration_min: draftStep.duration_min,
          });
        }
      }
    }
  }

  for (const draftStep of draft.steps) {
    if (draftStep.id === null && !draft.pendingDeletes.has(draftStep.key)) {
      stepAdds.push({
        name: draftStep.name.trim(),
        duration_min: draftStep.duration_min,
      });
    }
  }

  const finalOrder = draft.steps
    .filter((s) => !draft.pendingDeletes.has(s.key))
    .map((s) => s.key);

  return { taskPatch, stepUpdates, stepDeletes, stepAdds, finalOrder };
}

export function hasUnsavedChanges(
  original: OriginalState,
  draft: DraftState,
): boolean {
  const plan = buildEditPlan(original, draft);
  return (
    Object.keys(plan.taskPatch).length > 0 ||
    plan.stepUpdates.length > 0 ||
    plan.stepDeletes.length > 0 ||
    plan.stepAdds.length > 0 ||
    plan.finalOrder.join(',') !== original.steps.map((s) => s.key).join(',')
  );
}

export function validateTaskEdit(name: string): { ok: boolean; error?: string } {
  if (!name.trim()) {
    return { ok: false, error: 'El nombre de la tarea no puede estar vacío.' };
  }
  if (name.trim().length > 120) {
    return { ok: false, error: 'El nombre no puede superar los 120 caracteres.' };
  }
  return { ok: true };
}
