import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import { handleError } from '../utils/handle-error';

export class SyncController {
  private syncService = new SyncService();

  push = async (req: Request, res: Response) => {
    try {
      const result = await this.syncService.push(req.userId!, req.body);
      return res.status(200).json(result);
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
      const result = await this.syncService.migrate(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
