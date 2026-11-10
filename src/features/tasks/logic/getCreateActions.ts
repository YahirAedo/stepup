/**
 * Acciones del pie en Crear: guardar exige título no vacío;
 * guardar y empezar además exige al menos un paso.
 */
export function getCreateActions(params: {
  title: string;
  stepsCount: number;
  isSaving: boolean;
}): { canSave: boolean; canSaveAndStart: boolean } {
  const { title, stepsCount, isSaving } = params;
  const canSave = title.trim().length > 0 && !isSaving;
  const canSaveAndStart = canSave && stepsCount > 0;
  return { canSave, canSaveAndStart };
}
