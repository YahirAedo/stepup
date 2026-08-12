import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { requireIdempotencyKey } from '../middleware/idempotency';

const router = Router();
const taskController = new TaskController();

router.get('/', taskController.list);
router.get('/completed', taskController.completed);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.patch('/:id', requireIdempotencyKey, taskController.update);
router.patch('/:id/complete', requireIdempotencyKey, taskController.complete);
router.delete('/:id', taskController.remove);

export const taskRoutes = router;
