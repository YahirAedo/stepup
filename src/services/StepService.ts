import { getDb } from '../database/db';
import { Step, CreateStepInput, UpdateStepInput } from '../types';
import { ProgressService } from './ProgressService';
import { TaskService } from './TaskService';

export const StepService = {

  async add(input: CreateStepInput): Promise<Step> {
    const db = await getDb();
    // El nuevo paso va al final
    const last = await db.getFirstAsync<{ max_index: number | null }>(
      `SELECT MAX(order_index) as max_index FROM steps WHERE task_id = ?`,
      [input.task_id]
    );
    const order_index = (last?.max_index ?? -1) + 1;
    const result = await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [input.task_id, input.name, input.duration_min ?? null, order_index]
    );
    return {
      id: result.lastInsertRowId,
      task_id: input.task_id,
      name: input.name,
      duration_min: input.duration_min ?? null,
      order_index,
      status: 'pending',
      completed_at: null,
    };
  },

  async getByTask(task_id: number): Promise<Step[]> {
    const db = await getDb();
    return await db.getAllAsync<Step>(
      `SELECT * FROM steps WHERE task_id = ? ORDER BY order_index ASC`,
      [task_id]
    );
  },

  async getNextPending(task_id: number): Promise<Step | null> {
    const db = await getDb();
    return await db.getFirstAsync<Step>(
      `SELECT * FROM steps
       WHERE task_id = ? AND status = 'pending'
       ORDER BY order_index ASC
       LIMIT 1`,
      [task_id]
    );
  },

  async update(id: number, input: UpdateStepInput): Promise<void> {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    if (input.name !== undefined)         { fields.push('name = ?');         values.push(input.name); }
    if (input.duration_min !== undefined) { fields.push('duration_min = ?'); values.push(input.duration_min); }
    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(
      `UPDATE steps SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDb();
    // Obtener el step para saber task_id y order_index antes de borrar
    const step = await db.getFirstAsync<Step>(
      `SELECT * FROM steps WHERE id = ?`, [id]
    );
    if (!step) return;
    await db.runAsync(`DELETE FROM steps WHERE id = ?`, [id]);
    // Reindexar los steps que quedaron después
    await db.runAsync(
      `UPDATE steps
       SET order_index = order_index - 1
       WHERE task_id = ? AND order_index > ?`,
      [step.task_id, step.order_index]
    );
  },

  async getStepCounts(task_id: number): Promise<{ total: number; completed: number }> {
    const db = await getDb();
    const total = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM steps WHERE task_id = ?`,
      [task_id]
    );
    const completed = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM steps WHERE task_id = ? AND status = 'completed'`,
      [task_id]
    );
    return {
      total: total?.count ?? 0,
      completed: completed?.count ?? 0,
    };
  },

  async reorder(task_id: number, orderedIds: number[]): Promise<void> {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.runAsync(
          `UPDATE steps SET order_index = ? WHERE id = ? AND task_id = ?`,
          [i, orderedIds[i], task_id]
        );
      }
    });
  },

  async complete(id: number): Promise<{ nextStep: Step | null; taskCompleted: boolean }> {
    const db = await getDb();
    const step = await db.getFirstAsync<Step>(
      `SELECT * FROM steps WHERE id = ?`, [id]
    );
    if (!step) return { nextStep: null, taskCompleted: false };

    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE steps SET status = 'completed', completed_at = ? WHERE id = ?`,
      [now, id]
    );

    // Registrar progreso diario
    await ProgressService.increment();

    // Buscar el siguiente paso pendiente
    const nextStep = await StepService.getNextPending(step.task_id);

    // Si no hay más pasos pendientes, completar la tarea
    let taskCompleted = false;
    if (!nextStep) {
      taskCompleted = await TaskService.complete(step.task_id);
    }

    return { nextStep, taskCompleted };
  },
};