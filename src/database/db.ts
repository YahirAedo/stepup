import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      console.log('[DB] opening stepup.db...');
      const database = await SQLite.openDatabaseAsync('stepup.db');
      if (Platform.OS === 'web') {
        // OPFS no soporta archivos de journal auxiliares (-journal/-wal/-shm).
        // MEMORY evita crearlos y es seguro en una app single-tab.
        await database.execAsync('PRAGMA journal_mode = MEMORY;');
      } else {
        await database.execAsync('PRAGMA journal_mode = WAL;');
      }
      await database.execAsync('PRAGMA foreign_keys = ON;');
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
