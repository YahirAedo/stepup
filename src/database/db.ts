import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
import { runSeed } from './seed';

let db: SQLite.SQLiteDatabase | null = null;
let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (opening) return opening;

  opening = openAndInit();
  try {
    db = await opening;
    return db;
  } catch (error) {
    opening = null;
    db = null;
    throw error;
  }
}

async function openAndInit(): Promise<SQLite.SQLiteDatabase> {
  const instance = await SQLite.openDatabaseAsync('stepup.db');
  if (Platform.OS !== 'web') {
    await instance.execAsync('PRAGMA journal_mode = WAL;');
  }
  await instance.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(instance);
  if (__DEV__) {
    await runSeed(instance);
  }
  return instance;
}
