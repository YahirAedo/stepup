import { prisma, Db } from '../config/prisma';

export class TaskRepository {
  async create(userId: string, data: { name: string; dueDate?: Date | null }) {
    return prisma.task.create({
      data: { userId, name: data.name, dueDate: data.dueDate ?? null },
    });
  }

  async findById(userId: string, id: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async findAllActive(userId: string) {
    return prisma.task.findMany({
      where: { userId, status: 'active' },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCompleted(userId: string) {
    return prisma.task.findMany({
      where: { userId, status: 'completed' },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { completedAt: 'desc' },
    });
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; dueDate?: Date | null },
    db: Db = prisma,
  ) {
    return db.task.update({
      where: { id, userId },
      data: { name: data.name, dueDate: data.dueDate },
    });
  }

  async delete(userId: string, id: string) {
    return prisma.task.delete({ where: { id, userId } });
  }

  async findPendingStepsCount(userId: string, taskId: string) {
    return prisma.step.count({
      where: { taskId, status: 'pending', task: { userId } },
    });
  }

  async completeTask(userId: string, id: string) {
    return prisma.task.update({
      where: { id, userId },
      data: { status: 'completed', completedAt: new Date() },
    });
  }
}
