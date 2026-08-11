import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('../database/db', () => ({ getDb: mocks.getDb }));

import { ProgressService } from './ProgressService';

let db: MigrationDb;

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
});

describe('ProgressService', () => {
  it('getToday devuelve 0 sin progreso', async () => {
    await expect(ProgressService.getToday()).resolves.toBe(0);
  });

  it('getToday lee daily_progress del día actual', async () => {
    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed) VALUES (?, 5)`,
      [dateOffset(0)],
    );

    await expect(ProgressService.getToday()).resolves.toBe(5);
  });

  it('getWeek devuelve 7 días con los conteos locales', async () => {
    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed) VALUES (?, 3)`,
      [dateOffset(2)],
    );
    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed) VALUES (?, 7)`,
      [dateOffset(0)],
    );

    const week = await ProgressService.getWeek();
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ date: dateOffset(0), count: 7 });
    expect(week[4]).toEqual({ date: dateOffset(2), count: 3 });
    expect(week[0]).toEqual({ date: dateOffset(6), count: 0 });
  });

  it('increment es no-op', async () => {
    await expect(ProgressService.increment()).resolves.toBeUndefined();
    const rows = await db.getAllAsync<{ id: number }>(`SELECT id FROM daily_progress`, []);
    expect(rows).toEqual([]);
  });
});
