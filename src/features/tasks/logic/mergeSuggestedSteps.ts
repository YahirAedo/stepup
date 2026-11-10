/**
 * Función pura: fusiona pasos sugeridos con paso existentes.
 */
export interface SuggestedStep {
  name: string;
  duration_min: number;
}

export function mergeSuggestedSteps(
  existingNames: ReadonlyArray<string>,
  suggested: ReadonlyArray<SuggestedStep>,
): { steps: Array<{ name: string; duration: number }>; skipped: number } {
  const existingSet = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const result: Array<{ name: string; duration: number }> = [];
  let skipped = 0;
  const seen = new Set<string>();

  for (const s of suggested) {
    const trimmedName = s.name.trim();
    if (!trimmedName) {
      skipped += 1;
      continue;
    }
    const duration = Math.round(s.duration_min);
    if (!Number.isFinite(s.duration_min) || s.duration_min < 1) {
      skipped += 1;
      continue;
    }
    const lowerName = trimmedName.toLowerCase();
    if (existingSet.has(lowerName)) {
      skipped += 1;
      continue;
    }
    if (seen.has(lowerName)) {
      skipped += 1;
      continue;
    }
    seen.add(lowerName);
    result.push({ name: trimmedName, duration });
  }

  return { steps: result, skipped };
}
