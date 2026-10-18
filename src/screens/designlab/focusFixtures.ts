/**
 * Fixtures para la preview "Focus — Paso previo" (Design Lab #296).
 *
 * Estructura: `previoFixtures` = estado antes de iniciar; `corriendoFixtures` = datos que
 * alimentan el `FocusRunningView` compartido con `CronometroLimpioScreen`.
 *
 * ⚠️ Campos marcados con `// ⚠️ DESIGN` NO existen en el modelo real:
 * requieren migración / tabla nueva / columna nueva. Se incluyen aquí
 * solo para evaluar la visual; el PR documenta qué hace falta.
 */

import type { CountdownState } from '../../utils/countdown';

// ──────────────────────────────────────────────────────────────
// Estado CORRIENDO (reutilizable por CronometroLimpioScreen)
// ──────────────────────────────────────────────────────────────

export const corriendoFixtures = {
  timer: {
    /** Segundos iniciales restantes. El mockup arranca en 04:12 (252s). */
    initialSeconds: 252,
    /** Segundos totales del objetivo. El mockup usa 05:00 (300s). */
    maxSeconds: 300,
  },
  step: {
    eyebrow: 'Paso actual',
    name: 'Definir los 3 endpoints de autenticación en schema.prisma',
    subtitle: 'Solo este paso. Nada más.',
  },
  actions: {
    pause: 'Pausar',
    resume: 'Reanudar',
    addTwoMinutes: '+2 Minutos',
    markDone: 'MARCAR PASO HECHO',
    completed: 'COMPLETADO',
  },
  toast: {
    title: '¡Paso 2 completado!',
    subtitle: 'Preparando el siguiente paso...',
  },
  /** Copy del overlay que aparece cuando el cronometro llega a 0:00. */
  expired: {
    headline: 'Tiempo cumplido',
    subtitle: 'Ya hiciste lo más difícil: empezar. Podés marcar el paso o sumar dos minutos más',
    primaryCta: 'MARCAR PASO HECHO',
    secondaryCta: '+2 Minutos',
  },
} as const;

// ──────────────────────────────────────────────────────────────
// Estado PREVIO (pantalla de preparación)
// ──────────────────────────────────────────────────────────────

export const previoFixtures = {
// ⚠️ DESIGN: no existe switch de tarea en el modelo real; se simula para evaluar la interacción
  taskSwitcher: {
    heading: 'Cambiar de tarea',
    remainingToday: 3,
    tasks: [
      { id: 't-auth', name: 'Backend Auth (Prisma)', stepIndex: 1, totalSteps: 3, minutes: 5, stepName: 'Definir los 3 endpoints de autenticación en schema.prisma', description: 'Escribe únicamente los modelos User, Session y VerificationToken para desbloquear la sesión backend.' },
      { id: 't-store', name: 'Refactorizar Store de Zustand', stepIndex: 1, totalSteps: 2, minutes: 15, stepName: 'Refactorizar el store de Zustand', description: 'Extraer los slices de autenticación y tareas a stores desacoplados.' },
      { id: 't-figma', name: 'Diseñar estados vacíos en Figma', stepIndex: 2, totalSteps: 2, minutes: 10, stepName: 'Diseñar estados vacíos en Figma', description: 'Crear los estados vacíos de la lista de tareas y del historial.' },
    ],
  },

  /** Copy motivacional del header (una sola línea). */
  motivation: {
    headline: 'Un paso. Solo uno. Ahora.',
  },

  /** Paso principal que se va a iniciar. */
  heroStep: {
    /** Índice 1-based del paso actual dentro de la tarea */
    currentIndex: 1,
    /** Total de pasos de la tarea (para "Paso 1 de 3") */
    totalSteps: 3,
    /** Duración ya definida en minutos (no se elige en esta pantalla) */
    suggestedMinutes: 5,
    /** Título del paso (Step.name) */
    name: 'Definir los 3 endpoints de autenticación en schema.prisma',
    /** Descripción / guía del paso (Task.description — NO Step.description) */
    description: 'Escribe únicamente los modelos User, Session y VerificationToken para desbloquear la sesión backend.',
  },

  // ⚠️ DESIGN: al guardar un micro-paso debe redirigir a la sección Tareas (no quedarse en Focus).
  /** Config del formulario inline "Añadir micro-paso" (desglose sin fricción). */
  microStep: {
    suggestedMinutes: 3,
    maxMinutes: 5,
    heading: 'Partilo más chico',
    placeholder: '¿Cuál es el primer movimiento?',
  },

  /** Cola de espera: otros pasos pendientes de esta u otras tareas. */
  queueSubtitle: 'Lo que sigue',
  queue: [
    {
      id: 'q1',
      name: 'Probar conexión local a base de datos con Docker',
      minutes: 3,
      // ⚠️ DESIGN: reordenar entre tareas requiere lógica cross-task; StepService.reorder es solo intra-tarea
    },
    {
      id: 'q2',
      name: 'Revisar variables de entorno en .env.example',
      minutes: 2,
    },
  ],

  /** Strip zen de cierre (una línea, sin card). */
  zenCard: {
    icon: 'meditation',
    title: 'Una tarea menos.',
    text: 'Lo demás se hace más liviano.',
  },
} as const;

// ──────────────────────────────────────────────────────────────
// Estado COMPLETADO (pantalla "Paso completado v2")
// ──────────────────────────────────────────────────────────────

export const completadoFixtures = {
  headerTitle: 'Sesión terminada',
  headline: '¡Paso completado!',
  /** Duracion por defecto; la pantalla puede sobreescribirla con la elegida. */
  durationLabel: '5 minutos',
  /** `{duration}` se reemplaza por durationLabel. */
  subtitleTemplate: '¡Felicitaciones! {duration} de trabajo. Seguimos.',
  recapLabel: 'Logro registrado',
  completedStepName: 'Definir los 3 endpoints de autenticación en schema.prisma',
  nextStep: {
    label: 'A continuación',
    name: 'Probar conexión local a la base de datos',
    description: 'Levantá el contenedor de Postgres y verificá el handshake antes de seguir.',
    minutes: 3,
  },
  breakCta: 'Descansar 2 min',
  primaryCta: 'CONTINUAR CON EL SIGUIENTE PASO',
  secondaryCta: 'Guardar progreso y descansar por hoy',
  microCopy: 'Cada paso hecho cuenta.',
} as const;

// ──────────────────────────────────────────────────────────────
// Helpers para derivar valores del running view
// ──────────────────────────────────────────────────────────────

/** Convierte los minutos seleccionados en CountdownState inicial para el hook */
export function makeCountdownState(minutes: number): CountdownState {
  return {
    remaining: minutes * 60,
    total: minutes * 60,
  };
}

// ────────────────────────────────────────────────────────────
// Estado SIN TAREAS (estado vacío del flujo Focus)
// ────────────────────────────────────────────────────────────

export const sinTareasFixtures = {
  headerTitle: 'Focus — Sin tareas',
  status: {
    chip: 'Sin tareas activas',
    breatheIdle: 'Inspirar',
    breatheActive: 'Exhalar...',
  },
  sanctuary: {
    headline: 'Todo al día',
    body: 'Cuando quieras, elegí el siguiente paso.',
    primaryCta: 'Crear tarea',
    secondaryCta: 'Ver historial',
  },
  cadence: {
    label: 'Ritmo de hoy',
    level: 'Excelente Ritmo',
    headline: '4 pasos completados',
    detail: '(18 min enfocados)',
    note: 'Buen avance',
    progress: 1,
  },
  atmospheric: {
    caption: 'Buen trabajo. Seguí así.',
  },
  quickPrompt: {
    heading: 'Paso exprés (3 min)',
    placeholder: 'Ej. Abrir documento y escribir solo el título...',
    cta: 'Comenzar 3 min',
    loading: 'Preparando...',
  },
  whisper: {
    sub: 'Cuando quieras, creá una tarea.',
  },
} as const;



