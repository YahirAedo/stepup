import type { MigrationDb } from './migrations';
import type { Task, Step } from '../types';

export type SyncTable = 'tasks' | 'steps';

export type ServerIdMap = Record<string, string>;

export type ServerTask = {
  id: string;
  name: string;
  dueDate: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type ServerStep = {
  id: string;
  taskId: string;
  name: string;
  durationMin: number | null;
  orderIndex: number;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export function nowIso(): string {
  return new Date().toISOString();
}

export async function markDirty(db: MigrationDb, table: SyncTable, localId: number): Promise<void> {
  await db.runAsync(`UPDATE ${table} SET dirty = 1, updated_at = ? WHERE id = ?`, [
    nowIso(),
    localId,
  ]);
}

export async function clearDirty(db: MigrationDb, table: SyncTable, localId: number): Promise<void> {
  await db.runAsync(`UPDATE ${table} SET dirty = 0 WHERE id = ?`, [localId]);
}

export async function setServerId(
  db: MigrationDb,
  table: SyncTable,
  localId: number,
  serverId: string,
): Promise<void> {
  await db.runAsync(`UPDATE ${table} SET server_id = ? WHERE id = ?`, [serverId, localId]);
}

export async function getDirtyTasks(db: MigrationDb): Promise<Task[]> {
  return db.getAllAsync<Task>(`SELECT * FROM tasks WHERE dirty = 1 ORDER BY id`, []);
}

export async function getDirtySteps(db: MigrationDb): Promise<Step[]> {
  return db.getAllAsync<Step>(`SELECT * FROM steps WHERE dirty = 1 ORDER BY id`, []);
}

export async function applyServerIds(
  db: MigrationDb,
  table: SyncTable,
  map: ServerIdMap,
): Promise<void> {
  for (const [localId, serverId] of Object.entries(map)) {
    await db.runAsync(`UPDATE ${table} SET server_id = ?, dirty = 0 WHERE id = ?`, [
      serverId,
      Number(localId),
    ]);
  }
}

export async function getLastSyncAt(db: MigrationDb): Promise<string | null> {
  const rows = await db.getAllAsync<{ last_sync_at: string | null }>(
    `SELECT last_sync_at FROM sync_meta WHERE id = 1`,
    [],
  );
  return rows[0]?.last_sync_at ?? null;
}

export async function setLastSyncAt(db: MigrationDb, iso: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO sync_meta (id, last_sync_at) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET last_sync_at = excluded.last_sync_at`,
    [iso],
  );
}

export async function getTaskIdByServerId(db: MigrationDb, serverId: string): Promise<number | null> {
  const rows = await db.getAllAsync<{ id: number }>(`SELECT id FROM tasks WHERE server_id = ?`, [
    serverId,
  ]);
  return rows[0]?.id ?? null;
}

export async function upsertServerTask(db: MigrationDb, task: ServerTask): Promise<void> {
  const existing = await db.getAllAsync<{ id: number; updated_at: string | null }>(
    `SELECT id, updated_at FROM tasks WHERE server_id = ?`,
    [task.id],
  );
  const row = existing[0];
  if (row && row.updated_at !== null && row.updated_at >= task.updatedAt) {
    return;
  }
  if (row) {
    await db.runAsync(
      `UPDATE tasks SET name = ?, due_date = ?, status = ?, completed_at = ?, updated_at = ?, dirty = 0
         WHERE id = ?`,
      [task.name, task.dueDate, task.status, task.completedAt, task.updatedAt, row.id],
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, server_id, dirty, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      task.name,
      task.dueDate,
      task.status,
      task.createdAt,
      task.completedAt,
      task.id,
      task.updatedAt,
    ],
  );
}

export async function upsertServerStep(
  db: MigrationDb,
  step: ServerStep,
  taskId: number,
): Promise<void> {
  const existing = await db.getAllAsync<{ id: number; updated_at: string | null }>(
    `SELECT id, updated_at FROM steps WHERE server_id = ?`,
    [step.id],
  );
  const row = existing[0];
  if (row && row.updated_at !== null && row.updated_at >= step.updatedAt) {
    return;
  }
  if (row) {
    await db.runAsync(
      `UPDATE steps SET task_id = ?, name = ?, duration_min = ?, order_index = ?, status = ?, completed_at = ?, updated_at = ?, dirty = 0
         WHERE id = ?`,
      [
        taskId,
        step.name,
        step.durationMin,
        step.orderIndex,
        step.status,
        step.completedAt,
        step.updatedAt,
        row.id,
      ],
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, server_id, dirty, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      taskId,
      step.name,
      step.durationMin,
      step.orderIndex,
      step.status,
      step.completedAt,
      step.id,
      step.updatedAt,
    ],
  );
}
