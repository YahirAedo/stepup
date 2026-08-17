import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireIdempotencyKey } from '../middleware/idempotency';

const router = Router();
const taskController = new TaskController();

router.get('/', taskController.list);
router.get('/completed', taskController.completed);
router.get('/:id', taskController.getById);
router.post('/', requireIdempotencyKey, taskController.create);
router.put('/:id', requireIdempotencyKey, taskController.update);
router.patch('/:id/complete', requireIdempotencyKey, taskController.complete);
router.delete('/:id', taskController.remove);
router.get('/:taskId/steps', taskController.listSteps);
router.post('/:taskId/steps', requireIdempotencyKey, taskController.createStep);

export const taskRoutes = router;
