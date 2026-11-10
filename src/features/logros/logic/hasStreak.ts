function addDays(day: string, delta: number): string {
  const parts = day.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const date = Number(parts[2]);
  const result = new Date(Date.UTC(year, month - 1, date + delta));
  const y = result.getUTCFullYear();
  const m = String(result.getUTCMonth() + 1).padStart(2, '0');
  const d = String(result.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hasStreak(days: readonly string[], length: number): boolean {
  if (length <= 0) return true;

  const set = new Set(days);
  for (const day of set) {
    if (set.has(addDays(day, -1))) continue;

    let count = 0;
    let current = day;
    while (set.has(current)) {
      count += 1;
      if (count >= length) return true;
      current = addDays(current, 1);
    }
  }
  return false;
}
