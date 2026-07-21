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

  // Seed data (limpia y resiembra cada vez para desarrollo)
  await db.execAsync('DELETE FROM steps; DELETE FROM tasks; DELETE FROM daily_progress;');
  await db.withTransactionAsync(async () => {
    const now = new Date().toISOString();
    // Tarea 1: Proyecto Final (urgente, con pasos)
    const t1 = await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at)
         VALUES (?, ?, 'active', ?, NULL)`,
      ['Proyecto Final', new Date(Date.now() + 86400000 * 2).toISOString(), now],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status) VALUES (?, ?, ?, 0, 'pending')`,
      [t1.lastInsertRowId, 'Definir alcance', 30],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status) VALUES (?, ?, ?, 1, 'pending')`,
      [t1.lastInsertRowId, 'Diseñar prototipo', 60],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status) VALUES (?, ?, ?, 2, 'pending')`,
      [t1.lastInsertRowId, 'Documentar', 45],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at) VALUES (?, ?, ?, 3, 'completed', ?)`,
      [t1.lastInsertRowId, 'Investigar requisitos', 20, now],
    );

    // Tarea 2: Estudiar Álgebra (con progreso parcial)
    const t2 = await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at)
         VALUES (?, ?, 'active', ?, NULL)`,
      ['Estudiar Álgebra', new Date(Date.now() + 86400000 * 5).toISOString(), now],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at) VALUES (?, ?, ?, 0, 'completed', ?)`,
      [t2.lastInsertRowId, 'Repasar vectores', 25, now],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at) VALUES (?, ?, ?, 1, 'completed', ?)`,
      [t2.lastInsertRowId, 'Resolver matrices', 40, now],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status) VALUES (?, ?, ?, 2, 'pending')`,
      [t2.lastInsertRowId, 'Practicar determinantes', 30],
    );

    // Tarea 3: Preparar Presentación
    const t3 = await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at)
         VALUES (?, ?, 'active', ?, NULL)`,
      ['Preparar Presentación', new Date(Date.now() + 86400000 * 1).toISOString(), now],
    );
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status) VALUES (?, ?, ?, 0, 'pending')`,
      [t3.lastInsertRowId, 'Armar slides', 45],
    );

    // Tarea 4: Leer libro (sin pasos)
    await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at)
         VALUES (?, ?, 'active', ?, NULL)`,
      ['Leer "Atomic Habits"', null, now],
    );

    // Progreso semanal
    const days = [
      '2026-06-26',
      '2026-06-27',
      '2026-06-28',
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ];
    const counts = [2, 5, 1, 7, 3, 4, 6];
    for (let i = 0; i < days.length; i++) {
      await db.runAsync(
        `INSERT OR IGNORE INTO daily_progress (date, steps_completed) VALUES (?, ?)`,
        [days[i], counts[i]],
      );
    }
  });
}
