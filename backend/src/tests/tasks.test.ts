import request from 'supertest';
import { app, resetDb, createTask, addStep } from './helpers';

describe('API de tareas — invariante de negocio', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('POST /api/tasks crea una tarea activa (201)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ name: 'Proyecto Final', dueDate: '2026-08-10T00:00:00.000Z' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Proyecto Final');
    expect(res.body.status).toBe('active');
    expect(res.body.dueDate).toBe('2026-08-10T00:00:00.000Z');
  });

  it('POST /api/tasks con body inválido devuelve 400 (zod)', async () => {
    const res = await request(app).post('/api/tasks').send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El nombre es obligatorio');
  });

  it('GET /api/tasks devuelve las tareas activas con pasos ordenados', async () => {
    const task = await createTask('Estudiar Álgebra');
    await addStep(task.id, 'Repasar vectores');
    await addStep(task.id, 'Resolver matrices');

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].steps.map((s: { name: string }) => s.name)).toEqual([
      'Repasar vectores',
      'Resolver matrices',
    ]);
  });

  it('PATCH /api/tasks/:id/complete devuelve 409 si quedan pasos pendientes', async () => {
    const task = await createTask('Preparar presentación');
    await addStep(task.id, 'Diseñar esquema');

    const res = await request(app).patch(`/api/tasks/${task.id}/complete`);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('No se puede completar una tarea con pasos pendientes');
  });

  it('PATCH /api/tasks/:id/complete devuelve 200 cuando no quedan pasos', async () => {
    const task = await createTask('Tarea sin pasos');

    const res = await request(app).patch(`/api/tasks/${task.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.completedAt).not.toBeNull();
  });

  it('PATCH /api/tasks/:id/complete sobre tarea inexistente devuelve 404', async () => {
    const res = await request(app).patch('/api/tasks/999/complete');

    expect(res.status).toBe(404);
  });

  it('PATCH /api/tasks/:id actualiza los campos enviados', async () => {
    const task = await createTask('Nombre original');

    const res = await request(app).patch(`/api/tasks/${task.id}`).send({ name: 'Renombrada' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Renombrada');
  });

  it('DELETE /api/tasks/:id elimina la tarea y sus pasos en cascada (204)', async () => {
    const task = await createTask('Eliminar');
    await addStep(task.id, 'Paso en cascada');

    const res = await request(app).delete(`/api/tasks/${task.id}`);

    expect(res.status).toBe(204);

    const taskDb = await fetchTask(task.id);
    const stepsDb = await fetchSteps(task.id);
    expect(taskDb).toBeNull();
    expect(stepsDb).toEqual([]);
  });

  it('GET /api/tasks/completed devuelve solo las completadas', async () => {
    const done = await createTask('Terminada');
    await request(app).patch(`/api/tasks/${done.id}/complete`);
    await createTask('Pendiente');

    const res = await request(app).get('/api/tasks/completed');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Terminada');
  });
});

async function fetchTask(id: number) {
  const res = await request(app).get(`/api/tasks/${id}`);
  return res.status === 404 ? null : res.body;
}

async function fetchSteps(taskId: number) {
  const res = await request(app).get(`/api/steps?taskId=${taskId}`);
  return res.body;
}
