import { prisma } from '../config/prisma';

export class TaskRepository {
  async create(data: { name: string; dueDate?: Date | null }) {
    return prisma.task.create({
      data: { name: data.name, dueDate: data.dueDate ?? null },
    });
  }

  async findById(id: number) {
    return prisma.task.findUnique({
      where: { id },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async findAllActive() {
    return prisma.task.findMany({
      where: { status: 'active' },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCompleted() {
    return prisma.task.findMany({
      where: { status: 'completed' },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { completedAt: 'desc' },
    });
  }

  async update(id: number, data: { name?: string; dueDate?: Date | null }) {
    return prisma.task.update({
      where: { id },
      data: { name: data.name, dueDate: data.dueDate },
    });
  }

  async delete(id: number) {
    return prisma.task.delete({ where: { id } });
  }

  async findPendingStepsCount(taskId: number) {
    return prisma.step.count({
      where: { taskId, status: 'pending' },
    });
  }

  async completeTask(id: number) {
    return prisma.task.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }
}
