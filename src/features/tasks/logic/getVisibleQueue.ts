import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import { buildTasksListModel } from './buildTasksListModel';

export function getVisibleQueue(
  model: ReturnType<typeof buildTasksListModel>,
  activeFilter: TaskCategory,
): { focusItem: typeof model.items[number] | null; queue: typeof model.items[number][]; isEmpty: boolean } {
  const { items, focusIndex } = model;
  const focusItem = focusIndex !== null ? items[focusIndex] ?? null : null;
  const queue = items.filter(
    (item, index) => index !== focusIndex && item.category === activeFilter,
  );
  const isEmpty = queue.length === 0 && focusItem?.category !== activeFilter;
  return { focusItem, queue, isEmpty };
}
