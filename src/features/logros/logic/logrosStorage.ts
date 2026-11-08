import { storage } from '../../../services/storage';

const KEY = 'logrosUnlocked';

export async function loadUnlockedLogros(): Promise<string[]> {
  try {
    const raw = await storage.getItem(KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!parsed.every((item) => typeof item === 'string')) return [];
    return parsed as string[];
  } catch {
    return [];
  }
}

export async function saveUnlockedLogros(ids: string[]): Promise<void> {
  await storage.setItem(KEY, JSON.stringify(ids));
}
