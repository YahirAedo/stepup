import { getDb } from '../database/db';
import { getLocalOwner, resetLocalData, setLocalOwner } from '../database/sync';

export async function ensureLocalOwner(userId: string): Promise<{ changed: boolean }> {
  const db = await getDb();
  const owner = await getLocalOwner(db);
  if (owner === userId) return { changed: false };
  if (owner !== null) {
    await resetLocalData(db);
  }
  await setLocalOwner(db, userId);
  return { changed: owner !== null };
}

export async function clearLocalData(): Promise<void> {
  const db = await getDb();
  await resetLocalData(db);
}
