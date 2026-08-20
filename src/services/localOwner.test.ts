import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getLocalOwner, setLocalOwner } from '../database/sync';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getDb: mocks.getDb,
}));

import { clearLocalData, ensureLocalOwner } from './localOwner';

let db: MigrationDb;

beforeEach(async () => {
  const created = await makeSqlJsDb();
  db = created.db;
  await runMigrations(db);
  mocks.getDb.mockResolvedValue(db);
});

async function insertTask(name = 'Tarea'): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
       VALUES (?, NULL, 'active', ?, NULL, NULL, 0, ?)`,
    [name, '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z'],
  );
  return res.lastInsertRowId;
}

async function countTasks(): Promise<number> {
  const rows = await db.getAllAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM tasks`, []);
  return rows[0].n;
}

describe('ensureLocalOwner', () => {
  it('adopta la DB sin borrar los datos legacy cuando no hay owner', async () => {
    await insertTask('Legacy');

    await expect(ensureLocalOwner('u-nuevo')).resolves.toEqual({ changed: false });

    await expect(countTasks()).resolves.toBe(1);
    await expect(getLocalOwner(db)).resolves.toBe('u-nuevo');
  });

  it('borra los datos locales cuando el owner es otro usuario', async () => {
    await setLocalOwner(db, 'u-anterior');
    await insertTask('Del anterior');

    await expect(ensureLocalOwner('u-nuevo')).resolves.toEqual({ changed: true });

    await expect(countTasks()).resolves.toBe(0);
    await expect(getLocalOwner(db)).resolves.toBe('u-nuevo');
  });

  it('no borra nada cuando el owner es el mismo usuario', async () => {
    await setLocalOwner(db, 'u-mismo');
    await insertTask('Propia');

    await expect(ensureLocalOwner('u-mismo')).resolves.toEqual({ changed: false });

    await expect(countTasks()).resolves.toBe(1);
  });
});

describe('clearLocalData', () => {
  it('borra tareas, pasos, progreso y owner (logout)', async () => {
    await setLocalOwner(db, 'u-anterior');
    const taskId = await insertTask();
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at)
         VALUES (?, 'Paso', 5, 0, 'pending', NULL, NULL, 0, ?)`,
      [taskId, '2026-08-01T00:00:00.000Z'],
    );
    await db.runAsync(
      `INSERT INTO daily_progress (date, steps_completed) VALUES (?, 3)`,
      ['2026-08-01'],
    );

    await clearLocalData();

    await expect(countTasks()).resolves.toBe(0);
    const steps = await db.getAllAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM steps`, []);
    expect(steps[0].n).toBe(0);
    const progress = await db.getAllAsync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM daily_progress`,
      [],
    );
    expect(progress[0].n).toBe(0);
    await expect(getLocalOwner(db)).resolves.toBeNull();
  });
});
