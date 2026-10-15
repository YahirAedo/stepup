/**
 * Fixtures del flujo Variante C "Sendero" (Design Lab, epico Tareas).
 *
 * Variante C: plantillas reutilizables (`TemplatePicker`), timeline vertical con
 * minutos acumulados (`TimelineStep`) y fila de progreso (`TaskProgressRow`).
 * Cubre las 4 pantallas del flujo (Listado, Crear, Detalle, Editar) sobre el
 * mismo caso de negocio que `tareasFixtures.ts` ("Rediseño de Propuesta
 * Comercial Q3").
 *
 * ⚠️ Campos marcados con `// REQUIERE MIGRACIÓN` NO existen en el modelo real
 * (`Task { title, description?, due_date?, status: active|completed }` /
 * `Step { title, duration_min, order_index, status: pending|completed }`):
 * requieren migracion de modelo (plantillas reutilizables) o estado de sesion
 * de foco. Se incluyen solo para evaluar la visual; el PR documenta que hace
 * falta.
 */

import type { MciSymbolKey } from '../../components/designlab/mciIconMap';
import { clockLabel, computeTotalMinutes, stepStartMinutes } from '../../utils/microplan';

export type FlujoCFilterKey = 'activas' | 'pausa' | 'completadas';

/** Paso con datos de progreso (shape compatible con `StepProgressInput`). */
export interface FlujoCPasoProgress {
  title: string;
  duration_min?: number | null;
  completed?: boolean;
}

/* ------------------------------------------------------------------ */
/* Listado                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoCListadoFixtures {
  headerTitle: string;
  pageTitle: string;
  summary: {
    todayCompleted: number;
    /** REQUIERE MIGRACIÓN: "en foco" es estado de sesión de foco activa, no un campo de Task. */
    focusActive: number;
    queueCount: number;
  };
  /** REQUIERE MIGRACIÓN: filtro "En pausa" — Task.status solo tiene active|completed. */
  filters: Array<{ key: FlujoCFilterKey; label: string; count: number }>;
  /** Tarjeta "sendero principal": fila de progreso sobre los pasos de la tarea. */
  sendero: {
    badge: string;
    title: string;
    description: string;
    steps: FlujoCPasoProgress[];
  };
  /** REQUIERE MIGRACIÓN: las plantillas viven en el formulario (TareaCForm), no hay entidad "plantilla" en el modelo. */
  templatesEntry: { title: string; subtitle: string };
  queue: {
    title: string;
    items: Array<{ id: string; title: string; steps: FlujoCPasoProgress[] }>;
  };
  quickCreate: { placeholder: string; ctaLabel: string };
}

/* ------------------------------------------------------------------ */
/* Detalle                                                             */
/* ------------------------------------------------------------------ */

export type FlujoCVariantPaso = 'completed' | 'active' | 'pending';

export interface FlujoCPasoTimeline {
  variant: FlujoCVariantPaso;
  title: string;
  meta: string;
  durationMin: number;
  completed: boolean;
  /** Minuto acumulado en el que arranca el paso (`stepStartMinutes`). */
  startMinutes: number;
  description?: string;
}

export interface FlujoCDetalleFixtures {
  headerTitle: string;
  summary: {
    statusBadge: { prefix: string; of: string };
    title: string;
    description: string;
    /** Minutos acumulados del sendero completo (`clockLabel(computeTotalMinutes(...))`). */
    totalClock: string;
  };
  stepsTitle: string;
  editStepLabel: string;
  steps: FlujoCPasoTimeline[];
  management: Array<{ key: string; label: string; icon: MciSymbolKey }>;
  calm: { title: string; body: string };
  actions: { primary: string };
}

/* ------------------------------------------------------------------ */
/* Formulario (Crear / Editar)                                         */
/* ------------------------------------------------------------------ */

export interface FlujoCFormStep {
  id: string;
  title: string;
  minutes: number;
}

export interface FlujoCFormFixtures {
  frictionBanner: string;
  titleLabel: string;
  titlePlaceholder: string;
  titleMaxLength: number;
  longTitleMicrocopy: string;
  notesLabel: string;
  notesPlaceholder: string;
  templatesTitle: string;
  stepsTitle: string;
  ai: {
    title: string;
    cta: string;
    hint: string;
    loadingMessage: string;
    readyMessage: string;
    errorMessage: string;
    offlineMessage: string;
  };
  /** REQUIERE MIGRACIÓN: sugerencia de pasos con IA (endpoint remoto) no existe. */
  suggestedSteps: FlujoCFormStep[];
  addManualLabel: string;
  addInline: {
    heading: string;
    placeholder: string;
    suggestedMinutes: number;
    maxMinutes: number;
  };
  timelineTitle: string;
}

export interface FlujoCTemplate {
  id: string;
  name: string;
  iconKey: MciSymbolKey;
  stepCount: number;
  totalMinutes: number;
  steps: FlujoCFormStep[];
}

/* ------------------------------------------------------------------ */
/* Data de las pantallas                                               */
/* ------------------------------------------------------------------ */

export const flujoCListadoFixtures: FlujoCListadoFixtures = {
  headerTitle: 'Tareas',
  pageTitle: 'Tu sendero de hoy',
  summary: {
    todayCompleted: 4,
    focusActive: 1,
    queueCount: 2,
  },
  // REQUIERE MIGRACIÓN: el filtro "En pausa" necesita un status más allá de active|completed.
  filters: [
    { key: 'activas', label: 'Activas', count: 3 },
    { key: 'pausa', label: 'En pausa', count: 2 },
    { key: 'completadas', label: 'Completadas', count: 8 },
  ],
  sendero: {
    badge: 'Sendero principal',
    title: 'Rediseño de Propuesta Comercial Q3',
    description: 'Cuatro pasos y 11 minutos acumulados. El primero es el más corto.',
    steps: [
      { title: 'Recopilar métricas de abril y mayo', duration_min: 2, completed: true },
      { title: 'Escribir las 3 viñetas clave', duration_min: 4, completed: false },
      { title: 'Exportar borrador PDF a Figma', duration_min: 3, completed: false },
      { title: 'Enviar enlace de revisión a Sofía', duration_min: 2, completed: false },
    ],
  },
  // REQUIERE MIGRACIÓN: "plantilla" no es una entidad del modelo (Task/Step).
  templatesEntry: {
    title: 'Empezar con una plantilla',
    subtitle: 'Pasos armados que ajustás en un minuto',
  },
  queue: {
    title: 'Otras tareas',
    items: [
      {
        id: 'qc1',
        title: 'Revisión y respuesta a email de cliente',
        steps: [
          { title: 'Leer el hilo completo', duration_min: 2, completed: true },
          { title: 'Redactar la respuesta', duration_min: 4, completed: false },
          { title: 'Enviar y archivar', duration_min: 2, completed: false },
        ],
      },
      {
        id: 'qc2',
        title: 'Actualizar dependencias del proyecto',
        steps: [
          { title: 'Revisar changelog de updates', duration_min: 3, completed: false },
          { title: 'Correr los tests en local', duration_min: 3, completed: false },
        ],
      },
    ],
  },
  quickCreate: {
    placeholder: 'Ej: responder el mail de Sofía',
    ctaLabel: 'Crear',
  },
};

const detallePasosBase: Array<Omit<FlujoCPasoTimeline, 'startMinutes'>> = [
  {
    variant: 'completed',
    title: 'Abrir borrador y listar puntos de dolor',
    meta: 'Completado',
    durationMin: 2,
    completed: true,
  },
  {
    variant: 'active',
    title: 'Escribir las 3 viñetas de solución técnica',
    meta: 'Ahora',
    durationMin: 4,
    completed: false,
    description: 'Solo concéntrate en la arquitectura y beneficios clave. Sin adjetivos de venta aún.',
  },
  {
    variant: 'pending',
    title: 'Estimar calendario de entregas',
    meta: 'Sigue',
    durationMin: 3,
    completed: false,
  },
  {
    variant: 'pending',
    title: 'Lectura final rápida y exportar PDF',
    meta: 'Al final',
    durationMin: 2,
    completed: false,
  },
];

const detalleStarts = stepStartMinutes(detallePasosBase.map((step) => ({ duration_min: step.durationMin })));
const detalleTotal = computeTotalMinutes(detallePasosBase.map((step) => ({ duration_min: step.durationMin })));

export const flujoCDetalleFixtures: FlujoCDetalleFixtures = {
  headerTitle: 'Detalle de tarea',
  summary: {
    statusBadge: { prefix: 'Paso', of: 'de' },
    title: 'Rediseño de Propuesta Comercial Q3',
    description:
      'Preparar el documento para el cliente corporativo. Prioridad al alcance técnico antes de afinar márgenes.',
    totalClock: clockLabel(detalleTotal),
  },
  stepsTitle: 'Sendero de pasos',
  editStepLabel: 'Editar paso',
  steps: detallePasosBase.map((step, index) => ({ ...step, startMinutes: detalleStarts[index] })),
  management: [
    { key: 'editar', label: 'Editar tarea', icon: 'edit' },
    { key: 'reordenar', label: 'Reordenar', icon: 'swap_vert' },
    // REQUIERE MIGRACIÓN: guardar una tarea como plantilla reutilizable no existe en el modelo.
    { key: 'plantilla', label: 'Plantilla', icon: 'content_copy' },
  ],
  calm: {
    title: 'Respiro en el sendero',
    body: 'No necesitás recorrer todos los pasos hoy. Uno solo basta para vencer la resistencia.',
  },
  actions: {
    primary: 'Marcar paso como hecho',
  },
};

export const flujoCFormFixtures: FlujoCFormFixtures = {
  frictionBanner: 'Un paso de 2 minutos alcanza para abrir el sendero.',
  titleLabel: '¿Qué tenés que hacer?',
  titlePlaceholder: 'Ej: Rediseño de propuesta comercial Q3',
  titleMaxLength: 60,
  longTitleMicrocopy: '¿Proyecto grande? Bajalo a pasos chicos abajo.',
  notesLabel: 'Notas o contexto (opcional)',
  notesPlaceholder: 'Ej: el cliente pidió foco en el alcance técnico.',
  templatesTitle: 'Empezar con una plantilla',
  stepsTitle: 'Pasos',
  ai: {
    title: 'Pasos con IA',
    cta: 'Sugerir pasos',
    hint: 'La IA propone bloques cortos. Vos decidís editarlos o quitarlos.',
    loadingMessage: 'Pensando pasos cortos…',
    readyMessage: 'Listo. Revisá y ajustá los pasos propuestos.',
    errorMessage: 'No pudimos sugerir los pasos. Probá de nuevo.',
    offlineMessage: 'Estás sin conexión. Podés cargar los pasos a mano.',
  },
  // REQUIERE MIGRACIÓN: sugerencia de pasos con IA — no existe el endpoint.
  suggestedSteps: [
    { id: 'ai-1', title: 'Abrir el borrador actual', minutes: 2 },
    { id: 'ai-2', title: 'Listar los 3 puntos de dolor principales', minutes: 3 },
    { id: 'ai-3', title: 'Redactar una viñeta por punto', minutes: 4 },
  ],
  addManualLabel: 'Añadir paso manual',
  addInline: {
    heading: 'Nuevo paso',
    placeholder: 'Ej: enviar el enlace a Sofía para revisar',
    suggestedMinutes: 3,
    maxMinutes: 10,
  },
  timelineTitle: 'Tu sendero',
};

export const flujoCFormCreateDefaults = {
  title: '',
  notes: '',
  steps: [] as FlujoCFormStep[],
};

export const flujoCFormEditDefaults = {
  title: 'Rediseño de Propuesta Comercial Q3',
  notes: 'Entrega para el cliente corporativo. Confirmar márgenes con Sofía antes de exportar.',
  steps: [
    { id: 'e1', title: 'Abrir borrador y listar puntos de dolor', minutes: 2 },
    { id: 'e2', title: 'Escribir las 3 viñetas de solución técnica', minutes: 4 },
    { id: 'e3', title: 'Estimar calendario de entregas', minutes: 3 },
    { id: 'e4', title: 'Lectura final rápida y exportar PDF', minutes: 2 },
  ] as FlujoCFormStep[],
};

/* ------------------------------------------------------------------ */
/* Plantillas (solo variante C)                                        */
/* ------------------------------------------------------------------ */

/** Deriva `stepCount` y `totalMinutes` de los pasos para no duplicar números a mano. */
function buildTemplate(
  template: Omit<FlujoCTemplate, 'stepCount' | 'totalMinutes'>
): FlujoCTemplate {
  return {
    ...template,
    stepCount: template.steps.length,
    totalMinutes: computeTotalMinutes(template.steps.map((step) => ({ duration_min: step.minutes }))),
  };
}

// REQUIERE MIGRACIÓN: una "plantilla" reutilizable no existe en el modelo real
// (no hay entidad ni tabla de plantillas; se guardaría como Task/Step normal).
export const flujoCTemplateFixtures: FlujoCTemplate[] = [
  buildTemplate({
    id: 'tpl-propuesta',
    name: 'Propuesta comercial',
    iconKey: 'label_important',
    steps: [
      { id: 'p1', title: 'Abrir el borrador actual', minutes: 2 },
      { id: 'p2', title: 'Listar los 3 puntos de dolor', minutes: 3 },
      { id: 'p3', title: 'Redactar una viñeta por punto', minutes: 4 },
      { id: 'p4', title: 'Exportar a PDF y revisar', minutes: 2 },
    ],
  }),
  buildTemplate({
    id: 'tpl-inbox',
    name: 'Revisión de inbox',
    iconKey: 'add_task',
    steps: [
      { id: 'p1', title: 'Ordenar por urgencia', minutes: 2 },
      { id: 'p2', title: 'Responder lo importante', minutes: 4 },
      { id: 'p3', title: 'Archivar el resto', minutes: 2 },
    ],
  }),
  buildTemplate({
    id: 'tpl-expres',
    name: 'Arranque exprés',
    iconKey: 'bolt',
    steps: [
      { id: 'p1', title: 'Abrir el archivo de trabajo', minutes: 2 },
      { id: 'p2', title: 'Escribir la primera idea', minutes: 2 },
    ],
  }),
  buildTemplate({
    id: 'tpl-copia',
    name: 'Copia de documentos',
    iconKey: 'content_copy',
    steps: [
      { id: 'p1', title: 'Duplicar el documento base', minutes: 2 },
      { id: 'p2', title: 'Actualizar los datos del cliente', minutes: 4 },
      { id: 'p3', title: 'Revisar la versión final', minutes: 3 },
    ],
  }),
  buildTemplate({
    id: 'tpl-rutina',
    name: 'Rutina verde',
    iconKey: 'eco',
    steps: [
      { id: 'p1', title: 'Regar las plantas del escritorio', minutes: 2 },
      { id: 'p2', title: 'Ventilar y ordenar el espacio', minutes: 3 },
      { id: 'p3', title: 'Dejar listo el próximo paso', minutes: 3 },
    ],
  }),
];

export const flujoCCrearFixtures = {
  headerTitle: 'Crear tarea',
  primary: 'Crear y ver el sendero',
  secondary: 'Volver al listado',
};

export const flujoCEditarFixtures = {
  headerTitle: 'Editar tarea',
  primary: 'Guardar y ver el sendero',
  secondary: 'Cancelar',
};
