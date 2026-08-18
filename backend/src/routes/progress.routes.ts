import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';

const router = Router();
const progressController = new ProgressController();

router.get('/', progressController.list);

export const progressRoutes = router;
