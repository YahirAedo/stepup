/**
 * Función pura: determina si la IA puede sugerir pasos.
 */
export function getAiAvailability({
  isOnline,
  hasSession,
  title,
}: {
  isOnline: boolean;
  hasSession: boolean;
  title: string;
}): 'ok' | 'offline' | 'no-session' | 'needs-title' {
  if (!title.trim()) return 'needs-title';
  if (!hasSession) return 'no-session';
  if (!isOnline) return 'offline';
  return 'ok';
}
