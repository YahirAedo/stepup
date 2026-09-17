import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';
import { describeHelpSchema, suggestStepsSchema } from '../validations/schemas';
import { handleError } from '../utils/handle-error';

export class AiController {
  private aiService = new AIService();

  suggestSteps = async (req: Request, res: Response) => {
    try {
      const input = suggestStepsSchema.parse(req.body ?? {});
      const steps = await this.aiService.suggestSteps(input.taskName, input.description);
      return res.status(200).json({ steps });
    } catch (error) {
      return handleError(res, error);
    }
  };

  describeHelp = async (req: Request, res: Response) => {
    try {
      const input = describeHelpSchema.parse(req.body ?? {});
      const sections = await this.aiService.describeHelp(input.taskName);
      return res.status(200).json({ sections });
    } catch (error) {
      return handleError(res, error);
    }
  };
}
