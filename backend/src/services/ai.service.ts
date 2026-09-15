import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/env';

export class AiProviderError extends Error {
  constructor(message = 'El servicio de IA no está disponible') {
    super(message);
    this.name = 'AiProviderError';
  }
}

export class AiRateLimitError extends Error {
  constructor(message = 'El servicio de IA está saturado') {
    super(message);
    this.name = 'AiRateLimitError';
  }
}

export interface SuggestedStep {
  name: string;
  duration_min: number;
}

export interface DescriptionSection {
  title: string;
  guiding_question: string;
}

export const STEP_MIN_MINUTES = 5;
export const STEP_MAX_MINUTES = 25;
export const MIN_STEPS = 3;
export const MAX_STEPS = 8;
export const MAX_SECTIONS = 6;

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const STEP_NAME_MAX = 200;
const SECTION_TEXT_MAX = 300;

export interface AIServiceOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  baseDelayMs?: number;
  fetchImpl?: typeof fetch;
}

function buildSuggestStepsPrompt(taskName: string, description?: string): string {
  const contexto = description?.trim() ? [`Descripción y contexto de la tarea: ${description.trim()}`] : [];
  return [
    'Sos el asistente de planificación de StepUp, una app que divide tareas en pasos pequeños.',
    'Dividí la tarea del usuario en una secuencia de pasos accionables.',
    '',
    'Reglas obligatorias:',
    `- Generá entre ${MIN_STEPS} y ${MAX_STEPS} pasos según el tamaño de la tarea.`,
    '- Cada paso empieza con un verbo concreto en infinitivo (ej: "Leer", "Buscar", "Redactar").',
    `- La duración estimada de cada paso es un entero entre ${STEP_MIN_MINUTES} y ${STEP_MAX_MINUTES} minutos.`,
    '- Los pasos se derivan del contexto dado; nunca pasos genéricos como "Empezar la tarea".',
    '- Los pasos están en orden lógico de ejecución.',
    '- No numeres los pasos en el nombre.',
    '',
    'Respondé únicamente con un objeto JSON válido, sin texto adicional, con esta forma exacta:',
    '{"steps": [{"name": "Leer el capítulo 3", "duration_min": 15}]}',
    '',
    `Tarea: ${taskName}`,
    ...contexto,
  ].join('\n');
}

function buildDescribeHelpPrompt(taskName: string): string {
  return [
    'Sos el asistente de descripción de StepUp, una app que divide tareas en pasos pequeños.',
    'El usuario quiere escribir una buena descripción/contexto para su tarea.',
    'Proponé una estructura de descripción adaptada a esta tarea en particular.',
    '',
    'Reglas obligatorias:',
    '- Generá entre 3 y 5 secciones.',
    '- NO escribas la descripción por el usuario: cada sección es una guía de qué escribir.',
    '- Los títulos son cortos y las preguntas orientan qué contexto conviene dar.',
    '',
    'Respondé únicamente con un objeto JSON válido, sin texto adicional, con esta forma exacta:',
    '{"sections": [{"title": "Objetivo", "guiding_question": "¿Qué resultado concreto querés lograr?"}]}',
    '',
    `Tarea: ${taskName}`,
  ].join('\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object') {
    const wrapped = (raw as Record<string, unknown>).steps ?? (raw as Record<string, unknown>).sections;
    if (Array.isArray(wrapped)) {
      return wrapped;
    }
  }
  throw new AiProviderError();
}

export function sanitizeSteps(raw: unknown): SuggestedStep[] {
  const cleaned: SuggestedStep[] = [];
  for (const item of extractArray(raw)) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name) continue;
    const durationRaw = typeof entry.duration_min === 'number' ? entry.duration_min : Number(entry.duration_min);
    if (!Number.isFinite(durationRaw)) continue;
    const duration = Math.min(STEP_MAX_MINUTES, Math.max(STEP_MIN_MINUTES, Math.round(durationRaw)));
    cleaned.push({ name: name.slice(0, STEP_NAME_MAX), duration_min: duration });
  }
  if (cleaned.length < MIN_STEPS) {
    throw new AiProviderError();
  }
  return cleaned.slice(0, MAX_STEPS);
}

export function sanitizeSections(raw: unknown): DescriptionSection[] {
  const cleaned: DescriptionSection[] = [];
  for (const item of extractArray(raw)) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;
    const title = typeof entry.title === 'string' ? entry.title.trim() : '';
    const question = typeof entry.guiding_question === 'string' ? entry.guiding_question.trim() : '';
    if (!title || !question) continue;
    cleaned.push({
      title: title.slice(0, SECTION_TEXT_MAX),
      guiding_question: question.slice(0, SECTION_TEXT_MAX),
    });
  }
  if (cleaned.length === 0) {
    throw new AiProviderError();
  }
  return cleaned.slice(0, MAX_SECTIONS);
}

function extractGeminiText(payload: unknown): string {
  const candidates = (payload as { candidates?: unknown })?.candidates;
  if (!Array.isArray(candidates)) {
    throw new AiProviderError();
  }
  const parts = (candidates[0] as { content?: { parts?: unknown } })?.content?.parts;
  const text = Array.isArray(parts) ? (parts[0] as { text?: unknown })?.text : undefined;
  if (typeof text !== 'string' || !text.trim()) {
    throw new AiProviderError();
  }
  return text;
}

export class AIService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AIServiceOptions = {}) {
    this.apiKey = options.apiKey ?? GEMINI_API_KEY;
    this.model = options.model ?? GEMINI_MODEL;
    this.timeoutMs = options.timeoutMs ?? (Number(process.env.GEMINI_TIMEOUT_MS) || 90000);
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? (Number(process.env.GEMINI_RETRY_BASE_DELAY_MS) || 1000);
    this.fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));
  }

  async suggestSteps(taskName: string, description?: string): Promise<SuggestedStep[]> {
    const raw = await this.callGemini(buildSuggestStepsPrompt(taskName, description));
    return sanitizeSteps(raw);
  }

  async describeHelp(taskName: string): Promise<DescriptionSection[]> {
    const raw = await this.callGemini(buildDescribeHelpPrompt(taskName));
    return sanitizeSections(raw);
  }

  private async callGemini(prompt: string): Promise<unknown> {
    const url = `${GEMINI_BASE_URL}/${this.model}:generateContent`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    });

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      let response: Response;
      try {
        response = await this.fetchWithTimeout(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body,
        });
      } catch {
        throw new AiProviderError();
      }

      if (response.ok) {
        const payload = await response.json().catch(() => {
          throw new AiProviderError();
        });
        const text = extractGeminiText(payload);
        try {
          return JSON.parse(text);
        } catch {
          throw new AiProviderError();
        }
      }

      if (response.status === 429 || response.status >= 500) {
        const retryable = attempt < this.maxAttempts - 1;
        if (retryable) {
          await sleep(this.baseDelayMs * 2 ** attempt);
          continue;
        }
        if (response.status === 429) {
          throw new AiRateLimitError();
        }
        throw new AiProviderError();
      }

      throw new AiProviderError();
    }

    throw new AiProviderError();
  }

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetchImpl(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}
