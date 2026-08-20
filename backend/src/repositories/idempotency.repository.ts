import { prisma, Db } from '../config/prisma';

export interface IdempotencyRecordInput {
  requestHash: string;
  method: string;
  path: string;
  expiresAt: Date;
}

export interface StoredResult {
  statusCode: number;
  responseBody: string;
}

export class IdempotencyRepository {
  async findByKey(userId: string, key: string) {
    return prisma.idempotencyKey.findUnique({
      where: { userId_key: { userId, key } },
    });
  }

  async tryReserve(userId: string, key: string, data: IdempotencyRecordInput): Promise<boolean> {
    // Lease: liberar reservas huérfanas (status_code=0 y más viejas que la ventana),
    // p. ej. procesos que murieron entre tryReserve y storeResult.
    await prisma.$executeRaw`
      DELETE FROM "idempotency_keys"
      WHERE "user_id" = ${userId}
        AND "key" = ${key}
        AND "status_code" = 0
        AND "created_at" < CURRENT_TIMESTAMP - INTERVAL '30 seconds'
    `;

    const result = await prisma.$executeRaw`
      INSERT INTO "idempotency_keys"
        ("user_id", "key", "request_hash", "method", "path", "status_code", "response_body", "created_at", "expires_at")
      VALUES
        (${userId}, ${key}, ${data.requestHash}, ${data.method}, ${data.path}, 0, '', CURRENT_TIMESTAMP, ${data.expiresAt})
      ON CONFLICT ("user_id", "key") DO NOTHING
    `;
    return result === 1;
  }

  async storeResult(db: Db, userId: string, key: string, result: StoredResult) {
    await db.idempotencyKey.update({
      where: { userId_key: { userId, key } },
      data: { statusCode: result.statusCode, responseBody: result.responseBody },
    });
  }

  async deleteByKey(userId: string, key: string) {
    await prisma.idempotencyKey.deleteMany({ where: { userId, key } });
  }

  async deleteIfExpired(userId: string, key: string): Promise<boolean> {
    const result = await prisma.idempotencyKey.deleteMany({
      where: { userId, key, expiresAt: { lt: new Date() } },
    });
    return result.count > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
