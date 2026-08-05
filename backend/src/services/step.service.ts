import { StepRepository } from '../repositories/step.repository';
import { TaskRepository } from '../repositories/task.repository';
import { createStepSchema, updateStepSchema, reorderStepsSchema } from '../validations/schemas';

export class StepService {
  private stepRepo = new StepRepository();
  private taskRepo = new TaskRepository();

  async addStep(input: unknown) {
    const data = createStepSchema.parse(input);
    const maxOrderIndex = await this.stepRepo.getMaxOrderIndex(data.taskId);
    return this.stepRepo.create({
      taskId: data.taskId,
      name: data.name,
      durationMin: data.durationMin ?? null,
      orderIndex: maxOrderIndex + 1,
    });
  }

  async getStepsByTask(taskId: number) {
    return this.stepRepo.findByTask(taskId);
  }

  async updateStep(id: number, input: unknown) {
    const data = updateStepSchema.parse(input);
    return this.stepRepo.update(id, {
      name: data.name,
      durationMin: data.durationMin,
    });
  }

  async deleteStep(id: number) {
    const step = await this.stepRepo.findById(id);
    if (!step) {
      throw new Error('STEP_NOT_FOUND');
    }
    await this.stepRepo.delete(id);
    const remaining = await this.stepRepo.findByTask(step.taskId);
    await this.stepRepo.reorder(
      step.taskId,
      remaining.map((s) => s.id),
    );
  }

  async reorder(input: unknown) {
    const data = reorderStepsSchema.parse(input);
    await this.stepRepo.reorder(data.taskId, data.orderedIds);
  }

  async completeStep(stepId: number) {
    const step = await this.stepRepo.findById(stepId);
    if (!step) {
      throw new Error('STEP_NOT_FOUND');
    }

    if (step.status === 'completed') {
      throw new Error('STEP_ALREADY_COMPLETED');
    }

    // 1. Marcar el paso como completado
    await this.stepRepo.completeStep(stepId);

    // 2. Incrementar métrica diaria (idempotente por fecha)
    const todayStr = new Date().toISOString().split('T')[0];
    await this.stepRepo.upsertDailyProgress(todayStr);

    // 3. Buscar el próximo paso pendiente para esa tarea
    const nextStep = await this.stepRepo.findNextPending(step.taskId);
    let taskCompleted = false;

    // 4. Si no quedan pasos pendientes, cerrar la tarea automáticamente
    if (!nextStep) {
      const pendingCount = await this.taskRepo.findPendingStepsCount(step.taskId);
      if (pendingCount === 0) {
        await this.taskRepo.completeTask(step.taskId);
        taskCompleted = true;
      }
    }

    return { nextStep, taskCompleted };
  }
}
