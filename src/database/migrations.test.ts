import { describe, expect, it } from 'vitest';
import type { Database } from 'sql.js';
import { runMigrations } from './migrations';
import { makeSqlJsDb } from './testDb';

type Column = { name: string; type: string; notnull: number; dflt_value: string | null };

async function tableColumns(raw: Database, table: string): Promise<Column[]> {
  const res = raw.exec(`PRAGMA table_info(${table})`);
  if (res.length === 0) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const column = {} as Record<string, unknown>;
    cols.forEach((name, i) => (column[name] = row[i]));
    return column as unknown as Column;
  });
}

describe('runMigrations — schema de SQLite local', () => {
  it('crea las tablas base con las columnas de sync y owner (v1 + v2 + v4 + v6)', async () => {
    const { db, raw } = await makeSqlJsDb();
    await runMigrations(db);

    const taskCols = await tableColumns(raw, 'tasks');
    expect(taskCols.map((c) => c.name)).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'description',
        'due_date',
        'status',
        'created_at',
        'completed_at',
        'server_id',
        'dirty',
        'updated_at',
      ]),
    );

    const dirty = taskCols.find((c) => c.name === 'dirty');
    expect(dirty?.notnull).toBe(1);
    expect(dirty?.dflt_value).toBe('0');
    expect(taskCols.find((c) => c.name === 'server_id')?.type).toBe('TEXT');

    const stepCols = await tableColumns(raw, 'steps');
    expect(stepCols.map((c) => c.name)).toEqual(
      expect.arrayContaining(['server_id', 'dirty', 'updated_at']),
    );

    const meta = raw.exec(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_meta'`,
    );
    expect(meta.length).toBe(1);
    const metaCols = await tableColumns(raw, 'sync_meta');
    expect(metaCols.map((c) => c.name)).toEqual(['id', 'last_sync_at', 'owner_user_id']);

    const conflicts = raw.exec(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_conflicts'`,
    );
    expect(conflicts.length).toBe(1);
    const conflictCols = await tableColumns(raw, 'sync_conflicts');
    expect(conflictCols.map((c) => c.name)).toEqual([
      'id',
      'table_name',
      'local_id',
      'server_id',
      'local_payload',
      'server_payload',
      'created_at',
    ]);
  });

  it('deja user_version en la última migración y es idempotente', async () => {
    const { db } = await makeSqlJsDb();

    await runMigrations(db);
    await runMigrations(db);

    const [row] = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(row.user_version).toBe(6);
  });

  it('actualiza una base con el schema viejo sin perder datos', async () => {
    const { db, raw } = await makeSqlJsDb();
    raw.exec(`
      CREATE TABLE tasks (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        due_date     TEXT,
        status       TEXT NOT NULL DEFAULT 'active',
        created_at   TEXT NOT NULL,
        completed_at TEXT
      );
      CREATE TABLE steps (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id      INTEGER NOT NULL,
        name         TEXT NOT NULL,
        duration_min INTEGER,
        order_index  INTEGER NOT NULL,
        status       TEXT NOT NULL DEFAULT 'pending',
        completed_at TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
      CREATE TABLE daily_progress (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        date            TEXT NOT NULL UNIQUE,
        steps_completed INTEGER NOT NULL DEFAULT 0
      );
    `);
    raw.run(
      `INSERT INTO tasks (name, created_at) VALUES (?, ?)`,
      ['Tarea existente', '2026-01-01T00:00:00.000Z'],
    );

    await runMigrations(db);

    const taskCols = await tableColumns(raw, 'tasks');
    expect(taskCols.map((c) => c.name)).toEqual(
      expect.arrayContaining(['server_id', 'dirty', 'updated_at']),
    );
    const [count] = raw.exec('SELECT COUNT(*) FROM tasks');
    expect(count.values[0][0]).toBe(1);
  });

  it('sync_meta es de una sola fila (singleton con id = 1)', async () => {
    const { db, raw } = await makeSqlJsDb();
    await runMigrations(db);

    await db.runAsync(
      `INSERT INTO sync_meta (id, last_sync_at) VALUES (1, ?)`,
      ['2026-08-10T00:00:00.000Z'],
    );
    expect(() => {
      raw.exec(`INSERT INTO sync_meta (id, last_sync_at) VALUES (2, ?)`, [
        '2026-08-10T00:00:00.000Z',
      ]);
    }).toThrow();
  });
});
