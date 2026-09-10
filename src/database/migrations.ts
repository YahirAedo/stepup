export type SqlParam = string | number | null;

export interface MigrationDb {
  execAsync: (sql: string) => Promise<void>;
  getAllAsync: <T>(sql: string, params: SqlParam[]) => Promise<T[]>;
  runAsync: (sql: string, params: SqlParam[]) => Promise<{ lastInsertRowId: number }>;
}

type Migration = {
  version: number;
  statements: string[];
};

const BASE_SCHEMA_V1: string[] = [
  `CREATE TABLE IF NOT EXISTS tasks (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     name         TEXT NOT NULL,
     due_date     TEXT,
     status       TEXT NOT NULL DEFAULT 'active',
     created_at   TEXT NOT NULL,
     completed_at TEXT
   );`,
  `CREATE TABLE IF NOT EXISTS steps (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     task_id      INTEGER NOT NULL,
     name         TEXT NOT NULL,
     duration_min INTEGER,
     order_index  INTEGER NOT NULL,
     status       TEXT NOT NULL DEFAULT 'pending',
     completed_at TEXT,
     FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
   );`,
  `CREATE TABLE IF NOT EXISTS daily_progress (
     id              INTEGER PRIMARY KEY AUTOINCREMENT,
     date            TEXT NOT NULL UNIQUE,
     steps_completed INTEGER NOT NULL DEFAULT 0
   );`,
];

const OFFLINE_SYNC_V2: string[] = [
  `ALTER TABLE tasks ADD COLUMN server_id TEXT;`,
  `ALTER TABLE tasks ADD COLUMN dirty INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE tasks ADD COLUMN updated_at TEXT;`,
  `ALTER TABLE steps ADD COLUMN server_id TEXT;`,
  `ALTER TABLE steps ADD COLUMN dirty INTEGER NOT NULL DEFAULT 0;`,
  `ALTER TABLE steps ADD COLUMN updated_at TEXT;`,
  `CREATE TABLE IF NOT EXISTS sync_meta (
     id           INTEGER PRIMARY KEY CHECK (id = 1),
     last_sync_at TEXT
   );`,
];

const CONFLICTS_V3: string[] = [
  `CREATE TABLE IF NOT EXISTS sync_conflicts (
     id             INTEGER PRIMARY KEY AUTOINCREMENT,
     table_name     TEXT NOT NULL,
     local_id       INTEGER NOT NULL,
     server_id      TEXT NOT NULL,
     local_payload  TEXT NOT NULL,
     server_payload TEXT NOT NULL,
     created_at     TEXT NOT NULL,
     UNIQUE (table_name, local_id)
   );`,
];

// V4: aislar la DB local por usuario — sync_meta guarda el owner_user_id actual.
const OWNER_USER_V4: string[] = [
  `ALTER TABLE sync_meta ADD COLUMN owner_user_id TEXT;`,
];

// V6: descripción de tarea (contexto para IA) — issue #153
const TASK_DESCRIPTION_V6: string[] = [
  `ALTER TABLE tasks ADD COLUMN description TEXT;`,
];

const MIGRATIONS: Migration[] = [
  { version: 1, statements: BASE_SCHEMA_V1 },
  { version: 2, statements: OFFLINE_SYNC_V2 },
  { version: 3, statements: CONFLICTS_V3 },
  { version: 4, statements: OWNER_USER_V4 },
  { version: 6, statements: TASK_DESCRIPTION_V6 },
];

export async function runMigrations(db: MigrationDb): Promise<void> {
  const rows = await db.getAllAsync<{ user_version: number }>('PRAGMA user_version', []);
  const current = rows[0]?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    for (const statement of migration.statements) {
      await db.execAsync(statement);
    }
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
}
