import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { getDb } from '../database/db';
import { nowIso } from '../database/sync';
import type { SqlParam } from '../database/migrations';
import { apiFetch } from './api';
import { hasSession } from './session';
import { syncNow } from './SyncService';

function toTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    due_date: (row.due_date as string | null) ?? null,
    status: row.status as Task['status'],
    created_at: row.created_at as string,
    completed_at: (row.completed_at as string | null) ?? null,
    server_id: (row.server_id as string | null) ?? null,
    dirty: (row.dirty as number) ?? 0,
    updated_at: row.updated_at as string,
  };
}

export const TaskService = {
  async create(input: CreateTaskInput): Promise<Task> {
    const db = await getDb();
    const now = nowIso();
    const res = await db.runAsync(
      `INSERT INTO tasks (name, description, due_date, status, created_at, completed_at, dirty, updated_at)
       VALUES (?, ?, ?, 'active', ?, NULL, 1, ?)`,
      [input.name, input.description ?? null, input.due_date ?? null, now, now],
    );
    const id = res.lastInsertRowId;
    const [row] = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM tasks WHERE id = ?`,
      [id],
    );
    void syncNow();
    return toTask(row);
  },

  async getAll(): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM tasks ORDER BY created_at DESC, id DESC`,
      [],
    );
    return rows.map(toTask);
  },

  async getById(id: number): Promise<Task | null> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM tasks WHERE id = ?`,
      [id],
    );
    if (rows.length === 0) return null;
    return toTask(rows[0]);
  },

  async update(id: number, input: UpdateTaskInput): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const params: SqlParam[] = [];
    if (input.name !== undefined) {
      sets.push('name = ?');
      params.push(input.name);
    }
    if (input.description !== undefined) {
      sets.push('description = ?');
      params.push(input.description);
    }
    if (input.due_date !== undefined) {
      sets.push('due_date = ?');
      params.push(input.due_date);
    }
    if (sets.length === 0) return;
    sets.push('dirty = 1', 'updated_at = ?');
    params.push(nowIso(), id);
    await db.runAsync(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, params);
    void syncNow();
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ server_id: string | null }>(
      `SELECT server_id FROM tasks WHERE id = ?`,
      [id],
    );
    const serverId = rows[0]?.server_id ?? null;
    await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
    await db.runAsync(`DELETE FROM steps WHERE task_id = ?`, [id]);
    if (hasSession() && serverId) {
      try {
        await apiFetch(`/api/tasks/${serverId}`, { method: 'DELETE' });
      } catch {
        // offline: el servidor lo reconcilia en el próximo pull
      }
    }
  },

  async complete(id: number): Promise<boolean> {
    const db = await getDb();
    await db.runAsync(
      `UPDATE tasks SET status = 'completed', completed_at = ?, dirty = 1, updated_at = ?
       WHERE id = ?`,
      [nowIso(), nowIso(), id],
    );
    void syncNow();
    return true;
  },

  async getCompleted(): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC, id DESC`,
      [],
    );
    return rows.map(toTask);
  },
};
