import { beforeEach, describe, expect, it } from 'vitest';
import { runMigrations, type MigrationDb } from '../database/migrations';
import { makeSqlJsDb } from '../database/testDb';
import { clearPendingIdempotencyKey, getPendingIdempotencyKey } from '../database/sync';
import {
  canonicalPayload,
  generateIdempotencyKey,
  hashPayload,
  resolvePersistedIdempotencyKey,
} from './idempotency';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256_HEX = /^[0-9a-f]{64}$/;

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

describe('canonicalPayload', () => {
  it('es determinístico para el mismo payload', () => {
    const payload = { tasks: [{ localId: 1, name: 'Tarea' }], steps: [] };

    expect(canonicalPayload(payload)).toBe(canonicalPayload({ ...payload }));
  });

  it('no depende del orden de las claves de los objetos', () => {
    expect(canonicalPayload({ a: 1, b: 2 })).toBe(canonicalPayload({ b: 2, a: 1 }));
  });

  it('cambia cuando cambia el payload', () => {
    expect(canonicalPayload({ name: 'A' })).not.toBe(canonicalPayload({ name: 'B' }));
  });

  it('serializa arrays con orden significativo', () => {
    expect(canonicalPayload([1, 2])).not.toBe(canonicalPayload([2, 1]));
  });
});

describe('hashPayload', () => {
  it('devuelve un hash sha-256 en formato hex (64 caracteres)', async () => {
    const hash = await hashPayload('test');
    expect(hash).toMatch(SHA256_HEX);
  });

  it('es determinístico para el mismo input', async () => {
    const hash1 = await hashPayload('mismo-input');
    const hash2 = await hashPayload('mismo-input');
    expect(hash1).toBe(hash2);
  });

  it('cambia cuando cambia el input', async () => {
    const hash1 = await hashPayload('input-a');
    const hash2 = await hashPayload('input-b');
    expect(hash1).not.toBe(hash2);
  });
});

describe('resolvePersistedIdempotencyKey / clearPendingIdempotencyKey', () => {
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

  it('clearPendingIdempotencyKey elimina la key pendiente (solo tras éxito)', async () => {
    await resolvePersistedIdempotencyKey(db, 'sync-push', { a: 1 });
    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.not.toBeNull();

    await clearPendingIdempotencyKey(db, 'sync-push');

    await expect(getPendingIdempotencyKey(db, 'sync-push')).resolves.toBeNull();
  });

  it('guarda el hash sha-256 del payload, no el payload completo (#198)', async () => {
    const payload = { email: 'test@stepup.app', password: 'mi-password-secreta-123' };

    await resolvePersistedIdempotencyKey(db, 'sync-migrate', payload);
    const pending = await getPendingIdempotencyKey(db, 'sync-migrate');

    expect(pending).not.toBeNull();
    expect(pending!.payloadHash).toMatch(SHA256_HEX);
    expect(pending!.payloadHash).not.toContain('mi-password-secreta-123');
    expect(pending!.payloadHash).not.toContain('test@stepup.app');
  });
});
