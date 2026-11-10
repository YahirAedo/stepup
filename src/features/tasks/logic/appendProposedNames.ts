/**
 * Función pura: agrega nombres sugeridos al historial de propuestos, manteniendo
 * los últimos `limit`, sin duplicados (case-insensitive + trim) y sin mutar.
 */
export function appendProposedNames(
  current: ReadonlyArray<string>,
  incoming: ReadonlyArray<string>,
  limit = 24,
): string[] {
  const result = current.map((n) => n.trim());
  const seen = new Set<string>(result.map((n) => n.toLowerCase()));
  for (const raw of incoming) {
    const n = raw.trim();
    if (n.length === 0) continue;
    const key = n.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(n);
    }
  }
  // Mantener solo los últimos `limit`
  if (result.length > limit) {
    return result.slice(result.length - limit);
  }
  return result;
}
