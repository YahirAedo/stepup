import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

export const app = createApp();

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE steps, tasks, daily_progress, users RESTART IDENTITY CASCADE',
  );
}

export async function registerUser(
  name = 'Test User',
  email = 'test@stepup.app',
  password = 'secret123',
) {
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  expect(res.status).toBe(201);
  return res.body as { user: { id: string; name: string; email: string }; token: string };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createTask(token: string, name = 'Tarea de prueba') {
  const res = await request(app).post('/api/tasks').set(authHeader(token)).send({ name });
  expect(res.status).toBe(201);
  return res.body as { id: string; name: string; status: string };
}

export async function addStep(token: string, taskId: string, name = 'Paso', durationMin?: number) {
  const res = await request(app)
    .post('/api/steps')
    .set(authHeader(token))
    .send({ taskId, name, durationMin });
  expect(res.status).toBe(201);
  return res.body as {
    id: string;
    taskId: string;
    name: string;
    orderIndex: number;
    status: string;
  };
}
