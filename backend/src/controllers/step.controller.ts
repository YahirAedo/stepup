import { Request, Response } from 'express';
import { StepService } from '../services/step.service';
import { IdempotencyService } from '../services/idempotency.service';
import { handleError } from '../utils/handle-error';

function parseId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class StepController {
  private stepService = new StepService();
  private idempotencyService = new IdempotencyService();

  list = async (req: Request, res: Response) => {
    try {
      const taskId = req.query.taskId;
      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ message: 'taskId es requerido' });
      }
      const steps = await this.stepService.getStepsByTask(req.userId!, taskId);
      return res.status(200).json(steps);
    } catch (error) {
      return handleError(res, error);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'POST',
          path: '/api/steps',
          body: req.body,
        },
        async () => {
          const step = await this.stepService.addStep(userId, req.body);
          return { statusCode: 201, responseBody: JSON.stringify(step) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const id = parseId(req.params.id);
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'PUT',
          path: `/api/steps/${id}`,
          body: req.body,
        },
        async (db) => {
          const step = await this.stepService.updateStep(userId, id, req.body, db);
          return { statusCode: 200, responseBody: JSON.stringify(step) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.stepService.deleteStep(req.userId!, parseId(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  };

  reorder = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'PUT',
          path: '/api/steps/reorder',
          body: req.body,
        },
        async () => {
          await this.stepService.reorder(userId, req.body);
          return { statusCode: 200, responseBody: JSON.stringify({ ok: true }) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const id = parseId(req.params.id);
      const result = await this.idempotencyService.runIdempotent(
        {
          userId,
          key: req.idempotencyKey,
          method: 'PATCH',
          path: `/api/steps/${id}/complete`,
          body: req.body,
        },
        async () => {
          const payload = await this.stepService.completeStep(userId, id, req.body);
          return { statusCode: 200, responseBody: JSON.stringify(payload) };
        },
      );
      return res.status(result.statusCode).type('json').send(result.responseBody);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
