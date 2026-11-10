import type { CreateTaskInput } from '../../../types';
import type { DraftStep } from '../hooks/draftStep';

/**
 * Arma el payload para crear la tarea desde su borrador.
 * Recorta título y notas, y arma los pasos en el orden recibido.
 */
export function buildCreatePayload(params: {
  title: string;
  notes: string;
  dueDate: string | undefined;
  steps: DraftStep[];
}): {
  input: CreateTaskInput;
  steps: Array<{ name: string; duration_min: number | null }>;
} {
  const { title, notes, dueDate, steps } = params;
  return {
    input: {
      name: title.trim(),
      description: notes.trim() || null,
      due_date: dueDate ?? null,
    },
    steps: steps
      .map((st) => ({ name: st.name.trim(), duration_min: st.duration_min }))
      .filter((st) => st.name.length > 0),
  };
}
