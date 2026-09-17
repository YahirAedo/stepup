import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { taskRoutes } from './routes/task.routes';
import { stepRoutes } from './routes/step.routes';
import { progressRoutes } from './routes/progress.routes';
import { authRoutes } from './routes/auth.routes';
import { syncRoutes } from './routes/sync.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';

const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:19006,exp://localhost:8081')
  .split(',')
  .map((origin) => origin.trim());

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || CORS_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    }),
  );
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
