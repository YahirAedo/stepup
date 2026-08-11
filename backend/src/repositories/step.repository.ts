import { prisma } from '../config/prisma';

export class StepRepository {
  async findById(id: number) {
    return prisma.step.findUnique({ where: { id } });
  }

  async create(data: {
    taskId: number;
    name: string;
    durationMin?: number | null;
    orderIndex: number;
  }) {
    return prisma.step.create({
      data: {
        taskId: data.taskId,
        name: data.name,
        durationMin: data.durationMin ?? null,
        orderIndex: data.orderIndex,
      },
    });
  }

  async findByTask(taskId: number) {
    return prisma.step.findMany({
      where: { taskId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async getMaxOrderIndex(taskId: number) {
    const agg = await prisma.step.aggregate({
      where: { taskId },
      _max: { orderIndex: true },
    });
    return agg._max.orderIndex ?? -1;
  }

  async update(id: number, data: { name?: string; durationMin?: number | null }) {
    return prisma.step.update({
      where: { id },
      data: { name: data.name, durationMin: data.durationMin },
    });
  }

  async delete(id: number) {
    return prisma.step.delete({ where: { id } });
  }

  async reorder(taskId: number, orderedIds: number[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.step.updateMany({
          where: { id, taskId },
          data: { orderIndex: index },
        }),
      ),
    );
  }

  async completeStep(id: number) {
    return prisma.step.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async findNextPending(taskId: number) {
    return prisma.step.findFirst({
      where: { taskId, status: 'pending' },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async upsertDailyProgress(dateStr: string) {
    return prisma.dailyProgress.upsert({
      where: { date: dateStr },
      update: { stepsCompleted: { increment: 1 } },
      create: { date: dateStr, stepsCompleted: 1 },
    });
  }
}
