import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { IdempotencyService } from '../services/idempotency.service';
import { prisma } from '../config/prisma';
import { handleError } from '../utils/handle-error';

export const MIGRATE_IDEMPOTENCY_SCOPE = '00000000-0000-4000-8000-000000000001';
const MIGRATE_SCOPE_EMAIL = 'idempotency-migrate@internal.stepup';

async function ensureMigrateScopeUser(): Promise<string> {
  await prisma.user.upsert({
    where: { email: MIGRATE_SCOPE_EMAIL },
    create: {
      id: MIGRATE_IDEMPOTENCY_SCOPE,
      name: 'Idempotency Scope',
      email: MIGRATE_SCOPE_EMAIL,
      password: '!',
    },
    update: {},
  });
  return MIGRATE_IDEMPOTENCY_SCOPE;
}

export class SyncController {
  private syncService = new SyncService();
  private idempotencyService = new IdempotencyService();

  push = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'POST',
          path: '/api/sync/push',
          body: req.body,
        },
        async () => {
          const payload = await this.syncService.push(userId, req.body);
          return { statusCode: 200, responseBody: JSON.stringify(payload) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };

  pull = async (req: Request, res: Response) => {
    try {
      const since = typeof req.query.since === 'string' ? req.query.since : undefined;
      const result = await this.syncService.pull(req.userId!, since);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };

  migrate = async (req: Request, res: Response) => {
    try {
      const scopeUserId = await ensureMigrateScopeUser();
      const result = await this.idempotencyService.runIdempotent(
        {
          userId: scopeUserId,
          key: req.idempotencyKey,
          method: 'POST',
          path: '/api/sync/migrate',
          body: req.body,
        },
        async () => {
          const payload = await this.syncService.migrate(req.body);
          return { statusCode: 201, responseBody: JSON.stringify(payload) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
