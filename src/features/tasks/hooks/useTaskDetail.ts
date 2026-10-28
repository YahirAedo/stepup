import { useCallback, useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import type { Task, Step } from '../../../types';
import { canShowReorder } from '../logic/canShowReorder';
import { togglePendingDelete } from '../logic/togglePendingDelete';
import { validateStepEdit } from '../logic/validateStepEdit';
import { buildReorderOrder } from '../logic/reorderSteps';

export interface UseTaskDetailResult {
  task: Task | null;
  steps: ReadonlyArray<Step>;
  loading: boolean;
  loadError: string | null;
  editError: string | null;
  pendingDeleteIds: ReadonlyArray<number>;
  canShowReorder: boolean;
  selectedStepId: number | null;
  previousOrder: ReadonlyArray<number> | null;
  editSheetVisible: boolean;
  editStep: Step | null;
  loadData: () => Promise<void>;
  toggleDeleteStep: (stepId: number) => void;
  openEditSheet: (step: Step) => void;
  closeEditSheet: () => void;
  saveEdit: (values: { title: string; duration: number }) => Promise<void>;
  selectStep: (stepId: number, excludeIds?: ReadonlyArray<number>) => void;
  undoReorder: () => Promise<void>;
  flushPendingDeletes: () => Promise<void>;
}

/**
 * Función pura: devuelve los ids de pasos a mandar a deleteBatch.
 * Filtra duplicados y vacíos, ordena ascendente.
 */
export function getIdsToDeleteBatch(ids: ReadonlyArray<number>): number[] {
  return Array.from(new Set(ids)).sort((a, b) => a - b);
}

/**
 * Función pura: decide si hay borrados pendientes para flushear al salir.
 */
export function hasPendingDeletes(ids: ReadonlyArray<number>): boolean {
  return ids.length > 0;
}

export function useTaskDetail(taskId: number): UseTaskDetailResult {
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [previousOrder, setPreviousOrder] = useState<number[] | null>(null);
  const [editSheetVisible, setEditSheetVisible] = useState(false);
  const [editStep, setEditStep] = useState<Step | null>(null);
  const pendingDeleteRef = useRef<ReadonlyArray<number>>([]);
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

  // Efecto aparte: mantiene el ref sincronizado con el estado actual.
  useEffect(() => {
    pendingDeleteRef.current = pendingDeleteIds;
  }, [pendingDeleteIds]);

  // Limpieza solo al desmontar: lee el ref (que tiene los ids más recientes)
  // y flushea deleteBatch si hay algo pendiente.
  useEffect(() => {
    return () => {
      const ids = getIdsToDeleteBatch(pendingDeleteRef.current);
      if (hasPendingDeletes(ids)) {
        void StepService.deleteBatch(ids);
      }
    };
  }, []);

  const canShowReorderValue = canShowReorder(steps, pendingDeleteIds);

  const toggleDeleteStep = useCallback((stepId: number) => {
    setPendingDeleteIds((prev) => togglePendingDelete(prev, stepId));
  }, []);

  const openEditSheet = useCallback((step: Step) => {
    setEditStep(step);
    setEditSheetVisible(true);
  }, []);

  const closeEditSheet = useCallback(() => {
    setEditSheetVisible(false);
    setEditStep(null);
    setEditError(null);
  }, []);

  const saveEdit = useCallback(async (values: { title: string; duration: number }) => {
    if (!editStep) return;
    const validation = validateStepEdit(values.title, values.duration);
    if (!validation.ok) {
      setEditError(validation.error ?? null);
      return;
    }
    try {
      await StepService.update(editStep.id, {
        name: values.title,
        duration_min: values.duration,
      });
      setEditError(null);
      closeEditSheet();
      await loadData();
    } catch {
      setEditError('No se pudo guardar la edición del paso.');
    }
  }, [editStep, closeEditSheet, loadData]);

  const selectStep = useCallback((stepId: number, excludeIds: ReadonlyArray<number> = []) => {
    const prev = selectedStepId;
    if (prev === null) {
      setSelectedStepId(stepId);
      return;
    }
    if (prev === stepId) {
      setSelectedStepId(null);
      return;
    }
    // Ya hay un paso seleccionado y se tocó otro diferente:
    // calcular el reorden fuera del updater y aplicarlo, excluyendo los ids
    // pasados (útil cuando vienen del route param y no del estado local).
    setSelectedStepId(null);
    const fullOrder = buildReorderOrder(steps, prev, stepId, excludeIds);
    const hasChanged = fullOrder.some((id, idx) => id !== steps[idx]?.id);
    if (hasChanged) {
      setPreviousOrder(steps.map((s) => s.id));
      void flushPendingDeletesThenReorder(fullOrder);
    }
  }, [steps, selectedStepId]);

  const flushPendingDeletesThenReorder = useCallback(
    async (orderedIds: ReadonlyArray<number>) => {
      await StepService.reorder(taskId, Array.from(orderedIds));
      await loadData();
    },
    [taskId, loadData],
  );

  const flushPendingDeletes = useCallback(async () => {
    if (hasPendingDeletes(pendingDeleteIds)) {
      await StepService.deleteBatch(pendingDeleteIds);
    }
  }, [pendingDeleteIds]);

  const undoReorder = useCallback(async () => {
    if (!previousOrder) return;
    await StepService.reorder(taskId, previousOrder);
    setPreviousOrder(null);
    await loadData();
  }, [previousOrder, taskId, loadData]);

  return {
    task,
    steps: steps as ReadonlyArray<Step>,
    loading,
    loadError,
    editError,
    pendingDeleteIds: pendingDeleteIds as ReadonlyArray<number>,
    canShowReorder: canShowReorderValue,
    selectedStepId,
    previousOrder: previousOrder ?? null,
    editSheetVisible,
    editStep,
    loadData,
    toggleDeleteStep,
    openEditSheet,
    closeEditSheet,
    saveEdit,
    selectStep,
    undoReorder,
    flushPendingDeletes,
  };
}
