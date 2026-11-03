import { useCallback, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import { TaskCompletionService } from '../../../services/TaskCompletionService';
import { taskDetailCopy } from '../logic/taskDetailCopy';
import type { Task, Step } from '../../../types';

export interface UseTaskDetailResult {
  task: Task | null;
  steps: ReadonlyArray<Step>;
  loading: boolean;
  loadError: string | null;
  completeAll: () => Promise<void>;
  reopenAll: () => Promise<void>;
  isBusy: boolean;
  actionError: string | null;
  loadData: () => Promise<void>;
  clearActionError: () => void;
}

export function useTaskDetail(taskId: number): UseTaskDetailResult {
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
      setTask(t);
      setSteps(s ?? []);
      if (!t) {
        setLoadError('No se encontró la tarea.');
      }
    } catch {
      setLoadError('No se pudieron cargar los datos de la tarea.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const completeAll = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    setActionError(null);
    try {
      await TaskCompletionService.completeAll(taskId);
      await loadData();
    } catch {
      setActionError(taskDetailCopy.actionError);
      await loadData();
    } finally {
      setIsBusy(false);
    }
  }, [taskId, isBusy, loadData]);

  const reopenAll = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    setActionError(null);
    try {
      await TaskCompletionService.reopenAll(taskId);
      await loadData();
    } catch {
      setActionError(taskDetailCopy.actionError);
      await loadData();
    } finally {
      setIsBusy(false);
    }
  }, [taskId, isBusy, loadData]);

  return {
    task,
    steps: steps as ReadonlyArray<Step>,
    loading,
    loadError,
    completeAll,
    reopenAll,
    isBusy,
    actionError,
    loadData,
    clearActionError,
  };
}