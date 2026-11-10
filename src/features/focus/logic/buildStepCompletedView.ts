/**
 * Lógica pura de los datos de la vista de paso completado.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export interface StepCompletedViewData {
  durationLabel: string | null;
  nextStepName: string | null;
  nextStepMinutesLabel: string | null;
}

export function buildStepCompletedView(input: {
  minutes: number | null;
  nextStep: { name: string; minutes: number | null } | null;
}): StepCompletedViewData {
  const durationLabel =
    input.minutes !== null && input.minutes > 0 ? `${input.minutes} min` : null;

  if (input.nextStep === null) {
    return { durationLabel, nextStepName: null, nextStepMinutesLabel: null };
  }

  const nextStepMinutesLabel =
    input.nextStep.minutes !== null && input.nextStep.minutes > 0
      ? `${input.nextStep.minutes} min`
      : null;

  return {
    durationLabel,
    nextStepName: input.nextStep.name,
    nextStepMinutesLabel,
  };
}
