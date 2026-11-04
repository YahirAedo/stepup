export const focusCopy = {
  loadError: 'No pudimos cargar tu foco. Intentá de nuevo.',
  completeError: 'No se pudo completar el paso. Intentá de nuevo.',
  loading: 'Cargando tu foco…',
  retry: 'Reintentar',
  empty: {
    headline: 'Todo al día',
    body: 'Cuando quieras, creá una tarea.',
    primaryCta: 'Crear tarea',
    secondaryCta: 'Ver completadas',
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
