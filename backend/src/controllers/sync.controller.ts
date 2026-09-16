import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { IdempotencyService } from '../services/idempotency.service';
import { handleError } from '../utils/handle-error';
import { syncMigrateSchema } from '../validations/schemas';

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
      const data = syncMigrateSchema.parse(req.body);
      const email = data.email.trim().toLowerCase();

      const requestHash = this.syncService.hashRequest(data);
      const replay = await this.syncService.getMigrateReplay(email, data.password, requestHash);

      if (replay) {
        return res.status(201).json(replay);
      }

      const payload = await this.syncService.migrate(data);
      return res.status(201).json(payload);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
