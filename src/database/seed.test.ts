import { describe, expect, it } from 'vitest';
import type { Database } from 'sql.js';
import { runMigrations } from './migrations';
import { runSeed } from './seed';
import { makeSqlJsDb } from './testDb';

async function countOf(raw: Database, table: string): Promise<number> {
  const res = raw.exec(`SELECT COUNT(*) AS count FROM ${table}`);
  return (res[0]?.values[0][0] as number) ?? 0;
}

describe('runSeed — datos de prueba para desarrollo', () => {
  it('inserta datos de prueba en una base vacía', async () => {
    const { db, raw } = await makeSqlJsDb();
    await runMigrations(db);
    await runSeed(db);

    expect(await countOf(raw, 'tasks')).toBe(4);
    expect(await countOf(raw, 'steps')).toBe(8);
    expect(await countOf(raw, 'daily_progress')).toBe(7);
  });

  it('no duplica datos al ejecutarse dos veces', async () => {
    const { db, raw } = await makeSqlJsDb();
    await runMigrations(db);
    await runSeed(db);
    await runSeed(db);

    expect(await countOf(raw, 'tasks')).toBe(4);
    expect(await countOf(raw, 'steps')).toBe(8);
    expect(await countOf(raw, 'daily_progress')).toBe(7);
  });

  it('no borra ni pisa datos existentes del usuario', async () => {
    const { db, raw } = await makeSqlJsDb();
    await runMigrations(db);
    await db.runAsync(
      `INSERT INTO tasks (name, created_at) VALUES (?, ?)`,
      ['Tarea del usuario', new Date().toISOString()],
    );

    await runSeed(db);

    const [rows] = raw.exec(`SELECT name FROM tasks`);
    expect(rows.values.map((r) => r[0])).toEqual(['Tarea del usuario']);
  });
});