import request from 'supertest';
import { app, resetDb, registerUser, createTask, authHeader } from './helpers';
import { prisma } from '../config/prisma';

const KEY_A = '11111111-1111-4111-8111-111111111111';
const KEY_B = '22222222-2222-4222-8222-222222222222';

describe('Idempotencia segura en PUT (Idempotency-Key)', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('misma key + mismo body dos veces → replay de la respuesta almacenada (una sola aplicacion)', async () => {
    const task = await createTask(token, 'Original');

    const first = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Renombrada' });

    expect(first.status).toBe(200);
    expect(first.body.name).toBe('Renombrada');

    const second = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Renombrada' });

    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(second.body.updatedAt).toBe(first.body.updatedAt);

    const records = await prisma.idempotencyKey.count({ where: { key: KEY_A } });
    expect(records).toBe(1);
  });

  it('misma key + body distinto → 409 (Idempotency-Key reutilizada)', async () => {
    const task = await createTask(token, 'Original');

    const first = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Primero' });

    expect(first.status).toBe(200);

    const second = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Segundo' });

    expect(second.status).toBe(409);
    expect(second.body.message).toBe('Idempotency-Key reutilizada con un payload distinto');

    const taskAfter = await request(app).get(`/api/tasks/${task.id}`).set(authHeader(token));
    expect(taskAfter.body.name).toBe('Primero');
  });

  it('dos requests concurrentes con la misma key → una sola aplicacion', async () => {
    const task = await createTask(token, 'Original');

    const [a, b] = await Promise.all([
      request(app)
        .put(`/api/tasks/${task.id}`)
        .set(authHeader(token))
        .set('Idempotency-Key', KEY_A)
        .send({ name: 'Concurrente' }),
      request(app)
        .put(`/api/tasks/${task.id}`)
        .set(authHeader(token))
        .set('Idempotency-Key', KEY_A)
        .send({ name: 'Concurrente' }),
    ]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.body.name).toBe('Concurrente');
    expect(b.body).toEqual(a.body);

    const records = await prisma.idempotencyKey.count({ where: { key: KEY_A } });
    expect(records).toBe(1);
  });

  it('keys de usuarios distintos no colisionan', async () => {
    const user2 = await registerUser('Otro Usuario', 'otro@stepup.app', 'secret123');
    const task1 = await createTask(token, 'Tarea user1');
    const task2 = await createTask(user2.token, 'Tarea user2');

    const res1 = await request(app)
      .put(`/api/tasks/${task1.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'U1' });

    const res2 = await request(app)
      .put(`/api/tasks/${task2.id}`)
      .set(authHeader(user2.token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'U2' });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.name).toBe('U1');
    expect(res2.body.name).toBe('U2');

    const records = await prisma.idempotencyKey.count({ where: { key: KEY_A } });
    expect(records).toBe(2);
  });

  it('key expirada → se permite re-ejecutar la operacion', async () => {
    const task = await createTask(token, 'Original');

    const first = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Expirada' });

    expect(first.status).toBe(200);

    await prisma.idempotencyKey.updateMany({
      where: { key: KEY_A },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const second = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_A)
      .send({ name: 'Expirada' });

    expect(second.status).toBe(200);
    expect(second.body.updatedAt).not.toBe(first.body.updatedAt);

    const records = await prisma.idempotencyKey.count({ where: { key: KEY_A } });
    expect(records).toBe(1);
  });

  it('sin key → passthrough (sin idempotencia, no rompe clientes actuales)', async () => {
    const task = await createTask(token, 'Original');

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .send({ name: 'Sin key' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sin key');
  });

  it('key no UUID en PUT → 400', async () => {
    const task = await createTask(token, 'Original');

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set(authHeader(token))
      .set('Idempotency-Key', 'no-soy-un-uuid')
      .send({ name: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Idempotency-Key debe ser un UUID válido');
  });

  it('GET no aplica idempotencia (key invalida pasa igual)', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set(authHeader(token))
      .set('Idempotency-Key', 'no-soy-un-uuid');

    expect(res.status).toBe(200);
  });

  it('PUT con key valida en steps tambien aplica idempotencia', async () => {
    const task = await createTask(token, 'Tarea con paso');
    const stepRes = await request(app)
      .post(`/api/tasks/${task.id}/steps`)
      .set(authHeader(token))
      .send({ name: 'Paso original' });
    const stepId = stepRes.body.id;

    const first = await request(app)
      .put(`/api/steps/${stepId}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_B)
      .send({ name: 'Paso renombrado' });

    const second = await request(app)
      .put(`/api/steps/${stepId}`)
      .set(authHeader(token))
      .set('Idempotency-Key', KEY_B)
      .send({ name: 'Paso renombrado' });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });
});
