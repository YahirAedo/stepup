import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/prisma';

export const app = createApp();

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE steps, tasks, daily_progress RESTART IDENTITY CASCADE',
  );
}

export async function createTask(name = 'Tarea de prueba') {
  const res = await request(app).post('/api/tasks').send({ name });
  expect(res.status).toBe(201);
  return res.body as { id: number; name: string; status: string };
}

export async function addStep(taskId: number, name = 'Paso', durationMin?: number) {
  const res = await request(app).post('/api/steps').send({ taskId, name, durationMin });
  expect(res.status).toBe(201);
  return res.body as {
    id: number;
    taskId: number;
    name: string;
    orderIndex: number;
    status: string;
  };
}
