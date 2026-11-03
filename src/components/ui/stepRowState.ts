/**
 * Función pura: calcula el estado visual/accesible de una fila de paso.
 *
 * No depende de React ni del theme. Solo describe qué debe mostrar/permitir.
 */
export interface StepRowStateInput {
  name: string;
  completed: boolean;
  pendingDelete: boolean;
  readOnly: boolean;
  hasOnPress: boolean;
}

export interface StepRowState {
  disabled: boolean;
  dimmed: boolean;
  showCheck: boolean;
  a11yLabel: string;
}

export function getStepRowState({
  name,
  completed,
  pendingDelete,
  readOnly,
  hasOnPress,
}: StepRowStateInput): StepRowState {
  const disabled = readOnly || pendingDelete || (completed && !hasOnPress);
  const dimmed = disabled;
  const showCheck = completed && !pendingDelete;
  let a11yLabel = name;
  if (pendingDelete) {
    a11yLabel = `${name}, marcado para borrar`;
  } else if (completed) {
    a11yLabel = `${name}, hecho`;
  }
  return { disabled, dimmed, showCheck, a11yLabel };
}
