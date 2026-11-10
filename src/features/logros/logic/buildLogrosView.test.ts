import { describe, it, expect } from 'vitest';
import { buildLogrosView } from './buildLogrosView';

describe('buildLogrosView', () => {
  it('total siempre es 8', () => {
    expect(buildLogrosView({ unlockedIds: [], filter: 'todos' }).total).toBe(8);
  });

  it('marca obtenidos según unlockedIds', () => {
    const view = buildLogrosView({ unlockedIds: ['primer-paso'], filter: 'todos' });
    expect(view.obtenidos).toBe(1);
    expect(view.items.find((i) => i.id === 'primer-paso')?.estado).toBe('obtenido');
  });

  it('filtra obtenidos', () => {
    const view = buildLogrosView({ unlockedIds: ['primer-paso'], filter: 'obtenidos' });
    expect(view.items.every((i) => i.estado === 'obtenido')).toBe(true);
  });

  it('filtra por-lograr', () => {
    const view = buildLogrosView({ unlockedIds: ['primer-paso'], filter: 'por-lograr' });
    expect(view.items.every((i) => i.estado === 'por-lograr')).toBe(true);
  });

  it('isEmpty true cuando el filtro no tiene items', () => {
    const view = buildLogrosView({ unlockedIds: [], filter: 'obtenidos' });
    expect(view.isEmpty).toBe(true);
  });
});
