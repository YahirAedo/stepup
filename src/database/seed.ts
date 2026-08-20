import type { MigrationDb } from './migrations';

export async function runSeed(db: MigrationDb): Promise<void> {
  const rows = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) AS count FROM tasks', []);
  const count = rows[0]?.count ?? 0;
  console.log('[SEED] tasks count:', count);
  if (count > 0) {
    console.log('[SEED] skipping — DB already has data');
    return;
  }
  console.log('[SEED] seeding 4 tasks...');

  const now = new Date().toISOString();

  const t1 = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, updated_at)
       VALUES (?, ?, 'active', ?, NULL, ?)`,
    ['Proyecto Final', new Date(Date.now() + 86400000 * 2).toISOString(), now, now],
  );
  const t1Id = t1.lastInsertRowId;
  const t1Steps: Array<[string, number, number, string, string | null]> = [
    ['Definir alcance', 30, 0, 'pending', null],
    ['Diseñar prototipo', 60, 1, 'pending', null],
    ['Documentar', 45, 2, 'pending', null],
    ['Investigar requisitos', 20, 3, 'completed', now],
  ];
  for (const [name, duration, order, status, completedAt] of t1Steps) {
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [t1Id, name, duration, order, status, completedAt, now],
    );
  }

  const t2 = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, updated_at)
       VALUES (?, ?, 'active', ?, NULL, ?)`,
    ['Estudiar Álgebra', new Date(Date.now() + 86400000 * 5).toISOString(), now, now],
  );
  const t2Id = t2.lastInsertRowId;
  const t2Steps: Array<[string, number, number, string, string | null]> = [
    ['Repasar vectores', 25, 0, 'completed', now],
    ['Resolver matrices', 40, 1, 'completed', now],
    ['Practicar determinantes', 30, 2, 'pending', null],
  ];
  for (const [name, duration, order, status, completedAt] of t2Steps) {
    await db.runAsync(
      `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [t2Id, name, duration, order, status, completedAt, now],
    );
  }

  const t3 = await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, updated_at)
       VALUES (?, ?, 'active', ?, NULL, ?)`,
    ['Preparar Presentación', new Date(Date.now() + 86400000 * 1).toISOString(), now, now],
  );
  const t3Id = t3.lastInsertRowId;
  await db.runAsync(
    `INSERT INTO steps (task_id, name, duration_min, order_index, status, completed_at, updated_at)
       VALUES (?, ?, ?, 0, 'pending', NULL, ?)`,
    [t3Id, 'Armar slides', 45, now],
  );

  await db.runAsync(
    `INSERT INTO tasks (name, due_date, status, created_at, completed_at, updated_at)
       VALUES (?, NULL, 'active', ?, NULL, ?)`,
    ['Leer "Atomic Habits"', now, now],
  );

  const days = [
    '2026-06-26',
    '2026-06-27',
    '2026-06-28',
    '2026-06-29',
    '2026-06-30',
    '2026-07-01',
    '2026-07-02',
  ];
  const counts = [2, 5, 1, 7, 3, 4, 6];
  for (let i = 0; i < days.length; i++) {
    await db.runAsync(
      `INSERT OR IGNORE INTO daily_progress (date, steps_completed) VALUES (?, ?)`,
      [days[i], counts[i]],
    );
  }
}
