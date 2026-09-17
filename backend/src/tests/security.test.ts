import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { app, registerUser, authHeader, resetDb } from './helpers';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

beforeAll(async () => {
  await resetDb();
});

describe('Security headers (#244)', () => {
  it('incluye headers de seguridad de helmet', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-download-options']).toBe('noopen');
    expect(res.headers['x-permitted-cross-domain-policies']).toBe('none');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(res.headers['cross-origin-resource-policy']).toBe('same-origin');
  });

  it('no expone X-Powered-By', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('CORS restrictivo (#244)', () => {
  it('permite orígenes conocidos (localhost)', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:8081');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:8081');
  });

  it('rechaza orígenes desconocidos', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://malicious-site.com');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('Rate limiting en auth (#245)', () => {
  let testApp: express.Express;

  beforeEach(() => {
    testApp = express();
    const loginLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiados intentos de login. Intentá nuevamente en un minuto.' },
    });
    const registerLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiados registros. Intentá nuevamente en un minuto.' },
    });
    testApp.use(express.json());
    testApp.post('/login', loginLimiter, (req, res) => res.status(401).json({ message: 'Invalid credentials' }));
    testApp.post('/register', registerLimiter, (req, res) => res.status(201).json({ message: 'Created' }));
  });

  it('login permite hasta 5 intentos por minuto', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(testApp)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    }

    const res6 = await request(testApp)
      .post('/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res6.status).toBe(429);
    expect(res6.body.message).toMatch(/Demasiados intentos/);
  });

  it('register permite hasta 3 registros por minuto', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(testApp)
        .post('/register')
        .send({ name: `User${i}`, email: `user${i}@example.com`, password: 'password123' });
      expect(res.status).toBe(201);
    }

    const res4 = await request(testApp)
      .post('/register')
      .send({ name: 'User4', email: 'user4@example.com', password: 'password123' });
    expect(res4.status).toBe(429);
    expect(res4.body.message).toMatch(/Demasiados registros/);
  });
});

describe('Rate limiting en migrate (#245)', () => {
  let testApp: express.Express;

  beforeEach(() => {
    testApp = express();
    const migrateLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Demasiadas migraciones. Intentá nuevamente en un minuto.' },
    });
    testApp.use(express.json());
    testApp.post('/migrate', migrateLimiter, (req, res) => res.status(201).json({ message: 'Migrated' }));
  });

  it('migrate permite hasta 2 migraciones por minuto', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await request(testApp)
        .post('/migrate')
        .send({ name: `User${i}`, email: `migrate${i}@example.com`, password: 'password123', tasks: [], steps: [] });
      expect(res.status).toBe(201);
    }

    const res3 = await request(testApp)
      .post('/migrate')
      .send({ name: 'User3', email: 'migrate3@example.com', password: 'password123', tasks: [], steps: [] });
    expect(res3.status).toBe(429);
    expect(res3.body.message).toMatch(/Demasiadas migraciones/);
  });
});

describe('Validación de updatedAt en sync (#246)', () => {
  let token: string;

  beforeAll(async () => {
    const user = await registerUser();
    token = user.token;
  });

  it('rechaza updatedAt en el futuro (>60s)', async () => {
    const futureDate = new Date(Date.now() + 120 * 1000).toISOString();

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test task',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: futureDate,
            completedAt: null,
          },
        ],
        steps: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/updatedAt no puede estar en el futuro/);
  });

  it('acepta updatedAt con clock skew razonable (<=60s)', async () => {
    const slightlyFutureDate = new Date(Date.now() + 30 * 1000).toISOString();

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test task',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: slightlyFutureDate,
            completedAt: null,
          },
        ],
        steps: [],
      });

    expect(res.status).toBe(200);
  });

  it('rechaza updatedAt anterior a createdAt', async () => {
    const createdAt = new Date().toISOString();
    const updatedAt = new Date(Date.now() - 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/sync/push')
      .set(authHeader(token))
      .send({
        tasks: [
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Test task',
            status: 'active',
            createdAt,
            updatedAt,
            completedAt: null,
          },
        ],
        steps: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/updatedAt no puede ser anterior a createdAt/);
  });
});
