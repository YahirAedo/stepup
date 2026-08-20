import express from 'express';
import cors from 'cors';
import { taskRoutes } from './routes/task.routes';
import { stepRoutes } from './routes/step.routes';
import { progressRoutes } from './routes/progress.routes';
import { authRoutes } from './routes/auth.routes';
import { syncRoutes } from './routes/sync.routes';
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

  app.use(errorHandler);

  return app;
}
