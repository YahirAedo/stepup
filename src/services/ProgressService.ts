import { getDb } from '../database/db';
import { DailyProgress } from '../types';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function getDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const ProgressService = {

  async increment(): Promise<void> {
    const db = await getDb();
    const date = today();
    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed)
       VALUES (?, 1)
       ON CONFLICT(date) DO UPDATE SET steps_completed = steps_completed + 1`,
      [date]
    );
  },

  async getToday(): Promise<number> {
    const db = await getDb();
    const row = await db.getFirstAsync<DailyProgress>(
      `SELECT * FROM daily_progress WHERE date = ?`, [today()]
    );
    return row?.steps_completed ?? 0;
  },

  async getWeek(): Promise<{ date: string; count: number }[]> {
    const db = await getDb();
    const days = Array.from({ length: 7 }, (_, i) => getDate(6 - i));
    const rows = await db.getAllAsync<DailyProgress>(
      `SELECT * FROM daily_progress WHERE date IN (${days.map(() => '?').join(',')})`,
      days
    );
    const map = new Map(rows.map(r => [r.date, r.steps_completed]));
    return days.map(date => ({ date, count: map.get(date) ?? 0 }));
  },
};