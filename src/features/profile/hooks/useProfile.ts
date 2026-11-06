import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../../../services/AuthService';
import { SyncService } from '../../../services/SyncService';
import { ProgressService } from '../../../services/ProgressService';
import { hasSession } from '../../../services/session';
import { buildPerfilView } from '../logic/buildPerfilView';
import { buildProfileMetrics } from '../logic/buildProfileMetrics';
import type { SessionUser } from '../../../services/session';

export function useProfile() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [stats, setStats] = useState<{ completedDates: string[]; stepsTotal: number }>({
    completedDates: [],
    stepsTotal: 0,
  });
  const [conflictsCount, setConflictsCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError(false);
    setNow(new Date());
    try {
      const [loadedUser, loadedStats, conflicts, loadedLastSync] = await Promise.all([
        AuthService.getUser(),
        ProgressService.getProfileStats(),
        SyncService.getConflicts(),
        SyncService.getLastSyncAt(),
      ]);
      setUser(loadedUser);
      setStats(loadedStats);
      setConflictsCount(conflicts.length);
      setLastSyncAt(loadedLastSync);
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

  const onSync = useCallback(async () => {
    setSyncing(true);
    setSyncError(false);
    try {
      await SyncService.push();
      await SyncService.pull();
    } catch {
      setSyncError(true);
    } finally {
      setSyncing(false);
      setNow(new Date());
      await load();
    }
  }, [load]);

  const view = buildPerfilView({
    hasSession: hasSession(),
    syncing,
    syncError,
    conflictsCount,
    lastSyncAt,
    now,
  });

  const metrics = buildProfileMetrics(stats, now);

  return {
    user,
    view,
    metrics,
    loading,
    error,
    syncing,
    onSync,
    reload: load,
  };
}
