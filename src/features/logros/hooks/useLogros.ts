import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { syncUnlockedLogros } from '../logrosData';
import { buildLogrosView } from '../logic/buildLogrosView';
import type { LogroFiltroKey } from '../logic/logrosCopy';

export function useLogros() {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<LogroFiltroKey>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError(false);
    try {
      const ids = await syncUnlockedLogros(new Date());
      setUnlockedIds(ids);
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

  const view = buildLogrosView({ unlockedIds, filter });

  return {
    view,
    filter,
    setFilter,
    loading,
    error,
    reload: load,
  };
}
