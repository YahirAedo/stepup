export interface ConflictoVersion {
  name: string;
  statusLabel: string;
  modifiedLabel: string;
}

export interface ConflictoItem {
  id: number;
  kind: 'Tarea' | 'Paso';
  local: ConflictoVersion;
  server: ConflictoVersion;
}

export const conflictosCopy = {
  headerTitle: 'Conflictos',
  intro: 'Se editó lo mismo en este teléfono y en la nube. Elegí con qué versión quedarte.',
  kindSuffix: 'editada en los dos lados',
  localLabel: 'Este dispositivo',
  serverLabel: 'La nube',
  localAction: 'Conservar esta',
  serverAction: 'Conservar la nube',
  emptyTitle: 'Todo en orden',
  emptyBody: 'No quedan conflictos. Tus datos están sincronizados.',
  backCta: 'Volver al perfil',
  confirmTitle: 'Confirmar elección',
  confirmLocalMessage: (name: string) => `¿Conservar la versión de este dispositivo de "${name}"?`,
  confirmServerMessage: (name: string) => `¿Conservar la versión de la nube de "${name}"?`,
  confirmMessage: (side: 'local' | 'server', name: string) =>
    side === 'local'
      ? `¿Conservar la versión de este dispositivo de "${name}"?`
      : `¿Conservar la versión de la nube de "${name}"?`,
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
} as const;

export function conflictosRemainingLabel(remaining: number): string {
  return remaining === 1 ? 'Queda 1 conflicto por resolver.' : `Quedan ${remaining} conflictos por resolver.`;
}

export type ConflictoFiltro = 'todos';
