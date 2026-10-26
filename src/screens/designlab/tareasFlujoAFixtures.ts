/**
 * Fixtures del flujo Variante A "Enfoque" (Design Lab, epico Tareas).
 *
 * Variante A: calma, una superficie primaria por pantalla, jerarquia vertical
 * y progreso lineal. Cubre las 4 pantallas del flujo (Listado, Crear, Detalle,
 * Editar) sobre el mismo caso de negocio que `tareasFixtures.ts` ("Rediseño de
 * Propuesta Comercial Q3").
 *
 * ⚠️ Campos marcados con `// REQUIERE MIGRACIÓN` NO existen en el modelo real
 * (`Task { name, description?, due_date?, status: active|completed }` /
 * `Step { name, duration_min, order_index, status: pending|completed }`):
 * requieren migracion de modelo o estado de sesion de foco. Se incluyen solo
 * para evaluar la visual; el PR documenta que hace falta.
 */

import type { MciSymbolKey } from '../../components/designlab/mciIconMap';
import type { StepSequenceVariant } from '../../components/designlab/StepSequenceItem';

/** Categoría derivada de los pasos (coincide con `deriveTaskCategory`). */
export type FlujoACategoryKey = 'inProgress' | 'notStarted' | 'completed';

/** Paso tal como vive en el modelo real (`Step.name`, status y duración). */
export interface FlujoAStep {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  /** ISO. Alimenta `pickFocusTask`: el paso completado más reciente define el foco. */
  completedAt?: string;
  minutes: number;
}

/** Tarea tal como vive en el modelo real (`Task.name` + sus pasos). */
export interface FlujoATask {
  id: string;
  name: string;
  /** Vencimiento (dato neutro), ISO corto `YYYY-MM-DD`. Opcional. */
  dueDate?: string;
  steps: FlujoAStep[];
}

/* ------------------------------------------------------------------ */
/* Listado                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoAListadoFixtures {
  headerTitle: string;
  pageTitle: string;
  /** Prefijo de la línea de resumen (ej. "Hoy:"). */
  summaryLabel: string;
  /** Textos de la tarjeta "En foco" y de los filtros (UI, no datos). */
  copy: {
    focusBadge: string;
    focusMinutesSuffix: string;
    focusCta: string;
    toggleOpen: string;
    toggleClose: string;
    categoryLabels: Record<FlujoACategoryKey, string>;
  };
  quickCreate: {
    title: string;
    subtitle: string;
    badge: string;
  };
  queue: {
    title: string;
    subtitle: string;
    empty: string;
    /** Aviso para tareas sin pasos (reemplaza "0 pasos"). */
    noSteps: string;
  };
  /** Botón "crear tarea" (al pie del listado). */
  footerCta: string;
  /** Frase de cierre al pie del listado (reemplaza la foto decorativa). */
  footerNote: string;
  /** Tareas reales: la categoría y el foco se DERIVAN de los pasos, sin estado guardado. */
  tasks: FlujoATask[];
}

/* ------------------------------------------------------------------ */
/* Detalle                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoAPasoDetalle {
  variant: StepSequenceVariant;
  name: string;
  meta: string;
  durationMin: number;
  description?: string;
  activeBadge?: string;
  /** Botón "Comenzar" del paso en foco (arranca el foco). */
  startCta?: string;
  /** Botón "Hecho" del paso en foco (completa el paso). */
  completeCta?: string;
}

export interface FlujoADetalleFixtures {
  headerTitle: string;
  summary: {
    statusBadge: { prefix: string; of: string };
    title: string;
    description: string;
    /** Vencimiento (dato neutro y opcional), ISO corto `YYYY-MM-DD`. */
    dueDate?: string;
    dueLabel: string;
    dueNone: string;
    dueA11y: string;
    dueClear: string;
  };
  stepsTitle: string;
  editStepLabel: string;
  /** Acción para volver a pendiente un paso completado. */
  undoStepLabel: string;
  /** Acción para mover un paso pendiente al final. */
  postponeLabel: string;
  addStep: string;
  addStepInline: {
    heading: string;
    placeholder: string;
    suggestedMinutes: number;
    maxMinutes: number;
  };
  /** Aviso para tareas sin pasos. */
  noSteps: { text: string; cta: string };
  steps: FlujoAPasoDetalle[];
  management: Array<{ key: string; label: string; icon: MciSymbolKey }>;
  calm: { title: string; body: string };
  /** Confirmación para eliminar la tarea. */
  deleteDialog: { title: string; body: string; confirm: string; cancel: string };
  actions: {
    primaryPrefix: string;
    primarySuffix: string;
  };
  /** Pie de página - texto de cierre */
  footerNote: string;
}

/* ------------------------------------------------------------------ */
/* Formulario (Crear / Editar)                                         */
/* ------------------------------------------------------------------ */

export interface FlujoAFormStep {
  id: string;
  name: string;
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
    /** Ayuda de descripción: usa SOLO el nombre de la tarea (`AIService.describeHelp`). */
    describeCta: string;
    describeHint: string;
    describeLoading: string;
    describeReady: string;
    describeSuggested: string;
  };
  /** Vencimiento (dato neutro y opcional) del formulario. */
  dueLabel: string;
  dueNone: string;
  dueClear: string;
  dueA11y: string;
  /** Pasos sugeridos por IA: `AIService.suggestSteps(taskName, description)` existe; acá se precargan como demo. */
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
    describeCta: 'Sugerir descripción',
    describeHint: 'Usa solo el nombre de la tarea.',
    describeLoading: 'Pensando una descripción…',
    describeReady: 'Listo. Revisá y ajustá la descripción.',
    describeSuggested: 'Dejar lista la propuesta para el cliente corporativo, con foco en el alcance técnico.',
  },
  dueLabel: 'Fecha meta',
  dueNone: 'Sin fecha meta',
  dueClear: 'Quitar fecha meta',
  dueA11y: 'Fecha meta',
  // Pasos sugeridos por IA (`AIService.suggestSteps`); acá precargados como demo.
  suggestedSteps: [
    { id: 'ai-1', name: 'Abrir el borrador actual', minutes: 2 },
    { id: 'ai-2', name: 'Listar los 3 puntos de dolor principales', minutes: 3 },
    { id: 'ai-3', name: 'Redactar una viñeta por punto', minutes: 4 },
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
  dueDate: undefined as string | undefined,
  steps: [] as FlujoAFormStep[],
};

export const flujoAFormEditDefaults = {
  title: 'Rediseño de Propuesta Comercial Q3',
  notes: 'Entrega para el cliente corporativo. Confirmar márgenes con Sofía antes de exportar.',
  dueDate: '2026-10-24' as string | undefined,
  steps: [
    { id: 'e1', name: 'Abrir borrador y listar puntos de dolor', minutes: 2 },
    { id: 'e2', name: 'Escribir las 3 viñetas de solución técnica', minutes: 4 },
    { id: 'e3', name: 'Estimar calendario de entregas', minutes: 3 },
    { id: 'e4', name: 'Lectura final rápida y exportar PDF', minutes: 2 },
  ] as FlujoAFormStep[],
};

/* ------------------------------------------------------------------ */
/* Data de las pantallas                                               */
/* ------------------------------------------------------------------ */

export const flujoAListadoFixtures: FlujoAListadoFixtures = {
  headerTitle: 'Tareas',
  pageTitle: 'Tareas & Pasos',
  summaryLabel: 'Hoy:',
  copy: {
    focusBadge: 'En foco',
    focusMinutesSuffix: 'min',
    focusCta: 'Continuar',
    toggleOpen: 'Ver pasos',
    toggleClose: 'Ocultar pasos',
    categoryLabels: {
      inProgress: 'En curso',
      notStarted: 'Por empezar',
      completed: 'Completadas',
    },
  },
  quickCreate: {
    title: 'Crear nueva tarea',
    subtitle: 'Empezá por una acción de 2 a 5 minutos',
    badge: 'Dividir en pasos',
  },
  queue: {
    title: 'Lista en espera',
    subtitle: '',
    empty: 'Nada por acá todavía.',
    noSteps: 'Esta tarea no tiene pasos. Agregá uno para poder empezar',
  },
  footerCta: 'Crear tarea',
  footerNote: 'Una tarea a la vez. El resto se acomoda.',
  tasks: [
    {
      id: 't-propuesta',
      name: 'Rediseño de Propuesta Comercial Q3',
      dueDate: '2026-10-24',
      steps: [
        { id: 'p1', name: 'Recopilar métricas de abril y mayo', status: 'completed', completedAt: '2026-10-16T10:00:00.000Z', minutes: 3 },
        { id: 'p2', name: 'Escribir las 3 viñetas clave', status: 'pending', minutes: 4 },
        { id: 'p3', name: 'Exportar borrador PDF a Figma', status: 'pending', minutes: 3 },
        { id: 'p4', name: 'Enviar enlace de revisión a Sofía', status: 'pending', minutes: 2 },
      ],
    },
    {
      id: 't-demo',
      name: 'Preparar demo para inversores',
      steps: [
        { id: 'd1', name: 'Armar el guion de 5 minutos', status: 'completed', completedAt: '2026-10-15T09:00:00.000Z', minutes: 4 },
        { id: 'd2', name: 'Revisar la demo con el equipo', status: 'pending', minutes: 3 },
        { id: 'd3', name: 'Grabar la corrida de prueba', status: 'pending', minutes: 3 },
      ],
    },
    {
      id: 't-email',
      name: 'Revisión y respuesta a email de cliente',
      dueDate: '2026-10-20',
      steps: [
        { id: 'e1', name: 'Leer el pedido completo', status: 'pending', minutes: 2 },
        { id: 'e2', name: 'Redactar la respuesta', status: 'pending', minutes: 3 },
        { id: 'e3', name: 'Enviar y anotarlo en la agenda', status: 'pending', minutes: 2 },
      ],
    },
    {
      id: 't-sqlite',
      name: 'Actualizar dependencias de proyecto SQLite',
      steps: [
        { id: 's1', name: 'Revisar versiones desactualizadas', status: 'pending', minutes: 3 },
        { id: 's2', name: 'Actualizar y correr los tests', status: 'pending', minutes: 3 },
      ],
    },
    {
      id: 't-release',
      name: 'Publicar notas de release v1.4',
      steps: [
        { id: 'r1', name: 'Listar los cambios del release', status: 'completed', completedAt: '2026-10-14T12:00:00.000Z', minutes: 2 },
        { id: 'r2', name: 'Publicar en el changelog', status: 'completed', completedAt: '2026-10-14T12:30:00.000Z', minutes: 2 },
      ],
    },
    {
      id: 't-inbox',
      name: 'Ordenar la bandeja de entrada',
      steps: [],
    },
  ],
};

export const flujoADetalleFixtures: FlujoADetalleFixtures = {
  headerTitle: 'Detalle de tarea',
  summary: {
    statusBadge: { prefix: 'Paso', of: 'de' },
    title: 'Rediseño de Propuesta Comercial Q3',
    description:
      'Preparar el documento para el cliente corporativo. Prioridad al alcance técnico antes de afinar márgenes.',
    dueDate: '2026-10-24',
    dueLabel: 'Fecha meta',
    dueNone: 'Sin fecha meta',
    dueClear: 'Quitar fecha meta',
    dueA11y: 'Fecha meta',
  },
  stepsTitle: 'Secuencia de pasos',
  editStepLabel: 'Editar',
  undoStepLabel: 'Desmarcar',
  postponeLabel: 'Posponer',
  addStep: 'Añadir paso',
  addStepInline: {
    heading: 'Añadir paso a la secuencia',
    placeholder: 'Ej: abrir el archivo y revisar el apartado de alcance',
    suggestedMinutes: 3,
    maxMinutes: 10,
  },
  noSteps: {
    text: 'Esta tarea no tiene pasos. Agregá uno para poder empezar',
    cta: 'Agregar paso',
  },
  steps: [
    {
      variant: 'completed',
      name: 'Abrir borrador y listar puntos de dolor',
      meta: 'Completado · 2 min',
      durationMin: 2,
    },
    {
      variant: 'active',
      name: 'Escribir las 3 viñetas de solución técnica',
      meta: 'En foco · 4 min',
      durationMin: 4,
      description: 'Solo concéntrate en la arquitectura y beneficios clave. Sin adjetivos de venta aún.',
      activeBadge: 'Foco actual',
      startCta: 'Comenzar',
      completeCta: 'Hecho',
    },
    {
      variant: 'pending',
      name: 'Estimar calendario de entregas',
      meta: 'En espera · 3 min',
      durationMin: 3,
    },
    {
      variant: 'pending',
      name: 'Lectura final rápida y exportar PDF',
      meta: 'En espera · 2 min',
      durationMin: 2,
    },
  ],
  management: [
    { key: 'editar', label: 'Editar tarea', icon: 'edit' },
    { key: 'reordenar', label: 'Reordenar', icon: 'swap_vert' },
    { key: 'eliminar', label: 'Eliminar', icon: 'delete' },
  ],
  calm: {
    title: 'Un paso alcanza',
    body: 'Con un paso ya avanzaste.',
  },
  deleteDialog: {
    title: 'Eliminar tarea',
    body: 'Se borran la tarea y sus pasos. Esta acción no se puede deshacer.',
    confirm: 'Eliminar',
    cancel: 'Cancelar',
  },
  actions: {
    primaryPrefix: 'Cuando quieras',
    primarySuffix: 'creá una tarea',
  },
  /** Pie de página - texto de cierre */
  footerNote: 'Una tarea a la vez. El resto se acomoda.',
};

export const flujoACrearFixtures = {
  headerTitle: 'Crear tarea',
  primary: 'Guardar y empezar',
  secondary: 'Guardar',
};

export const flujoAEditarFixtures = {
  headerTitle: 'Editar tarea',
  primary: 'Guardar y empezar',
  secondary: 'Guardar',
};

/* ------------------------------------------------------------------ */
/* Tarea completada                                                    */
/* ------------------------------------------------------------------ */

export interface FlujoACompletadaFixtures {
  headerTitle: string;
  headline: string;
  subtitle: string;
  recapLabel: string;
  taskName: string;
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
  subtitle: 'Completaste todos los pasos de esta tarea.',
  recapLabel: 'Resumen',
  taskName: 'Rediseño de Propuesta Comercial Q3',
  stepsCompleted: 4,
  totalMinutes: 11,
  microCopy: 'Lo de hoy ya suma.',
  primary: 'Volver a mis tareas',
};
