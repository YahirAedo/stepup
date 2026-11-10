import { describe, it, expect } from 'vitest';
import { statusLabelFor, buildConflictItems } from './buildConflictItems';

describe('statusLabelFor', () => {
  it('Tarea: active → Activa', () => {
    expect(statusLabelFor('Tarea', 'active')).toBe('Activa');
  });

  it('Tarea: completed → Completada', () => {
    expect(statusLabelFor('Tarea', 'completed')).toBe('Completada');
  });

  it('Tarea: pending → Pendiente', () => {
    expect(statusLabelFor('Tarea', 'pending')).toBe('Pendiente');
  });

  it('Paso: pending → Pendiente', () => {
    expect(statusLabelFor('Paso', 'pending')).toBe('Pendiente');
  });

  it('Paso: completed → Completado', () => {
    expect(statusLabelFor('Paso', 'completed')).toBe('Completado');
  });

  it('status desconocido devuelve el texto tal cual', () => {
    expect(statusLabelFor('Tarea', 'foo')).toBe('foo');
    expect(statusLabelFor('Paso', 'bar')).toBe('bar');
  });
});

describe('buildConflictItems', () => {
  it('arma items con kind, local y server', () => {
    const conflicts = [
      {
        id: 1,
        tableName: 'tasks' as const,
        localId: 1,
        serverId: 's1',
        local: { name: 'Local', status: 'active', updatedAt: '2026-10-15T09:12:00.000Z' },
        server: { name: 'Server', status: 'completed', updatedAt: '2026-10-15T09:05:00.000Z', id: 's1', localId: 1 } as never,
        createdAt: '2026-10-15T09:00:00.000Z',
      },
    ];
    const items = buildConflictItems(conflicts as never);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe('Tarea');
    expect(items[0].local.name).toBe('Local');
    expect(items[0].local.statusLabel).toBe('Activa');
    expect(items[0].server.name).toBe('Server');
    expect(items[0].server.statusLabel).toBe('Completada');
  });
});
