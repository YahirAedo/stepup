import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { requireAuth } from '../middleware/auth';
import { requireIdempotencyKey } from '../middleware/idempotency';

const router = Router();
const syncController = new SyncController();

router.post('/push', requireAuth, requireIdempotencyKey, syncController.push);
router.get('/pull', requireAuth, syncController.pull);
router.post('/migrate', requireIdempotencyKey, syncController.migrate);

export const syncRoutes = router;
