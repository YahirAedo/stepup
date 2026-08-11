import { prisma } from '../config/prisma';

export class ProgressRepository {
  async findAll() {
    return prisma.dailyProgress.findMany({
      orderBy: { date: 'asc' },
    });
  }
}
