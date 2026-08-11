import { Router } from 'express';
import { StepController } from '../controllers/step.controller';

const router = Router();
const stepController = new StepController();

router.get('/', stepController.list);
router.post('/', stepController.create);
router.put('/reorder', stepController.reorder);
router.patch('/:id', stepController.update);
router.patch('/:id/complete', stepController.complete);
router.delete('/:id', stepController.remove);

export const stepRoutes = router;
