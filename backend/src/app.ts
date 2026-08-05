import express from 'express';
import cors from 'cors';
import { taskRoutes } from './routes/task.routes';
import { stepRoutes } from './routes/step.routes';
import { progressRoutes } from './routes/progress.routes';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/tasks', taskRoutes);
  app.use('/api/steps', stepRoutes);
  app.use('/api/progress', progressRoutes);

  return app;
}
