import request from 'supertest';
import { app, resetDb, registerUser, createTask, addStep, authHeader } from './helpers';

describe('API de tareas — invariante de negocio', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('POST /api/tasks crea una tarea activa (201)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({ name: 'Proyecto Final', dueDate: '2026-08-10T00:00:00.000Z' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Proyecto Final');
    expect(res.body.status).toBe('active');
    expect(res.body.dueDate).toBe('2026-08-10T00:00:00.000Z');
  });

  it('POST /api/tasks con dueDate inválida devuelve 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .send({ name: 'Con fecha rota', dueDate: 'not-a-date' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Debe ser un timestamp ISO válido');
  });

  it('POST /api/tasks con body inválido devuelve 400 (zod)', async () => {
    const res = await request(app).post('/api/tasks').set(authHeader(token)).send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El nombre es obligatorio');
  });

  it('GET /api/tasks devuelve las tareas activas con pasos ordenados', async () => {
    const task = await createTask(token, 'Estudiar Álgebra');
    await addStep(token, task.id, 'Repasar vectores');
    await addStep(token, task.id, 'Resolver matrices');

    const res = await request(app).get('/api/tasks').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].steps.map((s: { name: string }) => s.name)).toEqual([
      'Repasar vectores',
      'Resolver matrices',
    ]);
  });

  it('PATCH /api/tasks/:id/complete devuelve 409 si quedan pasos pendientes', async () => {
    const task = await createTask(token, 'Preparar presentación');
    await addStep(token, task.id, 'Diseñar esquema');

    const res = await request(app).patch(`/api/tasks/${task.id}/complete`).set(authHeader(token));

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('No se puede completar una tarea con pasos pendientes');
  });

  it('PATCH /api/tasks/:id/complete devuelve 200 cuando no quedan pasos', async () => {
    const task = await createTask(token, 'Tarea sin pasos');

    const res = await request(app).patch(`/api/tasks/${task.id}/complete`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.completedAt).not.toBeNull();
  });

  it('PATCH /api/tasks/:id/complete sobre tarea inexistente devuelve 404', async () => {
    const res = await request(app).patch('/api/tasks/999/complete').set(authHeader(token));

    expect(res.status).toBe(404);
  });

  it('PATCH /api/tasks/:id actualiza los campos enviados', async () => {
    const task = await createTask(token, 'Nombre original');

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .send({ name: 'Renombrada' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renombrada');
  });

  it('DELETE /api/tasks/:id elimina la tarea y sus pasos en cascada (204)', async () => {
    const task = await createTask(token, 'Eliminar');
    await addStep(token, task.id, 'Paso en cascada');

    const res = await request(app).delete(`/api/tasks/${task.id}`).set(authHeader(token));

    expect(res.status).toBe(204);

    const taskDb = await fetchTask(token, task.id);
    const stepsDb = await fetchSteps(token, task.id);
    expect(taskDb).toBeNull();
    expect(stepsDb).toEqual([]);
  });

  it('GET /api/tasks/completed devuelve solo las completadas', async () => {
    const done = await createTask(token, 'Terminada');
    await request(app).patch(`/api/tasks/${done.id}/complete`).set(authHeader(token));
    await createTask(token, 'Pendiente');

    const res = await request(app).get('/api/tasks/completed').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Terminada');
  });
});

async function fetchTask(token: string, id: string) {
  const res = await request(app).get(`/api/tasks/${id}`).set(authHeader(token));
  return res.status === 404 ? null : res.body;
}

async function fetchSteps(token: string, taskId: string) {
  const res = await request(app).get(`/api/steps?taskId=${taskId}`).set(authHeader(token));
  return res.body;
}
