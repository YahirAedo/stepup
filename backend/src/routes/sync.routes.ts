import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { SyncController } from '../controllers/sync.controller';
import { requireAuth } from '../middleware/auth';
import { requireIdempotencyKey } from '../middleware/idempotency';

const router = Router();
const syncController = new SyncController();

const migrateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (process.env.NODE_ENV === 'test' ? 100 : 2),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas migraciones. Intentá nuevamente en un minuto.' },
});

router.post('/push', requireAuth, requireIdempotencyKey, syncController.push);
router.get('/pull', requireAuth, syncController.pull);
router.post('/migrate', migrateLimiter, requireIdempotencyKey, syncController.migrate);

export const syncRoutes = router;
