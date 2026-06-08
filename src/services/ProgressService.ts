import { getDb } from '../database/db';
import { DailyProgress } from '../types';

function today(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
};