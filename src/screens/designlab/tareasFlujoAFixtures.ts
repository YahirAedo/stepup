/**
 * Fixtures del flujo Variante A "Enfoque" (Design Lab, epico Tareas).
 *
 * Variante A: calma, una superficie primaria por pantalla, jerarquia vertical
 * y progreso lineal. Cubre las 4 pantallas del flujo (Listado, Crear, Detalle,
 * Editar) sobre el mismo caso de negocio que `tareasFixtures.ts` ("Rediseño de
 * Propuesta Comercial Q3").
 *
 * ⚠️ Campos marcados con `// REQUIERE MIGRACIÓN` NO existen en el modelo real
 * (`Task { title, description?, due_date?, status: active|completed }` /
 * `Step { title, duration_min, order_index, status: pending|completed }`):
 * requieren migracion de modelo o estado de sesion de foco. Se incluyen solo
 * para evaluar la visual; el PR documenta que hace falta.
 */

import type { FeaturedStep } from '../../components/designlab/FeaturedTaskCard';
import type { QueueTaskItem } from '../../components/designlab/QueueTaskRow';
import type { MciSymbolKey } from '../../components/designlab/mciIconMap';
import type { StepSequenceVariant } from '../../components/designlab/StepSequenceItem';

export type FlujoAFilterKey = 'activas' | 'pausa' | 'completadas';

/* ------------------------------------------------------------------ */
/* Listado                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoAListadoFixtures {
  headerTitle: string;
  pageTitle: string;
  summary: {
    todayCompleted: number;
    /** REQUIERE MIGRACIÓN: "en foco" es estado de sesión de foco activa, no un campo de Task. */
    focusActive: number;
    queueCount: number;
  };
  /** REQUIERE MIGRACIÓN: filtro "En pausa" — Task.status solo tiene active|completed. */
  filters: Array<{ key: FlujoAFilterKey; label: string; count: number }>;
  /** REQUIERE MIGRACIÓN: "en foco principal" + avance de sesión + paso en curso requieren una sesion de foco activa persistida. */
  featured: {
    badge: string;
    minutesLabel: string;
    title: string;
    stepLabel: string;
    stepTitle: string;
    sessionLabel: string;
    sessionPercent: number;
    primaryCta: string;
    toggleOpen: string;
    toggleClose: string;
    steps: FeaturedStep[];
  };
  quickCreate: {
    title: string;
    subtitle: string;
    badge: string;
  };
  queue: {
    title: string;
    subtitle: string;
    maxVisible: string;
    /** REQUIERE MIGRACIÓN: status 'draft' (borrador) no existe en el modelo de Task. */
    items: QueueTaskItem[];
  };
  /** REQUIERE MIGRACIÓN: modo túnel anti-abrumamiento es un concepto de producto a validar. */
  antiOverwhelm: {
    title: string;
    body: string;
    cta: string;
  };
  banner: {
    imageUrl: string;
    caption: string;
  };
}

/* ------------------------------------------------------------------ */
/* Detalle                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoAPasoDetalle {
  variant: StepSequenceVariant;
  title: string;
  meta: string;
  durationMin: number;
  description?: string;
  activeBadge?: string;
  activeCta?: string;
}

export interface FlujoADetalleFixtures {
  headerTitle: string;
  summary: {
    statusBadge: { prefix: string; of: string };
    title: string;
    description: string;
    paceLabel: string;
  };
  stepsTitle: string;
  editStepLabel: string;
  addStep: string;
  addStepInline: {
    heading: string;
    placeholder: string;
    suggestedMinutes: number;
    maxMinutes: number;
  };
  steps: FlujoAPasoDetalle[];
  management: Array<{ key: string; label: string; icon: MciSymbolKey }>;
  calm: { title: string; body: string };
  actions: {
    primaryPrefix: string;
    primarySuffix: string;
    secondary: string;
    /** REQUIERE MIGRACIÓN: iniciar una sesión de foco (registro de sesión + timer) no existe en el modelo. */
    startFocusLog: string;
  };
}

/* ------------------------------------------------------------------ */
/* Formulario (Crear / Editar)                                         */
/* ------------------------------------------------------------------ */

export interface FlujoAFormStep {
  id: string;
  title: string;
  minutes: number;
}

export interface FlujoAFormFixtures {
  frictionBanner: string;
  titleLabel: string;
  titlePlaceholder: string;
  titleMaxLength: number;
  longTitleMicrocopy: string;
  notesLabel: string;
  notesPlaceholder: string;
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
  suggestedSteps: FlujoAFormStep[];
  addManualLabel: string;
  addInline: {
    heading: string;
    placeholder: string;
    suggestedMinutes: number;
    maxMinutes: number;
  };
}

export const flujoAFormFixtures: FlujoAFormFixtures = {
  frictionBanner: 'Vence la inercia: un paso de 2 minutos alcanza para empezar.',
  titleLabel: '¿Qué tenés que hacer?',
  titlePlaceholder: 'Ej: Rediseño de propuesta comercial Q3',
  titleMaxLength: 60,
  longTitleMicrocopy: '¿Proyecto grande? Bajalo a pasos chicos abajo.',
  notesLabel: 'Notas o contexto (opcional)',
  notesPlaceholder: 'Ej: el cliente pidió foco en el alcance técnico.',
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
};

export const flujoAFormCreateDefaults = {
  title: '',
  notes: '',
  steps: [] as FlujoAFormStep[],
};

export const flujoAFormEditDefaults = {
  title: 'Rediseño de Propuesta Comercial Q3',
  notes: 'Entrega para el cliente corporativo. Confirmar márgenes con Sofía antes de exportar.',
  steps: [
    { id: 'e1', title: 'Abrir borrador y listar puntos de dolor', minutes: 2 },
    { id: 'e2', title: 'Escribir las 3 viñetas de solución técnica', minutes: 4 },
    { id: 'e3', title: 'Estimar calendario de entregas', minutes: 3 },
    { id: 'e4', title: 'Lectura final rápida y exportar PDF', minutes: 2 },
  ] as FlujoAFormStep[],
};

/* ------------------------------------------------------------------ */
/* Data de las pantallas                                               */
/* ------------------------------------------------------------------ */

export const flujoAListadoFixtures: FlujoAListadoFixtures = {
  headerTitle: 'Tareas',
  pageTitle: 'Tareas & Pasos',
  summary: {
    todayCompleted: 4,
    focusActive: 1,
    queueCount: 2,
  },
  // REQUIERE MIGRACIÓN: el filtro "En pausa" necesita un status beyond active|completed.
  filters: [
    { key: 'activas', label: 'Activas', count: 3 },
    { key: 'pausa', label: 'En pausa', count: 2 },
    { key: 'completadas', label: 'Completadas', count: 8 },
  ],
  featured: {
    badge: 'En foco principal',
    minutesLabel: '~4 min',
    title: 'Rediseño de Propuesta Comercial Q3',
    stepLabel: 'Paso 2/4',
    stepTitle: 'Escribir las 3 viñetas clave',
    sessionLabel: 'Avance de la sesión',
    sessionPercent: 0.5,
    primaryCta: 'Reanudar foco inmediato',
    toggleOpen: 'Ver detalle y pasos',
    toggleClose: 'Ocultar detalle de pasos',
    steps: [
      { done: true, current: false, title: '1. Recopilar métricas de abril y mayo (3 min)' },
      { done: false, current: true, title: '2. Escribir las 3 viñetas clave (4 min)' },
      { done: false, current: false, title: '3. Exportar borrador PDF a Figma (3 min)' },
      { done: false, current: false, title: '4. Enviar enlace de revisión a Sofía (2 min)' },
    ],
  },
  quickCreate: {
    title: 'Crear nueva tarea',
    subtitle: 'Empezá por una acción de 2 a 5 minutos',
    badge: 'Desglose anti-fricción',
  },
  queue: {
    title: 'Cola de espera',
    subtitle: '(Sin sobrecarga)',
    maxVisible: 'Máximo 3 visibles',
    items: [
      {
        id: 'qa1',
        name: 'Revisión y respuesta a email de cliente',
        stepCount: 3,
        totalMinutes: 8,
        status: 'ready',
        statusLabel: 'Lista para iniciar',
      },
      // REQUIERE MIGRACIÓN: status 'draft' (borrador) no existe en el modelo.
      {
        id: 'qa2',
        name: 'Actualizar dependencias de proyecto SQLite',
        stepCount: 2,
        totalMinutes: 6,
        status: 'draft',
        statusLabel: 'Borrador',
      },
    ],
  },
  antiOverwhelm: {
    title: '¿Muchas cosas pendientes?',
    body: 'Elegí solo una y ocultá el resto por 25 minutos. Tu mente necesita calma, no prisa.',
    cta: 'Activar modo túnel anti-abrumamiento',
  },
  banner: {
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA89s-vNTw3UF4Z1kl4Vw8s2HHfTL_Vtjh_xEAbXQb0B7ch_aXVK2w4WxgeVhFsYupSn9kw1SsH0wMcA0leIoAToe1swA9GzO7oG4Mjx9KQVKmyh_nsW1lEQxbVZ0bhNYHpBvxSVkn_NQXSJmuWkqxAZshpa6jtEr3wn4htjbswH7xOzeMXTGysGKox2nRU8tR2aKmq8gKKzSByB8ZPk35Nabqy0GDdUuv4TRjRhNcZ08VwEfvTHqZ_',
    caption: 'Un paso a la vez es suficiente para avanzar hoy.',
  },
};

export const flujoADetalleFixtures: FlujoADetalleFixtures = {
  headerTitle: 'Detalle de tarea',
  summary: {
    statusBadge: { prefix: 'Paso', of: 'de' },
    title: 'Rediseño de Propuesta Comercial Q3',
    description:
      'Preparar el documento para el cliente corporativo. Prioridad al alcance técnico antes de afinar márgenes.',
    paceLabel: 'Ritmo sereno',
  },
  stepsTitle: 'Secuencia de pasos',
  editStepLabel: 'Editar',
  addStep: 'Añadir paso',
  addStepInline: {
    heading: 'Añadir paso a la secuencia',
    placeholder: 'Ej: abrir el archivo y revisar el apartado de alcance',
    suggestedMinutes: 3,
    maxMinutes: 10,
  },
  steps: [
    {
      variant: 'completed',
      title: 'Abrir borrador y listar puntos de dolor',
      meta: 'Completado · 2 min',
      durationMin: 2,
    },
    {
      variant: 'active',
      title: 'Escribir las 3 viñetas de solución técnica',
      meta: 'En foco · 4 min',
      durationMin: 4,
      description: 'Solo concéntrate en la arquitectura y beneficios clave. Sin adjetivos de venta aún.',
      activeBadge: 'Foco actual',
      activeCta: 'Ejecutar este paso ahora',
    },
    {
      variant: 'pending',
      title: 'Estimar calendario de entregas',
      meta: 'En espera · 3 min',
      durationMin: 3,
    },
    {
      variant: 'pending',
      title: 'Lectura final rápida y exportar PDF',
      meta: 'En espera · 2 min',
      durationMin: 2,
    },
  ],
  management: [
    { key: 'editar', label: 'Editar tarea', icon: 'edit' },
    { key: 'reordenar', label: 'Reordenar', icon: 'swap_vert' },
    // REQUIERE MIGRACIÓN: guardar una tarea como plantilla reutilizable no existe en el modelo.
    { key: 'plantilla', label: 'Plantilla', icon: 'content_copy' },
  ],
  calm: {
    title: 'Respiro consciente',
    body: 'No necesitás completar todos los pasos hoy. Uno solo basta para vencer la resistencia.',
  },
  actions: {
    primaryPrefix: 'Iniciar paso',
    primarySuffix: 'en foco',
    secondary: 'Marcar tarea completa',
    startFocusLog: 'Start focus session',
  },
};

export const flujoACrearFixtures = {
  headerTitle: 'Crear tarea',
  primary: 'Activar y empezar',
  secondary: 'Guardar en cola',
};

export const flujoAEditarFixtures = {
  headerTitle: 'Editar tarea',
  primary: 'Guardar y entrar en foco',
  // REQUIERE MIGRACIÓN: estado "borrador" — Task.status solo tiene active|completed.
  secondary: 'Guardar como borrador',
};

/* ------------------------------------------------------------------ */
/* Tarea completada                                                    */
/* ------------------------------------------------------------------ */

export interface FlujoACompletadaFixtures {
  headerTitle: string;
  headline: string;
  subtitle: string;
  recapLabel: string;
  taskTitle: string;
  stepsCompleted: number;
  totalMinutes: number;
  microCopy: string;
  /** CTA unico de salida: vuelve al listado. */
  primary: string;
}

/**
 * Aviso calmo de "tarea completada" (Variante A "Enfoque"). Sin festejo
 * ruidoso: la idea es cerrar con tranquilidad, no con una celebracion.
 * `Task.status = 'completed'` es un estado real del modelo.
 */
export const flujoACompletadaFixtures: FlujoACompletadaFixtures = {
  headerTitle: 'Tarea completada',
  headline: 'Tarea completada',
  subtitle: 'Sin prisa. Un paso a la vez.',
  recapLabel: 'Resumen',
  taskTitle: 'Rediseño de Propuesta Comercial Q3',
  stepsCompleted: 4,
  totalMinutes: 11,
  microCopy: 'Lo de hoy ya suma. Mañana seguimos.',
  primary: 'Volver a mis tareas',
};
