import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { runSeed } from './seed';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('stepup.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await runMigrations(db);
  if (__DEV__) {
    await runSeed(db);
  }
  return db;
}
