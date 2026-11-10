export interface CompletedMetaInput {
  stepsLabel: string;
  totalMinutes: number;
}

export function formatCompletedMeta({ stepsLabel, totalMinutes }: CompletedMetaInput): string {
  if (totalMinutes === 0) return stepsLabel;
  return `${stepsLabel} · ~${totalMinutes} min`;
}
