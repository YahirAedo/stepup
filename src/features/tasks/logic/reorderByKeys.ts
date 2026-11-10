/**
 * Reordena pasos segun keys ordenadas; ignora keys inexistentes.
 * Los restantes quedan al final, en orden original.
 */
export function reorderByKeys<T extends { key: string }>(steps: T[], orderedKeys: string[]): T[] {
  const byKey = new Map(steps.map((st) => [st.key, st]));
  const ordered = orderedKeys
    .map((key) => byKey.get(key))
    .filter((st): st is T => st !== undefined);
  const remaining = steps.filter((st) => !orderedKeys.includes(st.key));
  return [...ordered, ...remaining];
}
