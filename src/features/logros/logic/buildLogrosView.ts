import { LOGROS_CATALOG, type LogroFiltroKey } from './logrosCopy';

export interface BuildLogrosViewInput {
  unlockedIds: readonly string[];
  filter: LogroFiltroKey;
}

export type LogrosViewItem = (typeof LOGROS_CATALOG)[number] & {
  estado: 'obtenido' | 'por-lograr';
};

export interface LogrosView {
  items: LogrosViewItem[];
  obtenidos: number;
  total: number;
  isEmpty: boolean;
}

export function buildLogrosView(input: BuildLogrosViewInput): LogrosView {
  const unlocked = new Set(input.unlockedIds);
  const allItems: LogrosViewItem[] = LOGROS_CATALOG.map((item) => ({
    ...item,
    estado: unlocked.has(item.id) ? 'obtenido' : 'por-lograr',
  }));

  let items = allItems;
  if (input.filter === 'obtenidos') items = allItems.filter((item) => item.estado === 'obtenido');
  if (input.filter === 'por-lograr') items = allItems.filter((item) => item.estado === 'por-lograr');

  const obtenidos = allItems.filter((item) => item.estado === 'obtenido').length;

  return {
    items,
    obtenidos,
    total: LOGROS_CATALOG.length,
    isEmpty: items.length === 0,
  };
}
