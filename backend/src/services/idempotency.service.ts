import { createHash } from 'crypto';
import { prisma, Db } from '../config/prisma';
import { IdempotencyRepository } from '../repositories/idempotency.repository';

export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export class IdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency-Key reutilizada con un payload distinto');
    this.name = 'IdempotencyConflictError';
  }
}

export class IdempotencyNotReadyError extends Error {
  constructor() {
    super('Idempotency-Key en proceso de resolucion; reintente');
    this.name = 'IdempotencyNotReadyError';
  }
}

export interface IdempotencyContext {
  userId: string;
  key?: string;
  method: string;
  path: string;
  body: unknown;
}

export interface OperationResult {
  statusCode: number;
  responseBody: string;
}

export type IdempotentOperation = (db: Db) => Promise<OperationResult>;

export class IdempotencyService {
  private repo = new IdempotencyRepository();

  hashRequest(method: string, path: string, body: unknown): string {
    const normalized = JSON.stringify(body ?? {});
    return createHash('sha256').update(`${method}:${path}:${normalized}`).digest('hex');
  }

  async runIdempotent(ctx: IdempotencyContext, operation: IdempotentOperation): Promise<OperationResult> {
    if (!ctx.key || ctx.method === 'GET' || ctx.method === 'DELETE') {
      return operation(prisma);
    }

    const key = ctx.key;
    await this.repo.deleteIfExpired(ctx.userId, key);
    const requestHash = this.hashRequest(ctx.method, ctx.path, ctx.body);
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);

    const won = await this.repo.tryReserve(ctx.userId, key, {
      requestHash,
      method: ctx.method,
      path: ctx.path,
      expiresAt,
    });

    if (won) {
      try {
        return await prisma.$transaction(async (tx) => {
          const result = await operation(tx);
          await this.repo.storeResult(tx, ctx.userId, key, {
            statusCode: result.statusCode,
            responseBody: result.responseBody,
          });
          return result;
        });
      } catch (error) {
        await this.repo.deleteByKey(ctx.userId, key);
        throw error;
      }
    }

    return this.replayOrConflict(ctx.userId, key, requestHash);
  }

  private async replayOrConflict(userId: string, key: string, requestHash: string): Promise<OperationResult> {
    const record = await this.repo.findByKey(userId, key);
    if (!record) {
      throw new Error('IDEMPOTENCY_RECORD_MISSING');
    }

    if (record.statusCode === 0) {
      return this.waitForResult(userId, key);
    }

    if (record.requestHash !== requestHash) {
      throw new IdempotencyConflictError();
    }

    return { statusCode: record.statusCode, responseBody: record.responseBody };
  }

  private async waitForResult(userId: string, key: string): Promise<OperationResult> {
    for (let i = 0; i < 40; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      const record = await this.repo.findByKey(userId, key);
      if (!record) {
        throw new Error('IDEMPOTENCY_RECORD_MISSING');
      }
      if (record.statusCode !== 0) {
        return { statusCode: record.statusCode, responseBody: record.responseBody };
      }
    }
    throw new IdempotencyNotReadyError();
  }

  async cleanupExpired(): Promise<number> {
    return this.repo.deleteExpired();
  }
}
