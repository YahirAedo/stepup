import { Request, Response } from 'express';
import { ProgressService } from '../services/progress.service';
import { handleError } from '../utils/handle-error';

export class ProgressController {
  private progressService = new ProgressService();

  list = async (_req: Request, res: Response) => {
    try {
      const history = await this.progressService.getHistory();
      return res.status(200).json(history);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
