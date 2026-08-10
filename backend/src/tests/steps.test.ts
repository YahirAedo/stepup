import request from 'supertest';
import { app, resetDb, registerUser, createTask, addStep, authHeader } from './helpers';

describe('API de pasos — ejecución y orden', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('POST /api/steps asigna orderIndex automático (max + 1)', async () => {
    const task = await createTask(token, 'Tarea con pasos');

    const step1 = await addStep(token, task.id, 'Primero');
    const step2 = await addStep(token, task.id, 'Segundo');

    expect(step1.orderIndex).toBe(0);
    expect(step2.orderIndex).toBe(1);
  });

  it('GET /api/steps?taskId=N devuelve los pasos en orden', async () => {
    const task = await createTask(token, 'Tarea');
    await addStep(token, task.id, 'A');
    await addStep(token, task.id, 'B');
    await addStep(token, task.id, 'C');

    const res = await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.map((s: { name: string }) => s.name)).toEqual(['A', 'B', 'C']);
  });

  it('PATCH /api/steps/:id/complete devuelve el nextStep y no cierra la tarea', async () => {
    const task = await createTask(token, 'Migrar backend');
    await addStep(token, task.id, 'Configurar Prisma');
    await addStep(token, task.id, 'Crear endpoints');

    const step1 = (
      await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token))
    ).body[0];
    const res = await request(app).patch(`/api/steps/${step1.id}/complete`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.taskCompleted).toBe(false);
    expect(res.body.nextStep.name).toBe('Crear endpoints');
    expect(res.body.nextStep.status).toBe('pending');
  });

  it('completar el último paso auto-finaliza la tarea', async () => {
    const task = await createTask(token, 'Tarea corta');
    const step = await addStep(token, task.id, 'Único paso');

    const res = await request(app).patch(`/api/steps/${step.id}/complete`).set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.nextStep).toBeNull();
    expect(res.body.taskCompleted).toBe(true);

    const taskRes = await request(app).get(`/api/tasks/${task.id}`).set(authHeader(token));
    expect(taskRes.body.status).toBe('completed');
  });

  it('reintentar completar un paso ya completado devuelve 400', async () => {
    const task = await createTask(token, 'Tarea');
    const step = await addStep(token, task.id, 'Paso');

    await request(app).patch(`/api/steps/${step.id}/complete`).set(authHeader(token));
    const res = await request(app).patch(`/api/steps/${step.id}/complete`).set(authHeader(token));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El paso ya se encuentra completado');
  });

  it('completar un paso inexistente devuelve 404', async () => {
    const res = await request(app).patch('/api/steps/999/complete').set(authHeader(token));

    expect(res.status).toBe(404);
  });

  it('PUT /api/steps/reorder reordena los pasos', async () => {
    const task = await createTask(token, 'Tarea');
    const stepA = await addStep(token, task.id, 'A');
    const stepB = await addStep(token, task.id, 'B');

    const res = await request(app)
      .put('/api/steps/reorder')
      .set(authHeader(token))
      .send({ taskId: task.id, orderedIds: [stepB.id, stepA.id] });

    expect(res.status).toBe(200);

    const steps = (
      await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token))
    ).body;
    expect(steps[0].name).toBe('B');
    expect(steps[0].orderIndex).toBe(0);
    expect(steps[1].name).toBe('A');
    expect(steps[1].orderIndex).toBe(1);
  });

  it('DELETE /api/steps/:id elimina el paso y reindexa los restantes', async () => {
    const task = await createTask(token, 'Tarea');
    const stepA = await addStep(token, task.id, 'A');
    await addStep(token, task.id, 'B');
    const stepC = await addStep(token, task.id, 'C');

    const res = await request(app).delete(`/api/steps/${stepA.id}`).set(authHeader(token));

    expect(res.status).toBe(204);

    const steps = (
      await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token))
    ).body;
    expect(steps.map((s: { name: string }) => s.name)).toEqual(['B', 'C']);
    expect(steps[0].orderIndex).toBe(0);
    expect(steps[1].orderIndex).toBe(1);
    expect(steps[1].id).toBe(stepC.id);
  });

  it('un paso de otro usuario no puede editarse, completarse ni borrarse (404)', async () => {
    const other = await registerUser('Otro', 'otro-step@stepup.app');
    const task = await createTask(token, 'Tarea de A');
    const step = await addStep(token, task.id, 'Paso de A');

    const patch = await request(app)
      .patch(`/api/steps/${step.id}`)
      .set(authHeader(other.token))
      .send({ name: 'Robado' });
    expect(patch.status).toBe(404);

    const complete = await request(app)
      .patch(`/api/steps/${step.id}/complete`)
      .set(authHeader(other.token));
    expect(complete.status).toBe(404);

    const del = await request(app).delete(`/api/steps/${step.id}`).set(authHeader(other.token));
    expect(del.status).toBe(404);

    const steps = (
      await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token))
    ).body;
    expect(steps).toHaveLength(1);
    expect(steps[0].name).toBe('Paso de A');
  });

  it('reorder sobre una tarea ajena no altera el orden real', async () => {
    const other = await registerUser('Otro', 'otro-reorder@stepup.app');
    const task = await createTask(token, 'Tarea de A');
    const stepA = await addStep(token, task.id, 'A');
    const stepB = await addStep(token, task.id, 'B');

    await request(app)
      .put('/api/steps/reorder')
      .set(authHeader(other.token))
      .send({ taskId: task.id, orderedIds: [stepB.id, stepA.id] })
      .expect(200);

    const steps = (
      await request(app).get(`/api/steps?taskId=${task.id}`).set(authHeader(token))
    ).body;
    expect(steps[0].name).toBe('A');
    expect(steps[1].name).toBe('B');
  });
});
