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

export type VersionSnapshot = {
  name: string;
  status: string;
  updatedAt: string;
};

export type SyncConflict = {
  id: number;
  tableName: SyncTable;
  localId: number;
  serverId: string;
  local: VersionSnapshot;
  server: ServerTask | ServerStep;
  createdAt: string;
};

export const CONFLICT_WINDOW_MS = 60_000;

export function isNearTimestamp(a: string, b: string, windowMs = CONFLICT_WINDOW_MS): boolean {
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Number.isFinite(diff) && diff <= windowMs;
}

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

export async function getAllTasks(db: MigrationDb): Promise<Task[]> {
  return db.getAllAsync<Task>(`SELECT * FROM tasks ORDER BY id`, []);
}

export async function getAllSteps(db: MigrationDb): Promise<Step[]> {
  return db.getAllAsync<Step>(`SELECT * FROM steps ORDER BY id`, []);
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

export async function getLocalOwner(db: MigrationDb): Promise<string | null> {
  const rows = await db.getAllAsync<{ owner_user_id: string | null }>(
    `SELECT owner_user_id FROM sync_meta WHERE id = 1`,
    [],
  );
  return rows[0]?.owner_user_id ?? null;
}

export async function setLocalOwner(db: MigrationDb, userId: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO sync_meta (id, owner_user_id) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET owner_user_id = excluded.owner_user_id`,
    [userId],
  );
}

export async function resetLocalData(db: MigrationDb): Promise<void> {
  await db.runAsync(`DELETE FROM sync_conflicts`, []);
  await db.runAsync(`DELETE FROM steps`, []);
  await db.runAsync(`DELETE FROM tasks`, []);
  await db.runAsync(`DELETE FROM daily_progress`, []);
  await db.runAsync(`DELETE FROM sync_meta`, []);
}

export async function setLastSyncAt(db: MigrationDb, iso: string): Promise<void> {
  try {
    await db.runAsync(
      `INSERT INTO sync_meta (id, last_sync_at) VALUES (1, ?)
       ON CONFLICT(id) DO UPDATE SET last_sync_at = excluded.last_sync_at`,
      [iso],
    );
  } catch (err) {
    if (__DEV__) console.warn('[sync] setLastSyncAt failed (non-critical):', err);
  }
}

export async function getTaskIdByServerId(db: MigrationDb, serverId: string): Promise<number | null> {
  const rows = await db.getAllAsync<{ id: number }>(`SELECT id FROM tasks WHERE server_id = ?`, [
    serverId,
  ]);
  return rows[0]?.id ?? null;
}

export async function forceApplyServerTask(db: MigrationDb, task: ServerTask): Promise<void> {
  const existing = await db.getAllAsync<{ id: number }>(`SELECT id FROM tasks WHERE server_id = ?`, [
    task.id,
  ]);
  const row = existing[0];
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

export async function forceApplyServerStep(
  db: MigrationDb,
  step: ServerStep,
  taskId: number,
): Promise<void> {
  const existing = await db.getAllAsync<{ id: number }>(`SELECT id FROM steps WHERE server_id = ?`, [
    step.id,
  ]);
  const row = existing[0];
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

export async function upsertServerTask(db: MigrationDb, task: ServerTask): Promise<void> {
  const existing = await db.getAllAsync<{
    id: number;
    name: string;
    status: string;
    updated_at: string | null;
    dirty: number;
  }>(`SELECT id, name, status, updated_at, dirty FROM tasks WHERE server_id = ?`,
    [task.id],
  );
  const row = existing[0];
  if (row) {
    if (row.updated_at !== null && row.dirty === 1 && isNearTimestamp(row.updated_at, task.updatedAt)) {
      await saveConflict(db, 'tasks', row.id, task.id, {
        name: row.name,
        status: row.status,
        updatedAt: row.updated_at,
      }, task);
      return;
    }
    if (row.updated_at !== null && row.updated_at >= task.updatedAt) {
      return;
    }
  }
  await forceApplyServerTask(db, task);
}

export async function upsertServerStep(
  db: MigrationDb,
  step: ServerStep,
  taskId: number,
): Promise<void> {
  const existing = await db.getAllAsync<{
    id: number;
    name: string;
    status: string;
    updated_at: string | null;
    dirty: number;
  }>(`SELECT id, name, status, updated_at, dirty FROM steps WHERE server_id = ?`,
    [step.id],
  );
  const row = existing[0];
  if (row) {
    if (row.updated_at !== null && row.dirty === 1 && isNearTimestamp(row.updated_at, step.updatedAt)) {
      await saveConflict(db, 'steps', row.id, step.id, {
        name: row.name,
        status: row.status,
        updatedAt: row.updated_at,
      }, step);
      return;
    }
    if (row.updated_at !== null && row.updated_at >= step.updatedAt) {
      return;
    }
  }
  await forceApplyServerStep(db, step, taskId);
}

async function saveConflict(
  db: MigrationDb,
  table: SyncTable,
  localId: number,
  serverId: string,
  local: VersionSnapshot,
  server: ServerTask | ServerStep,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO sync_conflicts (table_name, local_id, server_id, local_payload, server_payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(table_name, local_id) DO UPDATE SET
         local_payload = excluded.local_payload,
         server_payload = excluded.server_payload,
         created_at = excluded.created_at`,
    [table, localId, serverId, JSON.stringify(local), JSON.stringify(server), nowIso()],
  );
}

export async function getConflicts(db: MigrationDb): Promise<SyncConflict[]> {
  const rows = await db.getAllAsync<{
    id: number;
    table_name: SyncTable;
    local_id: number;
    server_id: string;
    local_payload: string;
    server_payload: string;
    created_at: string;
  }>(`SELECT * FROM sync_conflicts ORDER BY created_at DESC`, []);
  return rows.map((row) => ({
    id: row.id,
    tableName: row.table_name,
    localId: row.local_id,
    serverId: row.server_id,
    local: JSON.parse(row.local_payload) as VersionSnapshot,
    server: JSON.parse(row.server_payload) as ServerTask | ServerStep,
    createdAt: row.created_at,
  }));
}

export async function deleteConflict(db: MigrationDb, conflictId: number): Promise<void> {
  await db.runAsync(`DELETE FROM sync_conflicts WHERE id = ?`, [conflictId]);
}

export async function resolveConflictKeepLocal(
  db: MigrationDb,
  conflictId: number,
): Promise<void> {
  const rows = await db.getAllAsync<{ table_name: SyncTable; local_id: number }>(
    `SELECT table_name, local_id FROM sync_conflicts WHERE id = ?`,
    [conflictId],
  );
  if (rows.length === 0) return;
  await markDirty(db, rows[0].table_name, rows[0].local_id);
  await deleteConflict(db, conflictId);
}

export async function resolveConflictKeepServer(
  db: MigrationDb,
  conflictId: number,
): Promise<void> {
  const rows = await db.getAllAsync<{ table_name: SyncTable; server_payload: string }>(
    `SELECT table_name, server_payload FROM sync_conflicts WHERE id = ?`,
    [conflictId],
  );
  if (rows.length === 0) return;
  const payload = JSON.parse(rows[0].server_payload) as ServerTask | ServerStep;
  if (rows[0].table_name === 'tasks') {
    await forceApplyServerTask(db, payload as ServerTask);
  } else {
    const taskId = await getTaskIdByServerId(db, (payload as ServerStep).taskId);
    if (taskId !== null) {
      await forceApplyServerStep(db, payload as ServerStep, taskId);
    }
  }
  await deleteConflict(db, conflictId);
}
