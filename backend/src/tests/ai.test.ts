import request from 'supertest';
import { app, authHeader, registerUser, resetDb } from './helpers';
import {
  AiProviderError,
  MAX_STEPS,
  MIN_STEPS,
  STEP_MAX_MINUTES,
  STEP_MIN_MINUTES,
  sanitizeSections,
  sanitizeSteps,
} from '../services/ai.service';

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

let token = '';

function geminiResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function geminiJsonResponse(status: number, jsonText: string) {
  return geminiResponse(status, {
    candidates: [{ content: { parts: [{ text: jsonText }] } }],
  });
}

function geminiStepsResponse(steps: unknown[]) {
  return geminiJsonResponse(200, JSON.stringify({ steps }));
}

function geminiSectionsResponse(sections: unknown[]) {
  return geminiJsonResponse(200, JSON.stringify({ sections }));
}

const validSteps = [
  { name: 'Leer los apuntes de memoria', duration_min: 20 },
  { name: 'Resolver ejercicios de procesos', duration_min: 25 },
  { name: 'Repasar errores frecuentes del parcial', duration_min: 10 },
];

const validSections = [
  { title: 'Objetivo', guiding_question: '¿Qué resultado concreto querés lograr?' },
  { title: 'Contexto', guiding_question: '¿Qué temas o materiales están involucrados?' },
  { title: 'Límites', guiding_question: '¿Qué queda fuera de esta tarea?' },
];

beforeAll(async () => {
  await resetDb();
  const user = await registerUser();
  token = user.token;
});

beforeEach(() => {
  fetchMock.mockReset();
});

describe('POST /api/ai/suggest-steps', () => {
  it('requiere autenticación (401 sin token)', async () => {
    const res = await request(app).post('/api/ai/suggest-steps').send({ taskName: 'Estudiar' });
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza input inválido con 400 (taskName ausente)', async () => {
    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ description: 'sin nombre' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/taskName/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rechaza input inválido con 400 (taskName vacío)', async () => {
    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: '   ' });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('devuelve 200 con pasos sanitizados para input válido', async () => {
    fetchMock.mockResolvedValueOnce(geminiStepsResponse(validSteps));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial', description: 'SO, temas: memoria, procesos' });

    expect(res.status).toBe(200);
    expect(res.body.steps).toHaveLength(validSteps.length);
    expect(res.body.steps.length).toBeGreaterThanOrEqual(MIN_STEPS);
    expect(res.body.steps.length).toBeLessThanOrEqual(MAX_STEPS);
    for (const step of res.body.steps) {
      expect(typeof step.name).toBe('string');
      expect(step.name.length).toBeGreaterThan(0);
      expect(step.duration_min).toBeGreaterThanOrEqual(STEP_MIN_MINUTES);
      expect(step.duration_min).toBeLessThanOrEqual(STEP_MAX_MINUTES);
    }
  });

  it('llama a Gemini con el modelo configurado, key en header y salida JSON', async () => {
    fetchMock.mockResolvedValueOnce(geminiStepsResponse(validSteps));

    await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('gemini-3.5-flash:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('test-gemini-key');
    const body = JSON.parse(String(init.body));
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.contents[0].parts[0].text).toContain('Estudiar para el parcial');
  });

  it('devuelve 502 si Gemini cae (error de red)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(502);
    expect(res.body.message).toMatch(/no está disponible/);
  });

  it('devuelve 502 si Gemini devuelve timeout (abort)', async () => {
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(502);
  });

  it('reintenta ante 500 y devuelve 200 si Gemini se recupera', async () => {
    fetchMock
      .mockResolvedValueOnce(geminiResponse(500, {}))
      .mockResolvedValueOnce(geminiStepsResponse(validSteps));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('devuelve 502 si Gemini devuelve 5xx en todos los intentos', async () => {
    fetchMock.mockResolvedValue(geminiResponse(503, {}));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reintenta ante 429 con backoff y devuelve 200 si se recupera', async () => {
    fetchMock
      .mockResolvedValueOnce(geminiResponse(429, {}))
      .mockResolvedValueOnce(geminiResponse(429, {}))
      .mockResolvedValueOnce(geminiStepsResponse(validSteps));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('devuelve 429 si Gemini satura todos los intentos', async () => {
    fetchMock.mockResolvedValue(geminiResponse(429, {}));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/saturado/);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('devuelve 502 si la respuesta de Gemini no es JSON válido', async () => {
    fetchMock.mockResolvedValueOnce(geminiJsonResponse(200, 'no soy json'));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(502);
  });

  it('devuelve 502 si Gemini no devuelve candidatos', async () => {
    fetchMock.mockResolvedValueOnce(geminiResponse(200, { candidates: [] }));

    const res = await request(app)
      .post('/api/ai/suggest-steps')
      .set(authHeader(token))
      .send({ taskName: 'Estudiar para el parcial' });

    expect(res.status).toBe(502);
  });
});

describe('POST /api/ai/describe-help', () => {
  it('rechaza input inválido con 400', async () => {
    const res = await request(app).post('/api/ai/describe-help').set(authHeader(token)).send({});
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('devuelve 200 con secciones de guía contextual', async () => {
    fetchMock.mockResolvedValueOnce(geminiSectionsResponse(validSections));

    const res = await request(app)
      .post('/api/ai/describe-help')
      .set(authHeader(token))
      .send({ taskName: 'Organizar mi semana de estudio' });

    expect(res.status).toBe(200);
    expect(res.body.sections).toHaveLength(validSections.length);
    for (const section of res.body.sections) {
      expect(typeof section.title).toBe('string');
      expect(typeof section.guiding_question).toBe('string');
    }
  });

  it('devuelve 502 si Gemini cae', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const res = await request(app)
      .post('/api/ai/describe-help')
      .set(authHeader(token))
      .send({ taskName: 'Organizar mi semana de estudio' });

    expect(res.status).toBe(502);
  });
});

describe('sanitizeSteps', () => {
  const baseSteps = [
    { name: 'Paso uno', duration_min: 10 },
    { name: 'Paso dos', duration_min: 15 },
    { name: 'Paso tres', duration_min: 20 },
  ];

  it('descarta pasos sin nombre y clampa duraciones fuera de rango', () => {
    const result = sanitizeSteps({
      steps: [
        ...baseSteps,
        { name: '   ', duration_min: 10 },
        { name: 'Duración baja', duration_min: 1 },
        { name: 'Duración alta', duration_min: 999 },
        { name: 'Sin duración' },
      ],
    });

    expect(result).toHaveLength(5);
    expect(result.find((step) => step.name === 'Duración baja')?.duration_min).toBe(STEP_MIN_MINUTES);
    expect(result.find((step) => step.name === 'Duración alta')?.duration_min).toBe(STEP_MAX_MINUTES);
  });

  it('trunca la lista a 8 pasos', () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      name: `Paso ${index + 1}`,
      duration_min: 10,
    }));
    expect(sanitizeSteps({ steps: many })).toHaveLength(MAX_STEPS);
  });

  it('lanza AiProviderError si quedan menos de 3 pasos válidos', () => {
    expect(() => sanitizeSteps({ steps: [{ name: 'Único', duration_min: 10 }] })).toThrow(AiProviderError);
    expect(() => sanitizeSteps({ steps: 'no es array' })).toThrow(AiProviderError);
  });

  it('acepta array directo o envuelto en { steps }', () => {
    expect(sanitizeSteps(baseSteps)).toHaveLength(3);
    expect(sanitizeSteps({ steps: baseSteps })).toHaveLength(3);
  });
});

describe('sanitizeSections', () => {
  it('descarta secciones incompletas y lanza si no queda ninguna', () => {
    const result = sanitizeSections({
      sections: [...validSections, { title: 'Sin pregunta' }, { guiding_question: 'Sin título' }],
    });
    expect(result).toHaveLength(validSections.length);
    expect(() => sanitizeSections({ sections: [{ title: 'Incompleta' }] })).toThrow(AiProviderError);
  });
});
