import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SyncService } from '../../../services/SyncService';
import type { SyncConflict } from '../../../database/sync';
import { buildConflictItems } from '../logic/buildConflictItems';


export function useConflicts() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError(false);
    try {
      setConflicts(await SyncService.getConflicts());
    } catch {
      setError(true);
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return undefined;
    }, [load]),
  );

  const resolve = useCallback(
    async (id: number, side: 'local' | 'server') => {
      if (busyIds.has(id)) return;
      setBusyIds((prev) => new Set(prev).add(id));
      try {
        if (side === 'local') {
          await SyncService.resolveConflictKeepLocal(id);
        } else {
          await SyncService.resolveConflictKeepServer(id);
        }
        await load();
      } catch {
        setError(true);
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [busyIds, load],
  );

  const items = buildConflictItems(conflicts);

  return {
    items,
    conflicts,
    loading,
    error,
    busyIds,
    reload: load,
    resolve,
  };
}
