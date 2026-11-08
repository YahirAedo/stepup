import { ProgressService } from '../../services/ProgressService';
import { evaluateLogros } from './logic/evaluateLogros';
import { loadUnlockedLogros, saveUnlockedLogros } from './logic/logrosStorage';
import { mergeUnlocked } from './logic/mergeUnlocked';

export async function syncUnlockedLogros(now: Date): Promise<string[]> {
  const stats = await ProgressService.getLogrosStats();
  const computed = evaluateLogros(stats, now);
  const persisted = await loadUnlockedLogros();
  const merged = mergeUnlocked(persisted, computed);

  if (merged.length > persisted.length) {
    try {
      await saveUnlockedLogros(merged);
    } catch {
      // si el guardado falla, igual devolvemos el resultado
    }
  }

  return merged;
}
