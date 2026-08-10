import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const syncController = new SyncController();

router.post('/push', requireAuth, syncController.push);
router.get('/pull', requireAuth, syncController.pull);
router.post('/migrate', syncController.migrate);

export const syncRoutes = router;
