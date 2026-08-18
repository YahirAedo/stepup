import initSqlJs, { type Database } from 'sql.js';
import type { MigrationDb, SqlParam } from './migrations';

const SQL_PROMISE = initSqlJs();

export async function makeSqlJsDb(): Promise<{ db: MigrationDb; raw: Database }> {
  const instance = await SQL_PROMISE;
  const raw = new instance.Database();
  const db: MigrationDb = {
    execAsync: async (sql: string) => {
      raw.exec(sql);
    },
    getAllAsync: async <T>(sql: string, params: SqlParam[] = []) => {
      const stmt = raw.prepare(sql);
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      stmt.free();
      return rows;
    },
    runAsync: async (sql: string, params: SqlParam[] = []) => {
      raw.run(sql, params);
      const res = raw.exec('SELECT last_insert_rowid() AS id');
      return { lastInsertRowId: (res[0]?.values[0][0] as number) ?? 0 };
    },
  };
  return { db, raw };
}
