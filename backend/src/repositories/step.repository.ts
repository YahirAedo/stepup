import { prisma, Db } from '../config/prisma';

export class StepRepository {
  async findById(userId: string, id: string) {
    return prisma.step.findFirst({
      where: { id, task: { userId } },
    });
  }

  async create(data: {
    taskId: string;
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

  async findByTask(userId: string, taskId: string) {
    return prisma.step.findMany({
      where: { taskId, task: { userId } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async getMaxOrderIndex(userId: string, taskId: string) {
    const agg = await prisma.step.aggregate({
      where: { taskId, task: { userId } },
      _max: { orderIndex: true },
    });
    return agg._max.orderIndex ?? -1;
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; durationMin?: number | null },
    db: Db = prisma,
  ) {
    return db.step.update({
      where: { id, task: { userId } },
      data: { name: data.name, durationMin: data.durationMin },
    });
  }

  async delete(userId: string, id: string) {
    return prisma.step.delete({ where: { id, task: { userId } } });
  }

  async reorder(userId: string, taskId: string, orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.step.updateMany({
          where: { id, taskId, task: { userId } },
          data: { orderIndex: index },
        }),
      ),
    );
  }

  async completeStep(userId: string, id: string) {
    return prisma.step.update({
      where: { id, task: { userId } },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async findNextPending(userId: string, taskId: string) {
    return prisma.step.findFirst({
      where: { taskId, status: 'pending', task: { userId } },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async upsertDailyProgress(userId: string, dateStr: string) {
    return prisma.dailyProgress.upsert({
      where: { userId_date: { userId, date: dateStr } },
      update: { stepsCompleted: { increment: 1 } },
      create: { userId, date: dateStr, stepsCompleted: 1 },
    });
  }
}
