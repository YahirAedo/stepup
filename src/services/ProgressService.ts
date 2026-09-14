import { getDb } from '../database/db';
import { getLocalDate, getLocalDateDaysAgo } from '../utils/date';

function today(): string {
  return getLocalDate();
}

function getDate(daysAgo: number): string {
  return getLocalDateDaysAgo(daysAgo);
}

export const ProgressService = {
  async increment(): Promise<void> {
    // El progreso se incrementa en StepService.complete (upsert de daily_progress).
  },

  async getToday(): Promise<number> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ steps_completed: number }>(
      `SELECT steps_completed FROM daily_progress WHERE date = ?`,
      [today()],
    );
    return rows[0]?.steps_completed ?? 0;
  },

  async getWeek(): Promise<{ date: string; count: number }[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ date: string; steps_completed: number }>(
      `SELECT date, steps_completed FROM daily_progress WHERE date >= ? ORDER BY date ASC`,
      [getDate(6)],
    );
    const map = new Map(rows.map((r) => [r.date, r.steps_completed]));
    const days = Array.from({ length: 7 }, (_, i) => getDate(6 - i));
    return days.map((date) => ({ date, count: map.get(date) ?? 0 }));
  },
};
