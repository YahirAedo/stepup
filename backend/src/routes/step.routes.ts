import { Router } from 'express';
import { StepController } from '../controllers/step.controller';
import { requireIdempotencyKey } from '../middleware/idempotency';

const router = Router();
const stepController = new StepController();

router.get('/', stepController.list);
router.post('/', requireIdempotencyKey, stepController.create);
router.put('/reorder', requireIdempotencyKey, stepController.reorder);
router.patch('/:id', requireIdempotencyKey, stepController.update);
router.patch('/:id/complete', requireIdempotencyKey, stepController.complete);
router.delete('/:id', stepController.remove);

export const stepRoutes = router;
