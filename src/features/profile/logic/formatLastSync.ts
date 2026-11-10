/**
 * Formatea la fecha de última sincronización en un texto corto en español.
 */
export function formatLastSync(iso: string | null, now: Date): string {
  if (iso === null) return 'Nunca';

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Nunca';

  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) return 'Recién ahora';

  if (diffMs < 60_000) return 'Recién ahora';

  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.floor(diffMs / 60_000);
    return `Hace ${minutes} min`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `Hace ${hours} h`;
  }

  if (diffMs < 48 * 60 * 60 * 1000) return 'Ayer';

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return `Hace ${days} días`;
}
