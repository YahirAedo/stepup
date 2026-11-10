/**
 * Función pura: arma pasos nuevos del borrador con keys consecutivas únicas.
 */
export function buildNewDraftSteps(
  startSeq: number,
  steps: ReadonlyArray<{ name: string; duration: number }>,
): { steps: Array<{ key: string; id: null; name: string; duration_min: number; status: 'pending' }>; nextSeq: number } {
  const result = steps.map((step, i) => ({
    key: `manual-${startSeq + 1 + i}`,
    id: null as null,
    name: step.name.trim(),
    duration_min: step.duration,
    status: 'pending' as const,
  }));
  return { steps: result, nextSeq: startSeq + steps.length };
}
