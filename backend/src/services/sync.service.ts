import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { syncPushSchema, syncMigrateSchema } from '../validations/schemas';

function parseOptionalDate(value?: string | null): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(value);
}

function serializeTask(task: {
  id: string;
  name: string;
  dueDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: task.id,
    name: task.name,
    dueDate: task.dueDate?.toISOString() ?? null,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

function serializeStep(step: {
  id: string;
  taskId: string;
  name: string;
  durationMin: number | null;
  orderIndex: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}) {
  return {
    id: step.id,
    taskId: step.taskId,
    name: step.name,
    durationMin: step.durationMin,
    orderIndex: step.orderIndex,
    status: step.status,
    createdAt: step.createdAt.toISOString(),
    updatedAt: step.updatedAt.toISOString(),
    completedAt: step.completedAt?.toISOString() ?? null,
  };
}

export class SyncService {
  async push(userId: string, input: unknown) {
    const data = syncPushSchema.parse(input);

    return prisma.$transaction(async (tx) => {
      const taskIdByLocal = new Map<number, string>();
      const tasks: Array<{ id: string; applied: boolean; localId?: number }> = [];

      for (const task of data.tasks) {
        const result = await this.upsertTask(tx, userId, task);
        tasks.push(result);
        if (task.localId) {
          taskIdByLocal.set(task.localId, result.id);
        }
      }

      const steps: Array<{ id: string; applied: boolean; localId?: number }> = [];
      for (const step of data.steps) {
        const targetTaskId = await this.resolveTaskId(tx, userId, step.taskId, step.taskLocalId, taskIdByLocal);
        steps.push(await this.upsertStep(tx, userId, { ...step, taskId: targetTaskId }));
      }

      return { tasks, steps };
    });
  }

  async pull(userId: string, sinceRaw?: string) {
    const since = sinceRaw ? new Date(sinceRaw) : new Date(0);
    if (Number.isNaN(since.getTime())) {
      throw new Error('INVALID_SINCE');
    }

    const [tasks, steps] = await Promise.all([
      prisma.task.findMany({
        where: { userId, updatedAt: { gt: since } },
        orderBy: { updatedAt: 'asc' },
      }),
      prisma.step.findMany({
        where: { task: { userId }, updatedAt: { gt: since } },
        orderBy: { updatedAt: 'asc' },
      }),
    ]);

    return { tasks: tasks.map(serializeTask), steps: steps.map(serializeStep) };
  }

  async migrate(input: unknown) {
    const data = syncMigrateSchema.parse(input);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const password = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: data.name, email, password } });

      const taskMap: Record<string, string> = {};
      const taskIdByLocal = new Map<number, string>();

      for (const task of data.tasks) {
        const created = await tx.task.create({
          data: {
            id: task.id ?? undefined,
            userId: user.id,
            name: task.name,
            dueDate: parseOptionalDate(task.dueDate),
            status: task.status ?? 'active',
            createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
            updatedAt: new Date(task.updatedAt),
            completedAt: parseOptionalDate(task.completedAt),
          },
        });
        taskMap[task.localId] = created.id;
        taskIdByLocal.set(task.localId, created.id);
      }

      const stepMap: Record<string, string> = {};
      for (const step of data.steps) {
        const targetTaskId =
          (step.taskId && (await this.ownsTask(tx, step.taskId, user.id)) && step.taskId) ||
          taskIdByLocal.get(step.taskLocalId);
        if (!targetTaskId) {
          throw new Error('TASK_NOT_FOUND');
        }
        const created = await tx.step.create({
          data: {
            id: step.id ?? undefined,
            taskId: targetTaskId,
            name: step.name,
            durationMin: step.durationMin ?? null,
            orderIndex: step.orderIndex,
            status: step.status ?? 'pending',
            createdAt: step.createdAt ? new Date(step.createdAt) : undefined,
            updatedAt: new Date(step.updatedAt),
            completedAt: parseOptionalDate(step.completedAt),
          },
        });
        stepMap[step.localId] = created.id;
      }

      return {
        user: { id: user.id, name: user.name, email: user.email },
        token: signToken(user.id),
        taskMap,
        stepMap,
      };
    });
  }

  private async ownsTask(tx: Prisma.TransactionClient, taskId: string, userId: string) {
    const task = await tx.task.findUnique({ where: { id: taskId }, select: { userId: true } });
    return task !== null && task.userId === userId;
  }

  private async resolveTaskId(
    tx: Prisma.TransactionClient,
    userId: string,
    taskId?: string,
    taskLocalId?: number,
    taskIdByLocal?: Map<number, string>,
  ) {
    if (taskId && (await this.ownsTask(tx, taskId, userId))) {
      return taskId;
    }
    if (taskLocalId !== undefined && taskIdByLocal?.has(taskLocalId)) {
      return taskIdByLocal.get(taskLocalId)!;
    }
    throw new Error('TASK_NOT_FOUND');
  }

  private async upsertTask(
    tx: Prisma.TransactionClient,
    userId: string,
    task: {
      id?: string;
      localId?: number;
      name: string;
      dueDate?: string | null;
      status?: 'active' | 'completed';
      createdAt?: string;
      updatedAt: string;
      completedAt?: string | null;
    },
  ) {
    if (task.id) {
      const existing = await tx.task.findUnique({ where: { id: task.id } });
      if (existing) {
        if (existing.userId !== userId) {
          throw new Error('RECORD_BELONGS_TO_OTHER_USER');
        }
        if (new Date(task.updatedAt).getTime() > existing.updatedAt.getTime()) {
          const updated = await tx.task.update({
            where: { id: task.id },
            data: {
              name: task.name,
              dueDate: parseOptionalDate(task.dueDate),
              status: task.status,
              completedAt: parseOptionalDate(task.completedAt),
            },
          });
          return { id: updated.id, applied: true, localId: task.localId };
        }
        return { id: existing.id, applied: false, localId: task.localId };
      }
    }

    const created = await tx.task.create({
      data: {
        id: task.id ?? undefined,
        userId,
        name: task.name,
        dueDate: parseOptionalDate(task.dueDate),
        status: task.status ?? 'active',
        createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
        updatedAt: new Date(task.updatedAt),
        completedAt: parseOptionalDate(task.completedAt),
      },
    });
    return { id: created.id, applied: true, localId: task.localId };
  }

  private async upsertStep(
    tx: Prisma.TransactionClient,
    userId: string,
    step: {
      id?: string;
      localId?: number;
      taskId: string;
      name: string;
      durationMin?: number | null;
      orderIndex: number;
      status?: 'pending' | 'completed';
      createdAt?: string;
      updatedAt: string;
      completedAt?: string | null;
    },
  ) {
    if (step.id) {
      const existing = await tx.step.findUnique({
        where: { id: step.id },
        include: { task: { select: { userId: true } } },
      });
      if (existing) {
        if (existing.task.userId !== userId) {
          throw new Error('RECORD_BELONGS_TO_OTHER_USER');
        }
        if (new Date(step.updatedAt).getTime() > existing.updatedAt.getTime()) {
          const updated = await tx.step.update({
            where: { id: step.id },
            data: {
              taskId: step.taskId,
              name: step.name,
              durationMin: step.durationMin ?? null,
              orderIndex: step.orderIndex,
              status: step.status,
              completedAt: parseOptionalDate(step.completedAt),
            },
          });
          return { id: updated.id, applied: true, localId: step.localId };
        }
        return { id: existing.id, applied: false, localId: step.localId };
      }
    }

    const created = await tx.step.create({
      data: {
        id: step.id ?? undefined,
        taskId: step.taskId,
        name: step.name,
        durationMin: step.durationMin ?? null,
        orderIndex: step.orderIndex,
        status: step.status ?? 'pending',
        createdAt: step.createdAt ? new Date(step.createdAt) : undefined,
        updatedAt: new Date(step.updatedAt),
        completedAt: parseOptionalDate(step.completedAt),
      },
    });
    return { id: created.id, applied: true, localId: step.localId };
  }
}
