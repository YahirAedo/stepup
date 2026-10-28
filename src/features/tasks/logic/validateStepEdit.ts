/**
 * Valida los datos de edición de un paso.
 *
 * Reglas:
 * - Nombre no vacío (después de trim).
 * - Duración válida: número >= 1.
 *
 * @returns { ok: boolean; error?: string }
 */
export function validateStepEdit(
  title: string,
  duration: number | null,
): { ok: boolean; error?: string } {
  if (!title || !title.trim()) {
    return { ok: false, error: 'El nombre no puede estar vacío' };
  }
  if (duration === null || duration < 1 || !Number.isFinite(duration)) {
    return { ok: false, error: 'La duración debe ser al menos 1 minuto' };
  }
  return { ok: true };
}
