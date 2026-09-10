import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { taskRoutes } from './routes/task.routes';
import { stepRoutes } from './routes/step.routes';
import { progressRoutes } from './routes/progress.routes';
import { authRoutes } from './routes/auth.routes';
import { syncRoutes } from './routes/sync.routes';
import { aiRoutes } from './routes/ai.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', requireAuth, taskRoutes);
  app.use('/api/steps', requireAuth, stepRoutes);
  app.use('/api/progress', requireAuth, progressRoutes);
  app.use('/api/sync', syncRoutes);

  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Demasiadas solicitudes de IA. Intentá nuevamente en un minuto.' },
  });
  app.use('/api/ai', aiLimiter, requireAuth, aiRoutes);

  app.use(errorHandler);

  return app;
}
