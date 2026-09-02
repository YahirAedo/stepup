import type { MigrationDb } from '../database/migrations';
import {
  clearPendingIdempotencyKey,
  getPendingIdempotencyKey,
  setPendingIdempotencyKey,
} from '../database/sync';

export function generateIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function canonicalPayload(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalPayload(item)).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalPayload(record[key])}`)
    .join(',')}}`;
}

export function hashPayload(payload: unknown): string {
  const text = canonicalPayload(payload);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export async function resolvePersistedIdempotencyKey(
  db: MigrationDb,
  scope: string,
  payload: unknown,
): Promise<string> {
  const payloadHash = hashPayload(payload);
  const pending = await getPendingIdempotencyKey(db, scope);
  if (pending !== null && pending.payloadHash === payloadHash) {
    return pending.key;
  }
  const key = generateIdempotencyKey();
  await setPendingIdempotencyKey(db, scope, key, payloadHash);
  return key;
}

export async function clearIdempotencyKey(db: MigrationDb, scope: string): Promise<void> {
  await clearPendingIdempotencyKey(db, scope);
}
