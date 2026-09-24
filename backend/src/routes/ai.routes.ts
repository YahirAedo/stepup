import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AiController();

router.post('/suggest-steps', aiController.suggestSteps);
router.post('/describe-help', aiController.describeHelp);

export const aiRoutes = router;
