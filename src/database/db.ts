import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { runSeed } from './seed';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      console.log('[DB] opening stepup.db...');
      const database = await SQLite.openDatabaseAsync('stepup.db');
      await database.execAsync('PRAGMA journal_mode = WAL;');
      console.log('[DB] running migrations...');
      await runMigrations(database);
      if (__DEV__) {
        console.log('[DB] __DEV__ = true, running seed...');
        await runSeed(database);
      } else {
        console.log('[DB] __DEV__ = false, skipping seed');
      }
      return database;
    })();
  }
  return dbPromise;
}
