/**
 * Fixtures para la preview "Focus â€” Paso previo" (Design Lab #296).
 *
 * Estructura: `previoFixtures` = estado antes de iniciar; `corriendoFixtures` = datos que
 * alimentan el `FocusRunningView` compartido con `CronometroLimpioScreen`.
 *
 * âš ï¸ Campos marcados con `// âš ï¸ DESIGN` NO existen en el modelo real:
 * requieren migraciÃ³n / tabla nueva / columna nueva. Se incluyen aquÃ­
 * solo para evaluar la visual; el PR documenta quÃ© hace falta.
 */

import type { CountdownState } from '../../utils/countdown';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Estado CORRIENDO (reutilizable por CronometroLimpioScreen)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const corriendoFixtures = {
  timer: {
    /** Segundos iniciales restantes. El mockup arranca en 04:12 (252s). */
    initialSeconds: 252,
    /** Segundos totales del objetivo. El mockup usa 05:00 (300s). */
    maxSeconds: 300,
  },
  step: {
    eyebrow: 'Paso actual',
    title: 'Definir los 3 endpoints de autenticaciÃ³n en schema.prisma',
    subtitle: 'Solo este paso. Nada mÃ¡s.',
  },
  actions: {
    pause: 'Pausar',
    resume: 'Reanudar',
    addTwoMinutes: '+2 Minutos',
    markDone: 'MARCAR PASO HECHO',
    completed: 'COMPLETADO',
  },
  toast: {
    title: 'Â¡Paso 2 completado!',
    subtitle: 'Preparando el siguiente paso...',
  },
  /** Copy del overlay que aparece cuando el cronometro llega a 0:00. */
  expired: {
    headline: 'Tiempo cumplido',
    subtitle: 'Ya hiciste lo mÃ¡s difÃ­cil: empezar. PodÃ©s marcar el paso o sumar dos minutos mÃ¡s',
    primaryCta: 'MARCAR PASO HECHO',
    secondaryCta: '+2 Minutos',
  },
} as const;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Estado PREVIO (pantalla de preparaciÃ³n)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const previoFixtures = {
// ⚠️ DESIGN: no existe switch de tarea en el modelo real; se simula para evaluar la interacción
  taskSwitcher: {
    heading: 'Cambiar de tarea',
    remainingToday: 3,
    tasks: [
      { id: 't-auth', name: 'Backend Auth (Prisma)', stepIndex: 1, totalSteps: 3, minutes: 5, stepTitle: 'Definir los 3 endpoints de autenticación en schema.prisma', description: 'Escribe únicamente los modelos User, Session y VerificationToken para desbloquear la sesión backend.' },
      { id: 't-store', name: 'Refactorizar Store de Zustand', stepIndex: 1, totalSteps: 2, minutes: 15, stepTitle: 'Refactorizar el store de Zustand', description: 'Extraer los slices de autenticación y tareas a stores desacoplados.' },
      { id: 't-figma', name: 'Diseñar estados vacíos en Figma', stepIndex: 2, totalSteps: 2, minutes: 10, stepTitle: 'Diseñar estados vacíos en Figma', description: 'Crear los estados vacíos de la lista de tareas y del historial.' },
    ],
  },

  /** Copy motivacional del header (una sola lÃ­nea). */
  motivation: {
    headline: 'Un paso. Solo uno. Ahora.',
  },

  /** Paso principal que se va a iniciar. */
  heroStep: {
    /** Ãndice 1-based del paso actual dentro de la tarea */
    currentIndex: 1,
    /** Total de pasos de la tarea (para "Paso 1 de 3") */
    totalSteps: 3,
    /** DuraciÃ³n ya definida en minutos (no se elige en esta pantalla) */
    suggestedMinutes: 5,
    /** TÃ­tulo del paso (Step.name) */
    title: 'Definir los 3 endpoints de autenticaciÃ³n en schema.prisma',
    /** DescripciÃ³n / guÃ­a del paso (Task.description â€” NO Step.description) */
    description: 'Escribe Ãºnicamente los modelos User, Session y VerificationToken para desbloquear la sesiÃ³n backend.',
  },

  // âš ï¸ DESIGN: al guardar un micro-paso debe redirigir a la secciÃ³n Tareas (no quedarse en Focus).
  /** Config del formulario inline "AÃ±adir micro-paso" (desglose sin fricciÃ³n). */
  microStep: {
    suggestedMinutes: 3,
    maxMinutes: 5,
    heading: 'Partilo mÃ¡s chico',
    placeholder: 'Â¿CuÃ¡l es el primer movimiento?',
  },

  /** Cola de espera: otros pasos pendientes de esta u otras tareas. */
  queueSubtitle: 'Lo que sigue',
  queue: [
    {
      id: 'q1',
      title: 'Probar conexiÃ³n local a base de datos con Docker',
      minutes: 3,
      // âš ï¸ DESIGN: reordenar entre tareas requiere lÃ³gica cross-task; StepService.reorder es solo intra-tarea
    },
    {
      id: 'q2',
      title: 'Revisar variables de entorno en .env.example',
      minutes: 2,
    },
  ],

  /** Strip zen de cierre (una lÃ­nea, sin card). */
  zenCard: {
    icon: 'meditation',
    title: 'Una tarea menos.',
    text: 'Lo demás se hace más liviano.',
  },
} as const;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Estado COMPLETADO (pantalla "Paso completado v2")
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const completadoFixtures = {
  headerTitle: 'Sesión terminada',
  headline: 'Â¡Paso completado!',
  /** Duracion por defecto; la pantalla puede sobreescribirla con la elegida. */
  durationLabel: '5 minutos',
  /** `{duration}` se reemplaza por durationLabel. */
  subtitleTemplate: '¡Felicitaciones! {duration} de trabajo. Seguimos.',
  recapLabel: 'Logro registrado',
  completedStepTitle: 'Definir los 3 endpoints de autenticaciÃ³n en schema.prisma',
  nextStep: {
    label: 'A continuaciÃ³n',
    title: 'Probar conexiÃ³n local a la base de datos',
    description: 'LevantÃ¡ el contenedor de Postgres y verificÃ¡ el handshake antes de seguir.',
    minutes: 3,
  },
  breakCta: 'Descansar 2 min',
  primaryCta: 'CONTINUAR CON EL SIGUIENTE PASO',
  secondaryCta: 'Guardar progreso y descansar por hoy',
  microCopy: 'Cada paso hecho cuenta.',
} as const;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers para derivar valores del running view
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    caption: 'Un respiro',
  },
  quickPrompt: {
    heading: 'Paso exprés (3 min)',
    placeholder: 'Ej. Abrir documento y escribir solo el título...',
    cta: 'Comenzar 3 min',
    loading: 'Preparando...',
  },
  whisper: {
    sub: 'Sin prisa. Un paso por vez.',
  },
} as const;



