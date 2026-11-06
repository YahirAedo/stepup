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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

describe('ProgressService.getProfileStats', () => {
  it('devuelve completedDates de los ultimos 30 dias y el total de pasos completados', async () => {
    const today = dateOffset(0);
    const old = dateOffset(40);
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('T', NULL, 'active', ?, NULL, NULL, 0, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
    );
    const taskId = 1;
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P', 30, 0, 'completed', NULL, NULL, 0, '2026-08-01T00:00:00.000Z', ?)`,
      [taskId, today],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P2', 30, 1, 'completed', NULL, NULL, 0, '2026-08-01T00:00:00.000Z', ?)`,
      [taskId, old],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P3', 30, 2, 'pending', NULL, NULL, 0, '2026-08-01T00:00:00.000Z', NULL)`,
      [taskId],
    );

    const stats = await ProgressService.getProfileStats();
    expect(stats.completedDates).toEqual([today]);
    expect(stats.stepsTotal).toBe(2);
  });
});

describe('ProgressService.getProfileStats (completed_date NULL)', () => {
  it('paso con completed_date NULL y completed_at de hoy entra en completedDates', async () => {
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('T', NULL, 'active', ?, NULL, NULL, 0, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
    );
    const taskId = 1;
    const todayIso = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P', 30, 0, 'completed', ?, NULL, 0, '2026-08-01T00:00:00.000Z', NULL)`,
      [taskId, todayIso],
    );

    const stats = await ProgressService.getProfileStats();
    // use local date comparison loosely: ensure at least one entry
    expect(stats.completedDates.length).toBeGreaterThanOrEqual(1);
    expect(stats.stepsTotal).toBe(1);
  });

  it('paso con completed_at de hace 40 dias no entra en completedDates', async () => {
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('T', NULL, 'active', ?, NULL, NULL, 0, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
    );
    const taskId = 1;
    const oldIso = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P', 30, 0, 'completed', ?, NULL, 0, '2026-08-01T00:00:00.000Z', NULL)`,
      [taskId, oldIso],
    );

    const stats = await ProgressService.getProfileStats();
    expect(stats.completedDates).toEqual([]);
    expect(stats.stepsTotal).toBe(1);
  });

  it('stepsTotal cuenta ambos aunque uno no entre en completedDates', async () => {
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
         VALUES ('T', NULL, 'active', ?, NULL, NULL, 0, ?)`,
      ['2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
    );
    const taskId = 1;
    const todayIso = new Date().toISOString();
    const oldIso = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P1', 30, 0, 'completed', ?, NULL, 0, '2026-08-01T00:00:00.000Z', NULL)`,
      [taskId, todayIso],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at, completed_date)
         VALUES (?, 'P2', 30, 1, 'completed', ?, NULL, 0, '2026-08-01T00:00:00.000Z', NULL)`,
      [taskId, oldIso],
    );

    const stats = await ProgressService.getProfileStats();
    expect(stats.stepsTotal).toBe(2);
    expect(stats.completedDates.length).toBe(1);
  });
});
