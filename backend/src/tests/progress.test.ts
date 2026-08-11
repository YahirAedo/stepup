import request from 'supertest';
import { app, resetDb, createTask, addStep } from './helpers';

describe('API de progreso diario — métricas', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('GET /api/progress refleja los pasos completados hoy', async () => {
    const task = await createTask('Tarea');
    const step1 = await addStep(task.id, 'Paso 1');
    const step2 = await addStep(task.id, 'Paso 2');

    await request(app).patch(`/api/steps/${step1.id}/complete`);
    await request(app).patch(`/api/steps/${step2.id}/complete`);

    const res = await request(app).get('/api/progress');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const today = new Date().toISOString().split('T')[0];
    expect(res.body[0].date).toBe(today);
    expect(res.body[0].stepsCompleted).toBe(2);
  });

  it('GET /api/progress devuelve vacío si no se completó ningún paso', async () => {
    const res = await request(app).get('/api/progress');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('completar una tarea sin pasos no incrementa el progreso diario', async () => {
    const task = await createTask('Tarea sin pasos');

    await request(app).patch(`/api/tasks/${task.id}/complete`);

    const res = await request(app).get('/api/progress');
    expect(res.body).toEqual([]);
  });
});
