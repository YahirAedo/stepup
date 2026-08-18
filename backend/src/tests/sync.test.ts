import request from 'supertest';
import { app, resetDb, registerUser, authHeader, createTask } from './helpers';
import { prisma } from '../config/prisma';

describe('API de sincronización — push, pull y migrate', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('push y pull exigen autenticación (401)', async () => {
    const push = await request(app).post('/api/sync/push').send({ tasks: [], steps: [] });
    expect(push.status).toBe(401);

    const pull = await request(app).get('/api/sync/pull');
    expect(pull.status).toBe(401);
  });

  it('POST /api/sync/push retry con la misma key no duplica datos', async () => {
    const id = crypto.randomUUID();
    const key = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const body = { tasks: [{ id, name: 'Tarea offline', updatedAt: new Date().toISOString() }], steps: [] };

    const first = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .set('Idempotency-Key', key)
      .send(body);
    const second = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .set('Idempotency-Key', key)
      .send(body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);

    const list = await request(app).get('/api/tasks').set(authHeader(token));
    expect(list.body).toHaveLength(1);
  });

  it('POST /api/sync/push crea tareas nuevas y devuelve sus server ids', async () => {
    const id = crypto.randomUUID();

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ id, name: 'Tarea offline', updatedAt: new Date().toISOString() }], steps: [] });

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].id).toBe(id);
    expect(res.body.tasks[0].applied).toBe(true);

    const list = await request(app).get('/api/tasks').set(authHeader(token));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].name).toBe('Tarea offline');
  });

  it('push aplica last-write-wins: la versión más nueva gana y la vieja se ignora', async () => {
    const id = crypto.randomUUID();
    const older = new Date(Date.now() - 60_000).toISOString();
    const newer = new Date().toISOString();

    const create = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ id, name: 'Original', updatedAt: newer }], steps: [] });
    expect(create.body.tasks[0].applied).toBe(true);

    const stale = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ id, name: 'Edición vieja', updatedAt: older }], steps: [] });
    expect(stale.body.tasks[0].applied).toBe(false);

    const fresh = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [{ id, name: 'Edición nueva', updatedAt: new Date(Date.now() + 10_000).toISOString() }],
        steps: [],
      });
    expect(fresh.body.tasks[0].applied).toBe(true);

    const list = await request(app).get('/api/tasks').set(authHeader(token));
    expect(list.body[0].name).toBe('Edición nueva');
  });

  it('push crea pasos referenciando su tarea nueva por taskLocalId', async () => {
    const taskId = crypto.randomUUID();
    const stepId = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [{ id: taskId, localId: 1, name: 'Tarea', updatedAt: now }],
        steps: [{ id: stepId, taskLocalId: 1, name: 'Paso', orderIndex: 0, updatedAt: now }],
      });

    expect(res.status).toBe(200);
    expect(res.body.steps[0].id).toBe(stepId);
    expect(res.body.steps[0].applied).toBe(true);

    const list = await request(app).get('/api/tasks').set(authHeader(token));
    expect(list.body[0].steps).toHaveLength(1);
    expect(list.body[0].steps[0].name).toBe('Paso');
  });

  it('push rechaza un registro que pertenece a otro usuario (409)', async () => {
    const other = await registerUser('Otro', 'otro@stepup.app');
    const id = crypto.randomUUID();

    await request(app)
      .post('/api/sync/push')
      .set(authHeader(other.token))
      .send({ tasks: [{ id, name: 'Ajeno', updatedAt: new Date().toISOString() }], steps: [] });

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [{ id, name: 'Robo', updatedAt: new Date(Date.now() + 1_000).toISOString() }],
        steps: [],
      });

    expect(res.status).toBe(409);
  });

  it('push con un step cuya tarea no existe devuelve 404', async () => {
    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [],
        steps: [
          {
            id: crypto.randomUUID(),
            taskId: crypto.randomUUID(),
            name: 'Paso huérfano',
            orderIndex: 0,
            updatedAt: new Date().toISOString(),
          },
        ],
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('La tarea especificada no existe');
  });

  it('GET /api/sync/pull retorna solo los cambios posteriores a since', async () => {
    const id = crypto.randomUUID();
    await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ id, name: 'Reciente', updatedAt: new Date().toISOString() }], steps: [] });

    const future = await request(app)
      .get('/api/sync/pull?since=2030-01-01T00:00:00.000Z')
      .set(authHeader(token));
    expect(future.body.tasks).toEqual([]);

    const past = await request(app)
      .get('/api/sync/pull?since=2020-01-01T00:00:00.000Z')
      .set(authHeader(token));
    expect(past.body.tasks).toHaveLength(1);
    expect(past.body.tasks[0].id).toBe(id);
  });

  it('POST /api/sync/push con updatedAt inválido devuelve 400', async () => {
    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ name: 'Sin timestamp', updatedAt: 'ayer' }], steps: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Debe ser un timestamp ISO válido');
  });

  it('POST /api/sync/push con dueDate inválida devuelve 400', async () => {
    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            name: 'Fecha rota',
            updatedAt: new Date().toISOString(),
            dueDate: '32/13/2026',
          },
        ],
        steps: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Debe ser un timestamp ISO válido');
  });

  it('GET /api/sync/pull con since inválido devuelve 400', async () => {
    const res = await request(app).get('/api/sync/pull?since=not-a-date').set(authHeader(token));

    expect(res.status).toBe(400);
  });

  it('pull respeta el aislamiento entre usuarios', async () => {
    const other = await registerUser('Otro', 'otro@stepup.app');
    await request(app)
      .post('/api/sync/push')
      .set(authHeader(other.token))
      .send({
        tasks: [{ id: crypto.randomUUID(), name: 'Del otro', updatedAt: new Date().toISOString() }],
        steps: [],
      });

    const mine = await request(app)
      .get('/api/sync/pull?since=2020-01-01T00:00:00.000Z')
      .set(authHeader(token));

    expect(mine.body.tasks).toEqual([]);
  });

  it('POST /api/sync/migrate crea la cuenta, importa datos y devuelve el mapeo de ids', async () => {
    const taskLocalId = 7;
    const stepLocalId = 3;
    const taskId = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Nuevo Usuario',
      email: 'nuevo@stepup.app',
      password: 'secret123',
      tasks: [{ localId: taskLocalId, id: taskId, name: 'Migrada', updatedAt: now }],
      steps: [
        { localId: stepLocalId, taskLocalId, name: 'Paso migrado', orderIndex: 0, updatedAt: now },
      ],
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('nuevo@stepup.app');
    expect(res.body.token).toBeTruthy();
    expect(res.body.taskMap[taskLocalId]).toBe(taskId);
    expect(res.body.stepMap[stepLocalId]).toBeTruthy();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nuevo@stepup.app', password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const list = await request(app).get('/api/tasks').set(authHeader(res.body.token));
    expect(list.body).toHaveLength(1);
    expect(list.body[0].name).toBe('Migrada');
  });

  it('POST /api/sync/migrate con password corta devuelve 400', async () => {
    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Nuevo',
      email: 'corta@stepup.app',
      password: '1234567',
      tasks: [],
      steps: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Mínimo 8 caracteres');
  });

  it('POST /api/sync/migrate recorta espacios del email', async () => {
    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Nuevo',
      email: '  migrado.trim@stepup.app  ',
      password: 'secret123',
      tasks: [],
      steps: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('migrado.trim@stepup.app');
  });

  it('POST /api/sync/migrate retry con la misma key replayea token y maps', async () => {
    const key = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const now = new Date().toISOString();
    const body = {
      name: 'Retry User',
      email: 'retry@stepup.app',
      password: 'secret123',
      tasks: [{ localId: 1, name: 'Migrada', updatedAt: now }],
      steps: [],
    };

    const first = await request(app).post('/api/sync/migrate').set('Idempotency-Key', key).send(body);
    const second = await request(app).post('/api/sync/migrate').set('Idempotency-Key', key).send(body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.token).toBe(first.body.token);
    expect(second.body.taskMap).toEqual(first.body.taskMap);
    expect(second.body.user.email).toBe('retry@stepup.app');
  });

  it('POST /api/sync/migrate con email existente devuelve 409', async () => {
    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Duplicado',
      email: 'test@stepup.app',
      password: 'secret123',
      tasks: [{ localId: 1, name: 'X', updatedAt: new Date().toISOString() }],
      steps: [],
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('El email ya está registrado');
  });

  it('POST /api/sync/migrate con id de tarea ya existente devuelve 409 y hace rollback', async () => {
    const task = await createTask(token);

    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Colisión',
      email: 'colision@stepup.app',
      password: 'secret123',
      tasks: [{ id: task.id, localId: 1, name: 'Duplicada', updatedAt: new Date().toISOString() }],
      steps: [],
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('El registro ya existe');

    const retry = await request(app).post('/api/sync/migrate').send({
      name: 'Colisión 2',
      email: 'colision@stepup.app',
      password: 'secret123',
      tasks: [],
      steps: [],
    });
    expect(retry.status).toBe(201);
  });

  it('migrate funciona aunque exista el usuario legacy del backfill (sin colisión de id)', async () => {
    // El backfill de la migración auth_and_sync crea un usuario legacy con id ...001.
    // El scope de idempotencia de migrate no debe usar ese mismo id (colisión → 409).
    await prisma.user.create({
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Legacy',
        email: 'legacy@stepup.app',
        password: '!',
      },
    });

    const res = await request(app).post('/api/sync/migrate').send({
      name: 'Nuevo',
      email: 'nolegacy@stepup.app',
      password: 'secret123',
      tasks: [],
      steps: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });

  it('push no puede completar una tarea con pasos pendientes (409) y hace rollback', async () => {
    const taskId = crypto.randomUUID();
    const stepId = crypto.randomUUID();
    const now = new Date().toISOString();

    const create = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({ tasks: [{ id: taskId, name: 'Tarea', updatedAt: now }], steps: [] });
    expect(create.status).toBe(200);

    const bad = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            id: taskId,
            name: 'Tarea',
            status: 'completed',
            updatedAt: new Date(Date.now() + 10_000).toISOString(),
          },
        ],
        steps: [{ id: stepId, taskId, name: 'Paso', orderIndex: 0, updatedAt: now }],
      });

    expect(bad.status).toBe(409);
    expect(bad.body.message).toBe('No se puede completar una tarea con pasos pendientes');

    const afterBad = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(token));
    expect(afterBad.body.status).toBe('active');
    expect(afterBad.body.steps).toHaveLength(0);

    const good = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            id: taskId,
            name: 'Tarea',
            status: 'completed',
            updatedAt: new Date(Date.now() + 30_000).toISOString(),
          },
        ],
        steps: [
          {
            id: stepId,
            taskId,
            name: 'Paso',
            orderIndex: 0,
            status: 'completed',
            updatedAt: new Date(Date.now() + 20_000).toISOString(),
          },
        ],
      });

    expect(good.status).toBe(200);
    expect(good.body.tasks[0].applied).toBe(true);

    const afterGood = await request(app).get(`/api/tasks/${taskId}`).set(authHeader(token));
    expect(afterGood.body.status).toBe('completed');
  });
});
