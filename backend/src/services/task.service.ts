import { TaskRepository } from '../repositories/task.repository';
import { createTaskSchema, updateTaskSchema } from '../validations/schemas';
import { prisma, Db } from '../config/prisma';

function parseOptionalDate(value?: string | null): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(value);
}

function normalizeDescription(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value;
}

export class TaskService {
  private taskRepo = new TaskRepository();

  async createTask(userId: string, input: unknown) {
    const data = createTaskSchema.parse(input);
    return this.taskRepo.create(userId, {
      name: data.name,
      description: normalizeDescription(data.description),
      dueDate: parseOptionalDate(data.dueDate),
    });
  }

  async getTaskById(userId: string, id: string) {
    return this.taskRepo.findById(userId, id);
  }

  async getAllActive(userId: string) {
    return this.taskRepo.findAllActive(userId);
  }

  async getCompletedTasks(userId: string) {
    return this.taskRepo.findCompleted(userId);
  }

  async updateTask(userId: string, id: string, input: unknown, db: Db = prisma) {
    const data = updateTaskSchema.parse(input);
    return this.taskRepo.update(userId, id, {
      name: data.name,
      description: normalizeDescription(data.description),
      dueDate: parseOptionalDate(data.dueDate),
    }, db);
  }

  async deleteTask(userId: string, id: string) {
    await this.taskRepo.delete(userId, id);
  }

  async completeTask(userId: string, taskId: string) {
    const task = await this.taskRepo.findById(userId, taskId);
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    const pendingCount = await this.taskRepo.findPendingStepsCount(userId, taskId);

    // Regla de Negocio: Invariante (espejo de TaskService.complete del app móvil)
    if (pendingCount > 0) {
      throw new Error('CANNOT_COMPLETE_WITH_PENDING_STEPS');
    }

    return this.taskRepo.completeTask(userId, taskId);
  }
}
