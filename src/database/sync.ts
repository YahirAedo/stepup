import type { MigrationDb } from './migrations';
import type { Task, Step } from '../types';

export type SyncTable = 'tasks' | 'steps';

export type ServerIdMap = Record<string, string>;

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
