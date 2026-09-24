import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('./api', () => {
  class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  }
  return {
    apiFetch: mocks.apiFetch,
    ApiError,
    ENDPOINTS: {
      ai: {
        suggestSteps: '/api/ai/suggest-steps',
        describeHelp: '/api/ai/describe-help',
      },
    },
  };
});

import { AIService, aiErrorMessage } from './AIService';
import { ApiError } from './api';

const mockedApiFetch = vi.mocked(mocks.apiFetch);

beforeEach(() => {
  mockedApiFetch.mockReset();
});

describe('AIService.suggestSteps', () => {
  it('llama al endpoint con nombre + descripcion y devuelve los pasos', async () => {
    const steps = [{ name: 'Leer capítulo 1', duration_min: 15 }];
    mockedApiFetch.mockResolvedValueOnce({ steps });

    await expect(AIService.suggestSteps('Estudiar SO', 'Memoria virtual')).resolves.toEqual(steps);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/ai/suggest-steps',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ taskName: 'Estudiar SO', description: 'Memoria virtual' }),
      }),
    );
  });

  it('omite description vacia o en blanco', async () => {
    mockedApiFetch.mockResolvedValueOnce({ steps: [] });

    await AIService.suggestSteps('Estudiar SO', '   ');

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/ai/suggest-steps',
      expect.objectContaining({ body: JSON.stringify({ taskName: 'Estudiar SO' }) }),
    );
  });

  it('propaga errores de la API (backend caido / 429 / 502)', async () => {
    mockedApiFetch.mockRejectedValueOnce(
      new ApiError(429, 'La IA está saturada. Intentá más tarde.'),
    );

    await expect(AIService.suggestSteps('Tarea')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('AIService.describeHelp', () => {
  it('llama al endpoint con taskName y devuelve las secciones', async () => {
    const sections = [
      { title: 'Objetivo', guiding_question: '¿Qué resultado concreto querés lograr?' },
    ];
    mockedApiFetch.mockResolvedValueOnce({ sections });

    await expect(AIService.describeHelp('Estudiar SO')).resolves.toEqual(sections);

    expect(mockedApiFetch).toHaveBeenCalledWith(
      '/api/ai/describe-help',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ taskName: 'Estudiar SO' }),
      }),
    );
  });
});

describe('aiErrorMessage', () => {
  it('devuelve el mensaje del ApiError', () => {
    expect(aiErrorMessage(new ApiError(502, 'El servicio de IA no está disponible'))).toBe(
      'El servicio de IA no está disponible',
    );
  });

  it('devuelve un mensaje genérico para errores no-API', () => {
    expect(aiErrorMessage(new Error('boom'))).toBe(
      'No se pudo generar la sugerencia. Intentá de nuevo.',
    );
  });
});
