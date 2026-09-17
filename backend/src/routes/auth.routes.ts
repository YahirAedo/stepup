import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (process.env.NODE_ENV === 'test' ? 100 : 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de login. Intentá nuevamente en un minuto.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (process.env.NODE_ENV === 'test' ? 100 : 3),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados registros. Intentá nuevamente en un minuto.' },
});

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/me', requireAuth, authController.me);

export const authRoutes = router;
