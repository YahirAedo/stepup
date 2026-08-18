import request from 'supertest';
import { app, resetDb, registerUser, authHeader } from './helpers';

describe('Middleware global de errores — respuestas siempre JSON', () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const user = await registerUser();
    token = user.token;
  });

  it('JSON malformado en el body devuelve 400 JSON (no HTML de Express)', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set(authHeader(token))
      .set('Content-Type', 'application/json')
      .send('{ nombre roto');

    expect(res.status).toBe(400);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toEqual({ message: 'El body no es un JSON válido' });
  });

  it('una ruta inexistente sigue devolviendo 404', async () => {
    const res = await request(app).get('/api/no-existe').set(authHeader(token));

    expect(res.status).toBe(404);
  });
});
