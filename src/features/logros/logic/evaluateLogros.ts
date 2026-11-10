import { hasStreak } from './hasStreak';

export interface LogrosStats {
  stepsTotal: number;
  tasksCompleted: number;
  completedDays: string[];
  completedAtList: string[];
}

export function evaluateLogros(stats: LogrosStats, now: Date): string[] {
  const unlocked: string[] = [];

  if (stats.stepsTotal >= 1) unlocked.push('primer-paso');
  if (stats.tasksCompleted >= 1) unlocked.push('primera-tarea');
  if (stats.stepsTotal >= 10) unlocked.push('diez-pasos');
  if (stats.stepsTotal >= 50) unlocked.push('cincuenta-pasos');
  if (stats.stepsTotal >= 100) unlocked.push('cien-pasos');
  if (hasStreak(stats.completedDays, 7)) unlocked.push('semana-activa');

  const year = now.getFullYear();
  const month = now.getMonth();
  const distinctDaysInMonth = new Set(
    stats.completedDays.filter((day) => {
      const parsed = new Date(`${day}T00:00:00`);
      return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === year && parsed.getMonth() === month;
    }),
  ).size;
  if (distinctDaysInMonth >= 20) unlocked.push('mes-constante');

  const earlyStart = stats.completedAtList.some((timestamp) => {
    const parsed = new Date(timestamp);
    return !Number.isNaN(parsed.getTime()) && parsed.getHours() < 8;
  });
  if (earlyStart) unlocked.push('arranque-temprano');

  return unlocked;
}
