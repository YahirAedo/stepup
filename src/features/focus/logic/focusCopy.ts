export const focusCopy = {
  loadError: 'No pudimos cargar tu foco. Intentá de nuevo.',
  completeError: 'No se pudo completar el paso. Intentá de nuevo.',
  loading: 'Cargando tu foco…',
  retry: 'Reintentar',
  empty: {
    'no-tasks': {
      headline: 'Empecemos con tu primera tarea',
      body: 'Anotá algo que tengas pendiente y dividilo en pasos cortos. Acá vas a ver el paso que toca hacer ahora.',
      primaryCta: 'Crear mi primera tarea',
    },
    'needs-steps': {
      one: {
        headline: 'Tu tarea todavía no tiene pasos',
        body: 'Foco te muestra un paso a la vez. Agregale pasos cortos a tu tarea y el primero va a aparecer acá.',
        primaryCta: 'Agregar pasos',
        secondaryCta: 'Ver mis tareas',
      },
      many: {
        headline: 'Tus tareas todavía no tienen pasos',
        body: 'Foco te muestra un paso a la vez. Agregales pasos cortos a tus tareas y el primero va a aparecer acá.',
        primaryCta: 'Ver mis tareas',
        secondaryCta: 'Crear tarea',
      },
    },
    'all-done': {
      headline: 'Todo al día',
      body: 'Cuando quieras, creá una tarea.',
      primaryCta: 'Crear tarea',
      secondaryCta: 'Ver completadas',
    },
  },
  completed: {
    headline: 'Paso completado',
    recapLabel: 'Este paso',
    nextLabel: 'A continuación',
    continueCta: 'Seguir con el siguiente paso',
    goTasksCta: 'Ir a Tareas',
  },
  running: {
    pause: 'Pausar',
    resume: 'Reanudar',
    extend: '+2 min',
    markDone: 'Marcar paso hecho',
    back: 'Volver',
    paused: 'Pausado',
    expired: {
      headline: 'Tiempo cumplido',
      subtitle: 'Podés marcar el paso o sumar dos minutos más.',
      primaryCta: 'Marcar paso hecho',
      secondaryCta: '+2 min',
    },
  },
} as const;