import type { DraftStep } from '../types';

export interface ParsedDraftStep {
  name: string;
  duration_min: number | null;
}

export type ParseDraftResult =
  { ok: true; steps: ParsedDraftStep[] } | { ok: false; message: string };

// Validación del borrador editable de pasos (issues #155/#157): el nombre no puede
// quedar vacío y la duración, si se completa, debe ser un entero positivo en minutos.
// Reutilizada por TaskForm (tarea + pasos juntos) y TaskDetail (agregar a tarea existente).
export function parseDraftSteps(draft: DraftStep[]): ParseDraftResult {
  const steps: ParsedDraftStep[] = [];
  for (let i = 0; i < draft.length; i++) {
    const stepName = draft[i].name.trim();
    if (!stepName) {
      return { ok: false, message: `El paso ${i + 1} del borrador tiene que tener un nombre.` };
    }
    const rawDuration = draft[i].durationMin.trim();
    const duration = rawDuration ? Number(rawDuration) : null;
    if (rawDuration && (!Number.isInteger(duration) || (duration ?? 0) <= 0)) {
      return {
        ok: false,
        message: `La duración del paso ${i + 1} debe ser un número de minutos válido.`,
      };
    }
    steps.push({ name: stepName, duration_min: duration });
  }
  return { ok: true, steps };
}
