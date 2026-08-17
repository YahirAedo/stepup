import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';

const MIGRATE_TEST_DB = 'stepup_migrate_test';
const LEGACY_USER_ID = '00000000-0000-4000-8000-000000000001';

function statements(sql: string): string[] {
  return sql
    .split(';')
    .map((block) =>
      block
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((block) => block.length > 0);
}

describe('Migración auth_and_sync sobre base con datos (deploy seguro)', () => {
  let client: PrismaClient;

  beforeAll(async () => {
    await (async () => {
      const admin = new PrismaClient();
      try {
        await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${MIGRATE_TEST_DB}"`);
      } catch {
        // la base puede no existir; se ignora
      }
      await admin.$executeRawUnsafe(`CREATE DATABASE "${MIGRATE_TEST_DB}"`);
      await admin.$disconnect();
    })();

    const url = process.env.DATABASE_URL!.replace('/stepup_test', `/${MIGRATE_TEST_DB}`);
    client = new PrismaClient({ datasources: { db: { url } } });

    // 1. Aplicar SOLO la migración init (estado pre-auth: tasks/steps/daily_progress sin user)
    const initSql = readFileSync(
      path.join(__dirname, '../../prisma/migrations/20260805170939_init/migration.sql'),
      'utf8',
    );
    for (const statement of statements(initSql)) {
      await client.$executeRawUnsafe(statement);
    }

    // 2. Sembrar datos preexistentes (simula Railway con datos de B1)
    await client.$executeRawUnsafe(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at) VALUES ('Tarea 1', NULL, 'active', CURRENT_TIMESTAMP, NULL)`,
    );
    await client.$executeRawUnsafe(
      `INSERT INTO tasks (name, due_date, status, created_at, completed_at) VALUES ('Tarea 2', NULL, 'active', CURRENT_TIMESTAMP, NULL)`,
    );
    await client.$executeRawUnsafe(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at) VALUES (1, 'Paso 1', 10, 0, 'pending', NULL)`,
    );
    await client.$executeRawUnsafe(
      `INSERT INTO daily_progress (date, steps_completed) VALUES ('2026-08-15', 3)`,
    );
  });

  afterAll(async () => {
    await client.$disconnect();
  });

  it('aplica auth_and_sync sin fallar y backfillea user_id/updated_at', async () => {
    // 3. Aplicar la migración auth_and_sync editada (con backfill)
    const authSql = readFileSync(
      path.join(__dirname, '../../prisma/migrations/20260810183756_auth_and_sync/migration.sql'),
      'utf8',
    );
    for (const statement of statements(authSql)) {
      await client.$executeRawUnsafe(statement);
    }

    // 4. Verificar backfill
    const tasks = await client.$queryRawUnsafe<Array<{ user_id: string; updated_at: Date }>>(
      'SELECT user_id, updated_at FROM tasks ORDER BY id',
    );
    expect(tasks).toHaveLength(2);
    expect(tasks[0].user_id).toBe(LEGACY_USER_ID);
    expect(tasks[0].updated_at).toBeInstanceOf(Date);

    const steps = await client.$queryRawUnsafe<Array<{ updated_at: Date }>>(
      'SELECT updated_at FROM steps',
    );
    expect(steps).toHaveLength(1);
    expect(steps[0].updated_at).toBeInstanceOf(Date);

    const progress = await client.$queryRawUnsafe<Array<{ user_id: string }>>(
      'SELECT user_id FROM daily_progress',
    );
    expect(progress).toHaveLength(1);
    expect(progress[0].user_id).toBe(LEGACY_USER_ID);
  });
});
