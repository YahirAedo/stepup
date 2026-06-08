import * as SQLite from 'expo-sqlite';

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tasks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      due_date     TEXT,
      status       TEXT NOT NULL DEFAULT 'active',
      created_at   TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS steps (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id      INTEGER NOT NULL,
      name         TEXT NOT NULL,
      duration_min INTEGER,
      order_index  INTEGER NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending',
      completed_at TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_progress (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      date             TEXT NOT NULL UNIQUE,
      steps_completed  INTEGER NOT NULL DEFAULT 0
    );
  `);
}