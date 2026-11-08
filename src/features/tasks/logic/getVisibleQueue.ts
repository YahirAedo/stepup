import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import { buildTasksListModel } from './buildTasksListModel';

export function getVisibleQueue(
  model: ReturnType<typeof buildTasksListModel>,
  activeFilter: TaskCategory,
): { focusItem: typeof model.items[number] | null; queue: typeof model.items[number][]; isEmpty: boolean } {
  const { items, focusIndex } = model;
  const candidate = focusIndex !== null ? items[focusIndex] ?? null : null;
  const focusItem =
    activeFilter === 'inProgress' && candidate !== null && candidate.category === 'inProgress'
      ? candidate
      : null;
  const queue = items.filter((item) => item !== focusItem && item.category === activeFilter);
  const isEmpty = queue.length === 0 && focusItem === null;
  return { focusItem, queue, isEmpty };
}