import request from 'supertest';
import { app, resetDb, createTask, addStep } from './helpers';

describe('API de pasos — ejecución y orden', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('POST /api/steps asigna orderIndex automático (max + 1)', async () => {
    const task = await createTask('Tarea con pasos');

    const step1 = await addStep(task.id, 'Primero');
    const step2 = await addStep(task.id, 'Segundo');

    expect(step1.orderIndex).toBe(0);
    expect(step2.orderIndex).toBe(1);
  });

  it('GET /api/steps?taskId=N devuelve los pasos en orden', async () => {
    const task = await createTask('Tarea');
    await addStep(task.id, 'A');
    await addStep(task.id, 'B');
    await addStep(task.id, 'C');

    const res = await request(app).get(`/api/steps?taskId=${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body.map((s: { name: string }) => s.name)).toEqual(['A', 'B', 'C']);
  });

  it('PATCH /api/steps/:id/complete devuelve el nextStep y no cierra la tarea', async () => {
    const task = await createTask('Migrar backend');
    await addStep(task.id, 'Configurar Prisma');
    await addStep(task.id, 'Crear endpoints');

    const step1 = (await request(app).get(`/api/steps?taskId=${task.id}`)).body[0];
    const res = await request(app).patch(`/api/steps/${step1.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.taskCompleted).toBe(false);
    expect(res.body.nextStep.name).toBe('Crear endpoints');
    expect(res.body.nextStep.status).toBe('pending');
  });

  it('completar el último paso auto-finaliza la tarea', async () => {
    const task = await createTask('Tarea corta');
    const step = await addStep(task.id, 'Único paso');

    const res = await request(app).patch(`/api/steps/${step.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.nextStep).toBeNull();
    expect(res.body.taskCompleted).toBe(true);

    const taskRes = await request(app).get(`/api/tasks/${task.id}`);
    expect(taskRes.body.status).toBe('completed');
  });

  it('reintentar completar un paso ya completado devuelve 400', async () => {
    const task = await createTask('Tarea');
    const step = await addStep(task.id, 'Paso');

    await request(app).patch(`/api/steps/${step.id}/complete`);
    const res = await request(app).patch(`/api/steps/${step.id}/complete`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El paso ya se encuentra completado');
  });

  it('completar un paso inexistente devuelve 404', async () => {
    const res = await request(app).patch('/api/steps/999/complete');

    expect(res.status).toBe(404);
  });

  it('PUT /api/steps/reorder reordena los pasos', async () => {
    const task = await createTask('Tarea');
    const stepA = await addStep(task.id, 'A');
    const stepB = await addStep(task.id, 'B');

    const res = await request(app)
      .put('/api/steps/reorder')
      .send({ taskId: task.id, orderedIds: [stepB.id, stepA.id] });

    expect(res.status).toBe(200);

    const steps = (await request(app).get(`/api/steps?taskId=${task.id}`)).body;
    expect(steps[0].name).toBe('B');
    expect(steps[0].orderIndex).toBe(0);
    expect(steps[1].name).toBe('A');
    expect(steps[1].orderIndex).toBe(1);
  });

  it('DELETE /api/steps/:id elimina el paso y reindexa los restantes', async () => {
    const task = await createTask('Tarea');
    const stepA = await addStep(task.id, 'A');
    await addStep(task.id, 'B');
    const stepC = await addStep(task.id, 'C');

    const res = await request(app).delete(`/api/steps/${stepA.id}`);

    expect(res.status).toBe(204);

    const steps = (await request(app).get(`/api/steps?taskId=${task.id}`)).body;
    expect(steps.map((s: { name: string }) => s.name)).toEqual(['B', 'C']);
    expect(steps[0].orderIndex).toBe(0);
    expect(steps[1].orderIndex).toBe(1);
    expect(steps[1].id).toBe(stepC.id);
  });
});
