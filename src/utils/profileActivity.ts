/**
 * Logica pura de la parte "Perfil" de las previews del Design Lab.
 *
 * Mismo patron que `src/utils/microplan.ts`: funciones puras testeadas, sin
 * dependencias de RN.
 *
 * Regla de producto: los "dias activos" NUNCA se reinician ni se castigan.
 * Solo se cuentan los dias en los que la persona completo al menos un paso.
 * Un dia sin actividad no resta: simplemente no suma.
 */

/** Toma los primeros 10 chars "YYYY-MM-DD" de un string de fecha, o `null`. */
function toDayKey(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Descarta fechas imposibles (mes 13, dia 32, etc.).
  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

/** "YYYY-MM-DD" en hora local de un `Date`. */
function dayKeyOfDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cantidad de dias distintos con al menos un paso completado dentro de la
 * ventana `[today - (windowDays - 1), today]`, ambos inclusive.
 *
 * - Un dia con varios pasos completados cuenta una sola vez.
 * - Fechas fuera de la ventana se ignoran (no restan).
 * - Fechas invalidas o futuras se ignoran.
 * - `windowDays <= 0` devuelve 0.
 */
export function countActiveDays(
  completedDates: readonly string[],
  windowDays: number,
  today: Date,
): number {
  if (windowDays <= 0) return 0;

  const todayKey = dayKeyOfDate(today);
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (windowDays - 1),
  );
  const startKey = dayKeyOfDate(start);

  const seen = new Set<string>();
  for (const raw of completedDates) {
    const key = toDayKey(raw);
    if (!key) continue;
    if (key >= startKey && key <= todayKey) seen.add(key);
  }

  return seen.size;
}

/** "4 de 7" — dias activos sobre el total de la ventana. */
export function activeDaysRatioLabel(activeDays: number, windowDays: number): string {
  return `${activeDays} de ${windowDays}`;
}
