import { StepRepository } from '../repositories/step.repository';
import { TaskRepository } from '../repositories/task.repository';
import { createStepSchema, updateStepSchema, reorderStepsSchema } from '../validations/schemas';

export class StepService {
  private stepRepo = new StepRepository();
  private taskRepo = new TaskRepository();

  async addStep(userId: string, input: unknown) {
    const data = createStepSchema.parse(input);
    const task = await this.taskRepo.findById(userId, data.taskId);
    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }
    const maxOrderIndex = await this.stepRepo.getMaxOrderIndex(userId, data.taskId);
    return this.stepRepo.create({
      taskId: data.taskId,
      name: data.name,
      durationMin: data.durationMin ?? null,
      orderIndex: maxOrderIndex + 1,
    });
  }

  async getStepsByTask(userId: string, taskId: string) {
    return this.stepRepo.findByTask(userId, taskId);
  }

  async updateStep(userId: string, id: string, input: unknown) {
    const data = updateStepSchema.parse(input);
    return this.stepRepo.update(userId, id, {
      name: data.name,
      durationMin: data.durationMin,
    });
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
    await this.stepRepo.reorder(userId, data.taskId, data.orderedIds);
  }

  async completeStep(userId: string, stepId: string) {
    const step = await this.stepRepo.findById(userId, stepId);
    if (!step) {
      throw new Error('STEP_NOT_FOUND');
    }

    if (step.status === 'completed') {
      throw new Error('STEP_ALREADY_COMPLETED');
    }

    // 1. Marcar el paso como completado
    await this.stepRepo.completeStep(userId, stepId);

    // 2. Incrementar métrica diaria (idempotente por fecha y usuario)
    const todayStr = new Date().toISOString().split('T')[0];
    await this.stepRepo.upsertDailyProgress(userId, todayStr);

    // 3. Buscar el próximo paso pendiente para esa tarea
    const nextStep = await this.stepRepo.findNextPending(userId, step.taskId);
    let taskCompleted = false;

    // 4. Si no quedan pasos pendientes, cerrar la tarea automáticamente
    if (!nextStep) {
      const pendingCount = await this.taskRepo.findPendingStepsCount(userId, step.taskId);
      if (pendingCount === 0) {
        await this.taskRepo.completeTask(userId, step.taskId);
        taskCompleted = true;
      }
    }

    return { nextStep, taskCompleted };
  }
}
