import { getDb } from '../database/db';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

export const TaskService = {
  async create(input: CreateTaskInput): Promise<Task> {
    const db = await getDb();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO tasks (name, due_date, status, created_at)
       VALUES (?, ?, 'active', ?)`,
      [input.name, input.due_date ?? null, now],
    );
    return {
      id: result.lastInsertRowId,
      name: input.name,
      due_date: input.due_date ?? null,
      status: 'active',
      created_at: now,
      completed_at: null,
    };
  },

  async getAll(): Promise<Task[]> {
    const db = await getDb();
    return await db.getAllAsync<Task>(
      `SELECT * FROM tasks WHERE status = 'active' ORDER BY created_at DESC`,
    );
  },

  async getById(id: number): Promise<Task | null> {
    const db = await getDb();
    return await db.getFirstAsync<Task>(`SELECT * FROM tasks WHERE id = ?`, [id]);
  },

  async update(id: number, input: UpdateTaskInput): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    if (input.name !== undefined) {
      fields.push('name = ?');
      values.push(input.name);
    }
    if (input.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(input.due_date);
    }
    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    // CASCADE DELETE elimina los steps automaticamente
    await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
  },

  async complete(id: number): Promise<boolean> {
    const db = await getDb();
    // Verificar que todos los pasos estén completados
    const pending = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM steps WHERE task_id = ? AND status = 'pending'`,
      [id],
    );
    if (pending && pending.count > 0) return false;

    const now = new Date().toISOString();
    await db.runAsync(`UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?`, [
      now,
      id,
    ]);
    return true;
  },

  async getCompleted(): Promise<Task[]> {
    const db = await getDb();
    return await db.getAllAsync<Task>(
      `SELECT * FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC`,
    );
  },
};
