import { apiFetch, ENDPOINTS, ApiError } from './api';
import type { DescriptionSection, SuggestedStep } from '../types';

// IA — cliente del backend (issue #155). La key de Gemini vive SOLO en el backend
// (env de Render); acá solo se consume el endpoint autenticado con la sesión local.
export const AIService = {
  async suggestSteps(taskName: string, description?: string): Promise<SuggestedStep[]> {
    const data = await apiFetch<{ steps: SuggestedStep[] }>(ENDPOINTS.ai.suggestSteps, {
      method: 'POST',
      body: JSON.stringify({
        taskName: taskName.trim(),
        ...(description && description.trim() ? { description: description.trim() } : {}),
      }),
    });
    return data.steps;
  },

  async describeHelp(taskName: string): Promise<DescriptionSection[]> {
    const data = await apiFetch<{ sections: DescriptionSection[] }>(ENDPOINTS.ai.describeHelp, {
      method: 'POST',
      body: JSON.stringify({ taskName: taskName.trim() }),
    });
    return data.sections;
  },
};

// Mensaje claro ante el fallo de la IA (sin red, 429, 502, etc.) sin bloquear la
// creación manual (HU-14 / AC fallo de IA).
export function aiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'No se pudo generar la sugerencia. Intentá de nuevo.';
}
