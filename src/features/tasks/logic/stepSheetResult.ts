export interface DraftStep {
  key: string;
  id: number | null;
  name: string;
  duration_min: number | null;
}

export type StepSheetTarget = null | { mode: 'create' } | { mode: 'edit'; key: string };

export interface StepSheetValues {
  title: string;
  duration: number;
}

export interface StepSheetPosition {
  position: number;
  total: number;
}

/**
 * Función pura: aplica el resultado del sheet de edición/creación de paso
 * a la lista de pasos del borrador.
 *
 * - mode 'create': agrega un nuevo paso al final (id: null, key: newKey).
 * - mode 'edit': actualiza solo el paso con la key indicada.
 * - key inexistente: devuelve la lista sin cambios.
 * - No muta la entrada.
 * - El nombre se guarda recortado.
 */
export function applyStepSheetResult(
  steps: ReadonlyArray<DraftStep>,
  target: StepSheetTarget,
  values: StepSheetValues,
  newKey: string,
): DraftStep[] {
  if (target === null) return [...steps];

  if (target.mode === 'create') {
    return [
      ...steps,
      {
        key: newKey,
        id: null,
        name: values.title.trim(),
        duration_min: values.duration,
      },
    ];
  }

  // mode 'edit'
  return steps.map((step) =>
    step.key === target.key
      ? { ...step, name: values.title.trim(), duration_min: values.duration }
      : step,
  );
}

/**
 * Función pura: calcula la posición y el total para el sheet.
 *
 * Cuenta solo los pasos no marcados para borrar.
 * - create: (n+1, n+1) donde n = pasos visibles.
 * - edit: posición real del paso entre los visibles (1-based), total = n.
 */
export function getStepSheetPosition(
  steps: ReadonlyArray<DraftStep>,
  pendingDeletes: ReadonlySet<string>,
  target: StepSheetTarget,
): StepSheetPosition {
  const visible = steps.filter((s) => !pendingDeletes.has(s.key));
  const n = visible.length;

  if (target === null || target.mode === 'create') {
    return { position: n + 1, total: n + 1 };
  }

  // mode 'edit'
  const index = visible.findIndex((s) => s.key === target.key);
  const position = index >= 0 ? index + 1 : n;
  return { position, total: n };
}
