/**
 * Fixtures del flujo Variante B "Ritmo" (Design Lab, epico Tareas).
 *
 * Variante B: densidad + velocidad + gestos, menos decoración. Filas compactas
 * con swipe, creación rápida fija abajo y checklist con checkbox táctil.
 * Cubre las 4 pantallas del flujo (Listado, Crear, Detalle, Editar) sobre el
 * mismo caso de negocio que `tareasFixtures.ts` ("Rediseño de Propuesta
 * Comercial Q3").
 *
 * ⚠️ Campos marcados con `// REQUIERE MIGRACIÓN` NO existen en el modelo real
 * (`Task { title, description?, due_date?, status: active|completed }` /
 * `Step { title, duration_min, order_index, status: pending|completed }`):
 * requieren migracion de modelo o estado de sesion de foco. Se incluyen solo
 * para evaluar la visual; el PR documenta que hace falta.
 */

/* ------------------------------------------------------------------ */
/* Listado                                                             */
/* ------------------------------------------------------------------ */

export type FlujoBEstadoTarea = 'foco' | 'cola' | 'pausada' | 'completada';

export interface FlujoBFilaTarea {
  id: string;
  title: string;
  stepCount: number;
  totalMinutes: number;
  /** Avance 0..1 para la barra corta de la fila. */
  progress: number;
  status: FlujoBEstadoTarea;
}

export interface FlujoBSeccionListado {
  key: FlujoBEstadoTarea;
  title: string;
  items: FlujoBFilaTarea[];
}

export interface FlujoBListadoFixtures {
  headerTitle: string;
  sections: FlujoBSeccionListado[];
  quickCreate: {
    placeholder: string;
    ctaLabel: string;
  };
}

/* ------------------------------------------------------------------ */
/* Formulario (Crear / Editar)                                         */
/* ------------------------------------------------------------------ */

export interface FlujoBFormStep {
  id: string;
  title: string;
  minutes: number;
}

export interface FlujoBFormFixtures {
  titleLabel: string;
  titlePlaceholder: string;
  titleMaxLength: number;
  stepsTitle: string;
  /** Único mensaje de acompañamiento del formulario (lista vacía). */
  emptyStepsHint: string;
  durationLabel: string;
  durationOptions: number[];
  defaultDuration: number;
  addManualLabel: string;
  addInline: {
    heading: string;
    placeholder: string;
    maxMinutes: number;
  };
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
  suggestedSteps: FlujoBFormStep[];
}

/* ------------------------------------------------------------------ */
/* Detalle                                                             */
/* ------------------------------------------------------------------ */

export interface FlujoBPasoChecklist {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
}

export interface FlujoBDetalleFixtures {
  headerTitle: string;
  taskTitle: string;
  /**
   * Paso en curso fijado arriba del scroll. Se deriva del primer paso
   * `pending` de la secuencia (no hace falta campo nuevo en el modelo).
   */
  current: {
    badge: string;
    title: string;
    minutes: number;
    positionLabel: string;
  };
  checklistTitle: string;
  editStepLabel: string;
  addStep: string;
  addStepInline: {
    heading: string;
    placeholder: string;
    suggestedMinutes: number;
    maxMinutes: number;
  };
  checklist: FlujoBPasoChecklist[];
  actions: {
    primary: string;
    secondary: string;
  };
}

/* ------------------------------------------------------------------ */
/* Data de las pantallas                                               */
/* ------------------------------------------------------------------ */

export const flujoBListadoFixtures: FlujoBListadoFixtures = {
  headerTitle: 'Tareas',
  sections: [
    {
      key: 'foco',
      title: 'En foco',
      items: [
        {
          id: 'bf1',
          title: 'Rediseño de Propuesta Comercial Q3',
          stepCount: 4,
          totalMinutes: 11,
          progress: 0.5,
          status: 'foco',
        },
      ],
    },
    {
      key: 'cola',
      title: 'Cola',
      items: [
        {
          id: 'bq1',
          title: 'Revisión y respuesta a email de cliente',
          stepCount: 3,
          totalMinutes: 8,
          progress: 0,
          status: 'cola',
        },
        {
          id: 'bq2',
          title: 'Actualizar dependencias del proyecto',
          stepCount: 2,
          totalMinutes: 6,
          progress: 0,
          status: 'cola',
        },
      ],
    },
    {
      // REQUIERE MIGRACIÓN: status 'pausada' — Task.status solo tiene active|completed.
      key: 'pausada',
      title: 'Pausadas',
      items: [
        {
          id: 'bp1',
          title: 'Armado del presupuesto del mes',
          stepCount: 3,
          totalMinutes: 7,
          progress: 0.33,
          status: 'pausada',
        },
        {
          id: 'bp2',
          title: 'Comprar entradas para el recital',
          stepCount: 2,
          totalMinutes: 5,
          progress: 0,
          status: 'pausada',
        },
      ],
    },
    {
      key: 'completada',
      title: 'Completadas',
      items: [
        {
          id: 'bc1',
          title: 'Migrar la base de datos a Neon',
          stepCount: 3,
          totalMinutes: 15,
          progress: 1,
          status: 'completada',
        },
        {
          id: 'bc2',
          title: 'Enviar el resumen semanal al equipo',
          stepCount: 2,
          totalMinutes: 6,
          progress: 1,
          status: 'completada',
        },
      ],
    },
  ],
  quickCreate: {
    placeholder: 'Escribe una acción de 3-5 min',
    ctaLabel: 'Crear',
  },
};

export const flujoBFormFixtures: FlujoBFormFixtures = {
  titleLabel: 'Título',
  titlePlaceholder: 'Ej: Armar el presupuesto del mes',
  titleMaxLength: 80,
  stepsTitle: 'Pasos',
  emptyStepsHint: 'Todavía no cargaste pasos. Agregá el primero.',
  durationLabel: 'Duración del próximo paso',
  durationOptions: [1, 3, 5],
  defaultDuration: 3,
  addManualLabel: 'Añadir paso manual',
  addInline: {
    heading: 'Nuevo paso',
    placeholder: 'Ej: enviar el enlace a Sofía para revisar',
    maxMinutes: 10,
  },
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
    { id: 'ai-1', title: 'Abrir el documento y listar puntos abiertos', minutes: 3 },
    { id: 'ai-2', title: 'Escribir el resumen en una sola oración', minutes: 2 },
    { id: 'ai-3', title: 'Enviar el link al equipo', minutes: 1 },
  ],
};

export const flujoBFormCreateDefaults = {
  title: '',
  steps: [] as FlujoBFormStep[],
};

export const flujoBFormEditDefaults = {
  title: 'Rediseño de Propuesta Comercial Q3',
  steps: [
    { id: 'e1', title: 'Abrir borrador y listar puntos de dolor', minutes: 2 },
    { id: 'e2', title: 'Escribir las 3 viñetas de solución técnica', minutes: 4 },
    { id: 'e3', title: 'Estimar calendario de entregas', minutes: 3 },
    { id: 'e4', title: 'Lectura final rápida y exportar PDF', minutes: 2 },
  ] as FlujoBFormStep[],
};

export const flujoBDetalleFixtures: FlujoBDetalleFixtures = {
  headerTitle: 'Detalle de tarea',
  taskTitle: 'Rediseño de Propuesta Comercial Q3',
  current: {
    badge: 'Paso actual',
    title: 'Estimar calendario de entregas',
    minutes: 3,
    positionLabel: 'Paso 3 de 4',
  },
  checklistTitle: 'Checklist',
  editStepLabel: 'Editar',
  addStep: 'Añadir paso',
  addStepInline: {
    heading: 'Nuevo paso',
    placeholder: 'Ej: mandar el borrador a Sofía para revisar',
    suggestedMinutes: 3,
    maxMinutes: 10,
  },
  checklist: [
    { id: 'c1', title: 'Abrir borrador y listar puntos de dolor', minutes: 2, done: true },
    { id: 'c2', title: 'Escribir las 3 viñetas de solución técnica', minutes: 4, done: true },
    { id: 'c3', title: 'Estimar calendario de entregas', minutes: 3, done: false },
    { id: 'c4', title: 'Lectura final rápida y exportar PDF', minutes: 2, done: false },
  ],
  actions: {
    primary: 'Continuar en foco',
    secondary: 'Editar tarea',
  },
};

export const flujoBCrearFixtures = {
  headerTitle: 'Nueva tarea',
  primary: 'Activar y empezar',
  secondary: 'Guardar en cola',
};

export const flujoBEditarFixtures = {
  headerTitle: 'Editar tarea',
  primary: 'Guardar y entrar en foco',
  // REQUIERE MIGRACIÓN: estado "borrador" — Task.status solo tiene active|completed.
  secondary: 'Guardar como borrador',
};
