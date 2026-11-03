/**
 * Función pura: arma la descripción para la IA.
 */
export function buildAiDescription(
  notes: string,
  existingNames: ReadonlyArray<string>,
  maxLength = 900,
  proposedNames: ReadonlyArray<string> = [],
): string | undefined {
  const trimmedNotes = notes.trim();
  const trimmedExisting = existingNames.map((n) => n.trim()).filter((n) => n.length > 0);
  const trimmedProposed = proposedNames.map((n) => n.trim()).filter((n) => n.length > 0);

  // Filtrado de propuestos: quitar los que ya están en existentes
  const existingSet = new Set(trimmedExisting.map((n) => n.toLowerCase()));
  const filteredProposed = trimmedProposed.filter((n) => !existingSet.has(n.toLowerCase()));
  const seenProposed = new Set<string>();
  const uniqueProposed: string[] = [];
  for (const n of filteredProposed) {
    const key = n.toLowerCase();
    if (!seenProposed.has(key)) {
      seenProposed.add(key);
      uniqueProposed.push(n);
    }
  }

  const buildCandidate = (p: string[], e: string[]): string => {
    let t = trimmedNotes;
    if (e.length > 0) t += (t ? ' ' : '') + `Pasos que la tarea ya tiene (no repetirlos): ${e.join('; ')}.`;
    if (p.length > 0) t += (t ? ' ' : '') + `Pasos ya propuestos antes (no repetirlos): ${p.join('; ')}.`;
    return t.trim();
  };

  // Intentar completo
  let result = buildCandidate(uniqueProposed, trimmedExisting);
  if (trimmedNotes.length > 0) result = buildCandidate(uniqueProposed, trimmedExisting);
  // Si no hay notas ni existentes ni propuestos
  if (trimmedNotes.length === 0 && trimmedExisting.length === 0 && uniqueProposed.length === 0) return undefined;

  if (result.length <= maxLength) return result;

  // Recorte por prioridad: propuestos (más viejos = inicio) primero
  const proposedCopy = uniqueProposed.slice();
  while (proposedCopy.length > 0) {
    proposedCopy.pop();
    const candidate = buildCandidate(proposedCopy, trimmedExisting);
    if (candidate.length <= maxLength) return candidate;
  }

  // Luego existentes (del final)
  const existingCopy = trimmedExisting.slice();
  while (existingCopy.length > 0) {
    existingCopy.pop();
    const candidate = buildCandidate(uniqueProposed, existingCopy);
    if (candidate.length <= maxLength) return candidate;
  }

  // Solo notas
  if (trimmedNotes.length <= maxLength) return trimmedNotes;
  return trimmedNotes.slice(0, maxLength);
}
