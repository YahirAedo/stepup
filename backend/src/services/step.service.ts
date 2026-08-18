import { StepRepository } from '../repositories/step.repository';
import { TaskRepository } from '../repositories/task.repository';
import {
  createStepSchema,
  createStepToTaskSchema,
  updateStepSchema,
  reorderStepsSchema,
  completeStepSchema,
} from '../validations/schemas';
import { prisma, Db } from '../config/prisma';

export class StepService {
  private stepRepo = new StepRepository();
  private taskRepo = new TaskRepository();

  async addStep(userId: string, input: unknown) {
    const data = createStepSchema.parse(input);
    return this.addStepToTask(userId, data.taskId, {
      name: data.name,
      durationMin: data.durationMin,
    });
  }

  async addStepToTask(userId: string, taskId: string, input: unknown) {
    const data = createStepToTaskSchema.parse(input);
    return prisma.$transaction(async (tx) => {
      const task = await this.taskRepo.findById(userId, taskId, tx);
      if (!task) {
        throw new Error('TASK_NOT_FOUND');
      }
      const maxOrderIndex = await this.stepRepo.getMaxOrderIndex(userId, taskId, tx);
      return this.stepRepo.create(
        {
          taskId,
          name: data.name,
          durationMin: data.durationMin ?? null,
          orderIndex: maxOrderIndex + 1,
        },
        tx,
      );
    });
  }

  async getStepsByTask(userId: string, taskId: string) {
    return this.stepRepo.findByTask(userId, taskId);
  }

  async updateStep(userId: string, id: string, input: unknown, db: Db = prisma) {
    const data = updateStepSchema.parse(input);
    return this.stepRepo.update(userId, id, {
      name: data.name,
      durationMin: data.durationMin,
    }, db);
  }

  async deleteStep(userId: string, id: string) {
    const step = await this.stepRepo.findById(userId, id);
    if (!step) {
      throw new Error('STEP_NOT_FOUND');
    }
    await this.stepRepo.delete(userId, id);
    const remaining = await this.stepRepo.findByTask(userId, step.taskId);
    await this.stepRepo.reorder(
      userId,
      step.taskId,
      remaining.map((s) => s.id),
    );
  }

  async reorder(userId: string, input: unknown) {
    const data = reorderStepsSchema.parse(input);
    const current = await this.stepRepo.findByTask(userId, data.taskId);
    const currentIds = current.map((step) => step.id).sort();
    const orderedIds = [...data.orderedIds].sort();

    const isExactPermutation =
      currentIds.length === orderedIds.length &&
      currentIds.every((id, index) => id === orderedIds[index]);

    if (!isExactPermutation) {
      throw new Error('INVALID_REORDER');
    }

    await this.stepRepo.reorder(userId, data.taskId, data.orderedIds);
  }

  async completeStep(userId: string, stepId: string, input?: unknown) {
    const step = await this.stepRepo.findById(userId, stepId);
    if (!step) {
      throw new Error('STEP_NOT_FOUND');
    }

    if (step.status === 'completed') {
      throw new Error('STEP_ALREADY_COMPLETED');
    }

    const data = completeStepSchema.parse(input);
    const todayStr = data?.date ?? new Date().toISOString().split('T')[0];

    return prisma.$transaction(async (tx) => {
      // 1. Marcar el paso como completado (update condicional: solo si sigue pending)
      const marked = await this.stepRepo.completeStep(userId, stepId, tx);
      if (marked.count === 0) {
        throw new Error('STEP_ALREADY_COMPLETED');
      }

      // 2. Incrementar métrica diaria (idempotente por fecha y usuario)
      await this.stepRepo.upsertDailyProgress(userId, todayStr, tx);

      // 3. Buscar el próximo paso pendiente para esa tarea
      const nextStep = await this.stepRepo.findNextPending(userId, step.taskId, tx);
      let taskCompleted = false;

      // 4. Si no quedan pasos pendientes, cerrar la tarea automáticamente
      if (!nextStep) {
        const pendingCount = await this.taskRepo.findPendingStepsCount(userId, step.taskId, tx);
        if (pendingCount === 0) {
          await this.taskRepo.completeTask(userId, step.taskId, tx);
          taskCompleted = true;
        }
      }

      return { nextStep, taskCompleted };
    });
  }
}
