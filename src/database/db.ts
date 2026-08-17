import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      console.log('[DB] opening stepup.db...');
      const database = await SQLite.openDatabaseAsync('stepup.db');
      await database.execAsync('PRAGMA journal_mode = WAL;');
      console.log('[DB] running migrations...');
      await runMigrations(database);
      if (process.env.EXPO_PUBLIC_SEED_DB === 'true') {
        console.log('[DB] seeding development data...');
        const { runSeed } = await import('./seed');
        await runSeed(database);
      }
      return database;
    })();
  }
  return dbPromise;
}
