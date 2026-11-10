import type { SyncConflict } from '../../../database/sync';
import { formatModifiedAt } from '../../../utils/syncConflict';

export type ConflictKind = 'Tarea' | 'Paso';

export interface ConflictVersionView {
  name: string;
  statusLabel: string;
  modifiedLabel: string;
}

export interface ConflictItemView {
  id: number;
  kind: ConflictKind;
  local: ConflictVersionView;
  server: ConflictVersionView;
}

export function statusLabelFor(kind: ConflictKind, status: string): string {
  if (kind === 'Tarea') {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  }
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'completed':
      return 'Completado';
    default:
      return status;
  }
}

export function buildConflictItems(conflicts: readonly SyncConflict[]): ConflictItemView[] {
  return conflicts.map((conflict) => {
    const kind: ConflictKind = conflict.tableName === 'tasks' ? 'Tarea' : 'Paso';
    const localSnapshot = conflict.local;
    const serverSnapshot = conflict.server as { name: string; status: string; updatedAt: string };

    return {
      id: conflict.id,
      kind,
      local: {
        name: localSnapshot.name,
        statusLabel: statusLabelFor(kind, localSnapshot.status),
        modifiedLabel: formatModifiedAt(localSnapshot.updatedAt),
      },
      server: {
        name: serverSnapshot.name,
        statusLabel: statusLabelFor(kind, serverSnapshot.status),
        modifiedLabel: formatModifiedAt(serverSnapshot.updatedAt),
      },
    };
  });
}
