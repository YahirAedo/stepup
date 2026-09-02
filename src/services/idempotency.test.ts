import { beforeEach, describe, expect, it } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { getPendingIdempotencyKey } from '../database/sync';
import {
  canonicalPayload,
  clearIdempotencyKey,
  generateIdempotencyKey,
  hashPayload,
  resolvePersistedIdempotencyKey,
} from './idempotency';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateIdempotencyKey', () => {
  it('devuelve un string con formato UUID v4 y longitud 36', () => {
    const key = generateIdempotencyKey();

    expect(key).toMatch(UUID_V4);
    expect(key).toHaveLength(36);
  });

  it('genera claves distintas entre llamadas', () => {
    const keys = new Set(Array.from({ length: 1000 }, () => generateIdempotencyKey()));

    expect(keys.size).toBe(1000);
  });

  it('mantiene fijos los bits de version y variante', () => {
    for (let i = 0; i < 50; i += 1) {
      const key = generateIdempotencyKey();
      expect(key[14]).toBe('4');
      expect(['8', '9', 'a', 'b']).toContain(key[19]);
    }
  });
});

describe('hashPayload', () => {
  it('es determinístico para el mismo payload', () => {
    const payload = { tasks: [{ localId: 1, name: 'Tarea' }], steps: [] };

    expect(hashPayload(payload)).toBe(hashPayload({ ...payload }));
  });

  it('no depende del orden de las claves de los objetos', () => {
    expect(hashPayload({ a: 1, b: 2 })).toBe(hashPayload({ b: 2, a: 1 }));
  });

  it('cambia cuando cambia el payload', () => {
    expect(hashPayload({ name: 'A' })).not.toBe(hashPayload({ name: 'B' }));
  });

  it('serializa arrays con orden significativo', () => {
    expect(canonicalPayload([1, 2])).not.toBe(canonicalPayload([2, 1]));
  });
});

describe('resolvePersistedIdempotencyKey / clearIdempotencyKey', () => {
  let db: MigrationDb;

  beforeEach(async () => {
    const created = await makeSqlJsDb();
    db = created.db;
    await runMigrations(db);
  });

  it('devuelve la misma key si el payload no cambió (retry tras fallo)', async () => {
    const payload = { tasks: [{ localId: 1, name: 'Tarea' }], steps: [] };

    const first = await resolvePersistedIdempotencyKey(db, 'sync-push', payload);
    const second = await resolvePersistedIdempotencyKey(db, 'sync-push', payload);

    expect(second).toBe(first);
  });

  it('genera una key nueva si el payload cambió entre intentos', async () => {
    const first = await resolvePersistedIdempotencyKey(db, 'sync-push', { name: 'A' });
    const second = await resolvePersistedIdempotencyKey(db, 'sync-push', { name: 'B' });

    expect(second).not.toBe(first);
  });

  it('mantiene keys independientes por scope', async () => {
    const pushKey = await resolvePersistedIdempotencyKey(db, 'sync-push', { a: 1 });
    const migrateKey = await resolvePersistedIdempotencyKey(db, 'sync-migrate', { a: 1 });

    expect(migrateKey).not.toBe(pushKey);
  });

  it('clearIdempotencyKey elimina la key pendiente (solo tras éxito)', async () => {
    await resolvePersistedIdempotencyKey(db, 'sync-push', { a: 1 });
    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.not.toBeNull();

    await clearIdempotencyKey(db, 'sync-push');

    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.toBeNull();
  });
});
