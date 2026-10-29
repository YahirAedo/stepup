/**
 * Función pura: decide si se bloquea la salida de la pantalla de edición.
 *
 * Reglas:
 * - Si hay cambios sin guardar Y no se está guardando ni borrando → bloquear.
 * - Si skipGuard es true (salida intencional) → no bloquear.
 */
export function shouldBlockLeave(params: {
  hasUnsaved: boolean;
  skipGuard: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}): boolean {
  if (params.skipGuard) return false;
  if (params.isSaving) return false;
  if (params.isDeleting) return false;
  return params.hasUnsaved;
}
