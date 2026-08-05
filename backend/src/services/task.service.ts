import { TaskRepository } from '../repositories/task.repository';
import { createTaskSchema, updateTaskSchema } from '../validations/schemas';

function parseOptionalDate(value?: string | null): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(value);
}

export class TaskService {
  private taskRepo = new TaskRepository();

  async createTask(input: unknown) {
    const data = createTaskSchema.parse(input);
    return this.taskRepo.create({
      name: data.name,
      dueDate: parseOptionalDate(data.dueDate),
    });
  }

  async getTaskById(id: number) {
    return this.taskRepo.findById(id);
  }

  async getAllActive() {
    return this.taskRepo.findAllActive();
  }

  async getCompletedTasks() {
    return this.taskRepo.findCompleted();
  }

  async updateTask(id: number, input: unknown) {
    const data = updateTaskSchema.parse(input);
    return this.taskRepo.update(id, {
      name: data.name,
      dueDate: parseOptionalDate(data.dueDate),
    });
  }

  async deleteTask(id: number) {
    await this.taskRepo.delete(id);
  }

  async completeTask(taskId: number) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    const pendingCount = await this.taskRepo.findPendingStepsCount(taskId);

    // Regla de Negocio: Invariante (espejo de TaskService.complete del app móvil)
    if (pendingCount > 0) {
      throw new Error('CANNOT_COMPLETE_WITH_PENDING_STEPS');
    }

    return this.taskRepo.completeTask(taskId);
  }
}
