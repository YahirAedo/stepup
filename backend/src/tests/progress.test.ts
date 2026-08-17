import request from 'supertest';
import { app, resetDb, registerUser, createTask, addStep, authHeader } from './helpers';

describe('API de progreso diario — métricas', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('GET /api/progress refleja los pasos completados hoy', async () => {
    const task = await createTask(token, 'Tarea');
    const step1 = await addStep(token, task.id, 'Paso 1');
    const step2 = await addStep(token, task.id, 'Paso 2');

    await request(app).patch(`/api/steps/${step1.id}/complete`).set(authHeader(token));
    await request(app).patch(`/api/steps/${step2.id}/complete`).set(authHeader(token));

    const res = await request(app).get('/api/progress').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    const today = new Date().toISOString().split('T')[0];
    expect(res.body[0].date).toBe(today);
    expect(res.body[0].stepsCompleted).toBe(2);
  });

  it('GET /api/progress devuelve vacío si no se completó ningún paso', async () => {
    const res = await request(app).get('/api/progress').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('completar una tarea sin pasos no incrementa el progreso diario', async () => {
    const task = await createTask(token, 'Tarea sin pasos');

    await request(app).patch(`/api/tasks/${task.id}/complete`).set(authHeader(token));

    const res = await request(app).get('/api/progress').set(authHeader(token));
    expect(res.body).toEqual([]);
  });

  it('completeStep acepta la fecha local del día enviada por el cliente', async () => {
    const task = await createTask(token, 'Tarea');
    const step = await addStep(token, task.id, 'Paso');

    const res = await request(app)
      .patch(`/api/steps/${step.id}/complete`)
      .set(authHeader(token))
      .send({ date: '2026-08-17' });

    expect(res.status).toBe(200);

    const progress = await request(app).get('/api/progress').set(authHeader(token));
    expect(progress.body).toEqual([
      { id: expect.any(Number), userId: expect.any(String), date: '2026-08-17', stepsCompleted: 1 },
    ]);
  });

  it('completeStep con fecha mal formada devuelve 400', async () => {
    const task = await createTask(token, 'Tarea');
    const step = await addStep(token, task.id, 'Paso');

    const res = await request(app)
      .patch(`/api/steps/${step.id}/complete`)
      .set(authHeader(token))
      .send({ date: '17-08-2026' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('La fecha debe tener formato YYYY-MM-DD');
  });
});
