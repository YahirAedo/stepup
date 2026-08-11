import { Request, Response } from 'express';
import { StepService } from '../services/step.service';
import { handleError } from '../utils/handle-error';

export class StepController {
  private stepService = new StepService();

  list = async (req: Request, res: Response) => {
    try {
      const taskId = Number(req.query.taskId);
      if (!taskId || Number.isNaN(taskId)) {
        return res.status(400).json({ message: 'taskId es requerido' });
      }
      const steps = await this.stepService.getStepsByTask(taskId);
      return res.status(200).json(steps);
    } catch (error) {
      return handleError(res, error);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const step = await this.stepService.addStep(req.body);
      return res.status(201).json(step);
    } catch (error) {
      return handleError(res, error);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const step = await this.stepService.updateStep(Number(req.params.id), req.body);
      return res.status(200).json(step);
    } catch (error) {
      return handleError(res, error);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      await this.stepService.deleteStep(Number(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error);
    }
  };

  reorder = async (req: Request, res: Response) => {
    try {
      await this.stepService.reorder(req.body);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return handleError(res, error);
    }
  };

  complete = async (req: Request, res: Response) => {
    try {
      const stepId = Number(req.params.id);
      const result = await this.stepService.completeStep(stepId);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  };
}
