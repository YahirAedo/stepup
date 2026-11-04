import { useCallback, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import { buildCompletedSummary } from '../logic/buildCompletedSummary';
import { taskCompletedCopy } from '../logic/taskCompletedCopy';
import type { CompletedSummary } from '../logic/buildCompletedSummary';

export interface UseTaskCompletedResult {
  summary: CompletedSummary | null;
  loading: boolean;
  loadError: string | null;
}

export function useTaskCompleted(taskId: number): UseTaskCompletedResult {
  const [summary, setSummary] = useState<CompletedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const loadData = useCallback(async () => {
    try {
      setLoadError(null);
      if (isFirstLoad.current) {
        setLoading(true);
        isFirstLoad.current = false;
      }
      const [t, s] = await Promise.all([
        TaskService.getById(taskId),
        StepService.getByTask(taskId),
      ]);
      if (!t) {
        setLoadError(taskCompletedCopy.loadError);
        setSummary(null);
        return;
      }
      setSummary(buildCompletedSummary(t, s ?? []));
    } catch {
      setLoadError(taskCompletedCopy.loadError);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  return { summary, loading, loadError };
}
