import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { createLoginLimiter, createRegisterLimiter } from '../config/rate-limits';

const router = Router();
const authController = new AuthController();

router.post('/register', createRegisterLimiter(), authController.register);
router.post('/login', createLoginLimiter(), authController.login);
router.get('/me', requireAuth, authController.me);

export const authRoutes = router;
