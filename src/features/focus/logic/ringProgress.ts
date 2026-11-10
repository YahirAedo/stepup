/**
 * Lógica pura del progreso del anillo del timer.
 *
 * Nota: el estado de "pospuestos" y de "tarea manual" es efímero (solo
 * mientras la app está abierta, sin persistencia) y vive fuera de esta
 * función.
 */
export function ringProgress(seconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const progress = (totalSeconds - seconds) / totalSeconds;
  if (progress < 0) return 0;
  if (progress > 1) return 1;
  return progress;
}

export function ringRemaining(seconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  const remaining = seconds / totalSeconds;
  if (remaining < 0) return 0;
  if (remaining > 1) return 1;
  return remaining;
}

export function ringDashOffset(progress: number, radius: number): number {
  const circumference = 2 * Math.PI * radius;
  return circumference * (1 - progress);
}
