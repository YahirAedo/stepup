import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('stepup.db');
  await runMigrations(db);
  return db;
}