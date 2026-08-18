import { prisma } from '../config/prisma';

export class ProgressRepository {
  async findAll(userId: string) {
    return prisma.dailyProgress.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }
}
