/**
 * Copy para la pantalla Detalle de tareas.
 */

export const taskDetailCopy = {
  footer: {
    continue: 'Continuar',
    completeAll: 'Marcar tarea como completa',
    reopen: 'Reabrir tarea',
  },
  completeDialog: {
    title: 'Marcar tarea como completa',
    confirm: 'Marcar como completa',
    cancel: ' Cancelar',
  },
  getCompleteDialogBody(pendingCount: number): string {
    if (pendingCount === 1) {
      return 'Se va a marcar el paso pendiente como hecho.';
    }
    return `Se van a marcar los ${pendingCount} pasos pendientes como hechos.`;
  },
  reopenDialog: {
    title: 'Reabrir tarea',
    body: 'Todos los pasos vuelven a "Por hacer".',
    confirm: 'Reabrir',
    cancel: ' Cancelar',
  },
  actionError: 'No se pudo actualizar la tarea. Probá de nuevo.',
  addFirstStep: ' agregar primer paso',
  dismissError: 'Eliminar error',
};