import { describe, expect, it } from 'vitest';
import { generateIdempotencyKey } from './idempotency';

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
