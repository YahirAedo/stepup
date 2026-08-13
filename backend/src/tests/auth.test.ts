import request from 'supertest';
import { app, resetDb, registerUser, authHeader } from './helpers';

describe('API de autenticación — registro, login y me', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('POST /api/auth/register crea una cuenta y devuelve user + token (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'ana@stepup.app', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({
      id: expect.any(String),
      name: 'Ana',
      email: 'ana@stepup.app',
    });
    expect(res.body.token).toBeTruthy();
  });

  it('registrar un email repetido devuelve 409', async () => {
    await registerUser();

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Otro', email: 'test@stepup.app', password: 'secret123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('El email ya está registrado');
  });

  it('registro con datos inválidos devuelve 400 (zod)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-es-email', password: '123' });

    expect(res.status).toBe(400);
  });

  it('registro con contraseña menor a 8 caracteres devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'corta@stepup.app', password: '1234567' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Mínimo 8 caracteres');
  });

  it('registro con contraseña de más de 72 bytes devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: 'larga@stepup.app', password: 'a'.repeat(80) });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('La contraseña no puede superar 72 bytes');
  });

  it('registro recorta espacios del email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', email: '  ana.trim@stepup.app  ', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('ana.trim@stepup.app');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: '  ANA.trim@stepup.app  ', password: 'secret123' });
    expect(login.status).toBe(200);
  });

  it('POST /api/auth/login con credenciales correctas devuelve token (200)', async () => {
    await registerUser('Test User', 'test@stepup.app', 'secret123');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@stepup.app', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('login con contraseña incorrecta devuelve 401', async () => {
    await registerUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@stepup.app', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciales inválidas');
  });

  it('login con email inexistente devuelve 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@stepup.app', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me devuelve el usuario autenticado', async () => {
    const { token } = await registerUser();

    const res = await request(app).get('/api/auth/me').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@stepup.app');
  });

  it('GET /api/auth/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('el middleware de auth protege las rutas de datos', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(401);
  });
});
