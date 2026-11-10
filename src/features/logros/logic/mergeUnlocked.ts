import { LOGROS_CATALOG } from './logrosCopy';

const VALID_IDS = new Set(LOGROS_CATALOG.map((item) => item.id));

export function mergeUnlocked(persisted: readonly string[], computed: readonly string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const id of LOGROS_CATALOG.map((item) => item.id)) {
    const inPersisted = persisted.includes(id);
    const inComputed = computed.includes(id);
    if ((inPersisted || inComputed) && VALID_IDS.has(id) && !seen.has(id)) {
      result.push(id);
      seen.add(id);
    }
  }

  return result;
}
