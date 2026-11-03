import { useCallback, useState, useEffect, useRef } from 'react';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import type { Task } from '../../../types';
import { buildEditPlan, hasUnsavedChanges, validateTaskEdit } from '../logic/buildEditPlan';
import { validateStepEdit } from '../logic/validateStepEdit';
import { applyStepSheetResult } from '../logic/stepSheetResult';
import { resolveStepIds } from '../logic/resolveStepIds';
import { useIsOnline } from '../../../hooks/useIsOnline';
import { hasSession } from '../../../services/session';
import { AIService, aiErrorMessage } from '../../../services/AIService';
import { getAiAvailability } from '../logic/getAiAvailability';
import { mergeSuggestedSteps } from '../logic/mergeSuggestedSteps';
import { buildNewDraftSteps } from '../logic/buildNewDraftSteps';
import { buildAiDescription } from '../logic/buildAiDescription';
import { appendProposedNames } from '../logic/appendProposedNames';
import { taskEditCopy } from '../logic/taskEditCopy';
import type { SuggestedStep } from '../../../types';
import type { AiStatus } from '../../../components/ui/AiStepsPanel';

export interface DraftStep {
  key: string;
  id: number | null;
  name: string;
  duration_min: number | null;
  status: 'pending' | 'completed';
}

export interface UseTaskEditResult {
  task: Task | null;
  loading: boolean;
  loadError: string | null;
  saveError: string | null;
  isSaving: boolean;
  isDeleting: boolean;
  deleteOpen: boolean;
  stepSheet: null | { mode: 'create' } | { mode: 'edit'; key: string };
  stepSheetError: string | null;
  ordenarVisible: boolean;
  discardOpen: boolean;
  skipGuardRef: React.MutableRefObject<boolean>;
  hasUnsaved: boolean;
  isLongTitle: boolean;
  canOrder: boolean;
  editingStep: DraftStep | null;
  title: string;
  notes: string;
  notesOpen: boolean;
  dueDate: string | undefined;
  steps: DraftStep[];
  pendingDeletes: Set<string>;
  setTitle: (v: string) => void;
  setNotes: (v: string) => void;
  setNotesOpen: (v: boolean) => void;
  setDueDate: (v: string | undefined) => void;
  setStepSheet: (v: null | { mode: 'create' } | { mode: 'edit'; key: string }) => void;
  setOrdenarVisible: (v: boolean) => void;
  setDeleteOpen: (v: boolean) => void;
  setDiscardOpen: (v: boolean) => void;
  openCreateSheet: () => void;
  openEditSheet: (key: string) => void;
  closeStepSheet: () => void;
  saveStepSheet: (values: { title: string; duration: number; status: 'pending' | 'completed' }) => void;
  toggleDelete: (key: string) => void;
  handleOrdenarDone: (orderedKeys: string[]) => void;
  save: () => Promise<boolean>;
  deleteTask: () => Promise<boolean>;
  discardChanges: () => void;
  loadData: () => Promise<void>;
  aiStatus: AiStatus;
  aiSuggestions: SuggestedStep[] | null;
  aiMessage: string | null;
  suggestSteps: () => Promise<void>;
  acceptAiSteps: () => void;
  discardAiSteps: () => void;
}

export function useTaskEdit(taskId: number): UseTaskEditResult {
  const [task, setTask] = useState<Task | null>(null);
  const [originalSteps, setOriginalSteps] = useState<Array<{ key: string; id: number; name: string; duration_min: number | null; status: 'pending' | 'completed' }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stepSheet, setStepSheet] = useState<null | { mode: 'create' } | { mode: 'edit'; key: string }>(null);
  const [stepSheetError, setStepSheetError] = useState<string | null>(null);
  const [ordenarVisible, setOrdenarVisible] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const skipGuardRef = useRef(false);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedStep[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const isOnline = useIsOnline();
  const requestRef = useRef(0);
  const proposedRef = useRef<string[]>([]);
  const [originalName, setOriginalName] = useState('');
  const [originalDesc, setOriginalDesc] = useState<string | null>(null);
  const [originalDueDate, setOriginalDueDate] = useState<string | null>(null);

  const stepSeq = useRef(0);

  const loadData = useCallback(async () => {
    try {
      setLoadError(null);
      setLoading(true);
      const [t, s] = await Promise.all([
        TaskService.getById(taskId),
        StepService.getByTask(taskId),
      ]);
      if (!t) {
        setLoadError('No se encontró la tarea.');
        return;
      }
      setTask(t);
      const mappedSteps = (s ?? []).map((step) => ({
        key: `step-${step.id}`,
        id: step.id,
        name: step.name,
        duration_min: step.duration_min,
        status: step.status,
      }));
      setOriginalSteps(mappedSteps);
      setTitle(t.name);
      setNotes(t.description ?? '');
      setNotesOpen((t.description ?? '').length > 0);
      setDueDate(t.due_date ?? undefined);
      setSteps(mappedSteps.map((st) => ({ ...st })));
      setPendingDeletes(new Set());
      setOriginalName(t.name);
      setOriginalDesc(t.description);
      setOriginalDueDate(t.due_date);
    } catch {
      setLoadError('No se pudieron cargar los datos de la tarea.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const original = {
    name: originalName,
    description: originalDesc,
    due_date: originalDueDate,
    steps: originalSteps,
  };
  const draft = {
    name: title,
    description: notes,
    due_date: dueDate ?? null,
    steps,
    pendingDeletes,
  };
  const hasUnsaved = hasUnsavedChanges(original, draft);
  const isLongTitle = title.trim().length > 25;
  const pendingStepsCount = steps.filter((st) => !pendingDeletes.has(st.key)).length;
  const canOrder = pendingStepsCount >= 3;

  const editingStep = stepSheet?.mode === 'edit'
    ? (steps.find((st) => st.key === stepSheet.key) ?? null)
    : null;

  const openCreateSheet = useCallback(() => {
    setStepSheetError(null);
    setStepSheet({ mode: 'create' });
  }, []);

  const openEditSheet = useCallback((key: string) => {
    setStepSheetError(null);
    setStepSheet({ mode: 'edit', key });
  }, []);

  const closeStepSheet = useCallback(() => {
    setStepSheet(null);
    setStepSheetError(null);
  }, []);

  const saveStepSheet = useCallback((values: { title: string; duration: number; status: 'pending' | 'completed' }) => {
    const validation = validateStepEdit(values.title, values.duration);
    if (!validation.ok) {
      setStepSheetError(validation.error ?? null);
      return;
    }
    const target = stepSheet;
    const newKey = `manual-${stepSeq.current + 1}`;
    if (target?.mode === 'create') {
      stepSeq.current += 1;
    }
    const nextSteps = applyStepSheetResult(steps, target, values, newKey);
    setSteps(nextSteps);
    setStepSheet(null);
    setStepSheetError(null);
  }, [stepSheet, steps]);

  const toggleDelete = useCallback((key: string) => {
    setPendingDeletes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleOrdenarDone = useCallback((orderedKeys: string[]) => {
    const byKey = new Map(steps.map((st) => [st.key, st]));
    const nextSteps = orderedKeys
      .map((key) => byKey.get(key))
      .filter((st): st is DraftStep => st !== undefined);
    const remaining = steps.filter((st) => !orderedKeys.includes(st.key));
    setSteps([...nextSteps, ...remaining]);
    setOrdenarVisible(false);
  }, [steps]);

  const suggestSteps = useCallback(async () => {
    if (aiStatus === 'loading') return;
    const availability = getAiAvailability({ isOnline, hasSession: hasSession(), title: title.trim() });
    if (availability === 'needs-title') {
      setAiStatus('error');
      setAiMessage(taskEditCopy.ai.needsTitle);
      setAiSuggestions(null);
      return;
    }
    if (availability === 'no-session') {
      setAiStatus('offline');
      setAiMessage(taskEditCopy.ai.noSession);
      setAiSuggestions(null);
      return;
    }
    if (availability === 'offline') {
      setAiStatus('offline');
      setAiMessage(taskEditCopy.ai.offline);
      setAiSuggestions(null);
      return;
    }
    const req = ++requestRef.current;
    setAiStatus('loading');
    setAiMessage(null);
    setAiSuggestions(null);
        try {
      const existingNames = steps
        .filter((st) => !pendingDeletes.has(st.key))
        .map((st) => st.name);
      const aiDesc = buildAiDescription(notes.trim(), existingNames, 900, proposedRef.current);
      const result = await AIService.suggestSteps(title.trim(), aiDesc);
      // Agregar los nombres al historial de propuestos (más viejos descartados, últimos 24)
      proposedRef.current = appendProposedNames(proposedRef.current, result.map((s) => s.name));
      if (req !== requestRef.current) return;
      const merged = mergeSuggestedSteps(existingNames, result);
      if (merged.steps.length === 0) {
        setAiStatus('idle');
        setAiSuggestions(null);
        setAiMessage(taskEditCopy.ai.allDuplicated);
      } else {
        setAiSuggestions(merged.steps.map((s) => ({ name: s.name, duration_min: s.duration })));
        setAiStatus('ready');
        setAiMessage(taskEditCopy.ai.ready);
      }
    } catch (err) {
      if (req === requestRef.current) {
        setAiStatus('error');
        setAiMessage(aiErrorMessage(err));
        setAiSuggestions(null);
      }
    }
  }, [aiStatus, isOnline, title, notes, steps, pendingDeletes]);

  const acceptAiSteps = useCallback(() => {
    if (!aiSuggestions || aiSuggestions.length === 0) {
      setAiStatus('idle');
      setAiMessage(taskEditCopy.ai.allDuplicated);
      setAiSuggestions(null);
      return;
    }
    const existingNames = steps
      .filter((st) => !pendingDeletes.has(st.key))
      .map((st) => st.name);
    const merged = mergeSuggestedSteps(existingNames, aiSuggestions);
    if (merged.steps.length === 0) {
      setAiStatus('idle');
      setAiSuggestions(null);
      setAiMessage(taskEditCopy.ai.allDuplicated);
      return;
    }
    const built = buildNewDraftSteps(stepSeq.current, merged.steps.map((s) => ({ name: s.name, duration: s.duration })));
    stepSeq.current = built.nextSeq;
    setSteps((prev) => [...prev, ...built.steps]);
    setAiSuggestions(null);
    setAiStatus('idle');
    setAiMessage(merged.skipped > 0 ? taskEditCopy.ai.allDuplicated : null);
  }, [aiSuggestions, steps, pendingDeletes]);

  const discardAiSteps = useCallback(() => {
    setAiSuggestions(null);
    setAiStatus('idle');
    setAiMessage(null);
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!task) return false;
    const validation = validateTaskEdit(title);
    if (!validation.ok) {
      setSaveError(validation.error ?? 'Error de validación');
      return false;
    }
    const plan = buildEditPlan(original, draft);
    setIsSaving(true);
    setSaveError(null);
    try {
      if (plan.stepDeletes.length > 0) {
        await StepService.deleteBatch(plan.stepDeletes);
      }
      for (const update of plan.stepUpdates) {
        await StepService.update(update.id, {
          name: update.name,
          duration_min: update.duration_min,
        });
      }
      const newStepIds: number[] = [];
      if (plan.stepAdds.length > 0) {
        const created = await StepService.addMany(task.id, plan.stepAdds);
        newStepIds.push(...created.map((s) => s.id));
      }
      const idMap = resolveStepIds(
        original.steps.map((s) => ({ key: s.key, id: s.id })),
        plan.finalOrder,
        newStepIds,
      );
      const finalIds: number[] = plan.finalOrder
        .map((key) => idMap.get(key))
        .filter((id): id is number => id !== undefined);
      if (finalIds.length > 0) {
        await StepService.reorder(task.id, finalIds);
      }
      // Cambios de estado aplicados secuencialmente después del reorder.
      for (const change of plan.stepStatusChanges) {
        const id = change.id ?? idMap.get(change.key);
        if (id === undefined) continue;
        if (change.to === 'completed') {
          await StepService.complete(id);
        } else {
          await StepService.uncomplete(id);
        }
      }
      if (Object.keys(plan.taskPatch).length > 0) {
        await TaskService.update(task.id, plan.taskPatch);
      }
      return true;
    } catch {
      const savedTitle = title;
      const savedNotes = notes;
      const savedDueDate = dueDate;
      try {
        const [t, s] = await Promise.all([
          TaskService.getById(taskId),
          StepService.getByTask(taskId),
        ]);
        if (t) {
          setTask(t);
          const mappedSteps = (s ?? []).map((step) => ({
            key: `step-${step.id}`,
            id: step.id,
            name: step.name,
            duration_min: step.duration_min,
            status: step.status,
          }));
          setOriginalSteps(mappedSteps);
          setSteps(mappedSteps.map((st) => ({ ...st })));
          setPendingDeletes(new Set());
          setOriginalName(t.name);
          setOriginalDesc(t.description);
          setOriginalDueDate(t.due_date);
        }
      } catch {
        // ignore secondary error
      }
      setTitle(savedTitle);
      setNotes(savedNotes);
      setDueDate(savedDueDate);
      setSaveError('No se pudieron guardar los cambios. Probá de nuevo.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [task, original, draft, title, notes, dueDate, taskId]);

  const deleteTask = useCallback(async (): Promise<boolean> => {
    if (!task) return false;
    setIsDeleting(true);
    try {
      await TaskService.delete(task.id);
      return true;
    } catch {
      setSaveError('No se pudo borrar la tarea. Probá de nuevo.');
      return false;
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }, [task]);

  const discardChanges = useCallback(() => {
    setTitle(originalName);
    setNotes(originalDesc ?? '');
    setDueDate(originalDueDate ?? undefined);
    setSteps(originalSteps.map((s) => ({ ...s })));
    setPendingDeletes(new Set());
    setDiscardOpen(false);
  }, [originalName, originalDesc, originalDueDate, originalSteps]);

  return {
    task,
    loading,
    loadError,
    saveError,
    isSaving,
    isDeleting,
    deleteOpen,
    stepSheet,
    stepSheetError,
    ordenarVisible,
    discardOpen,
    skipGuardRef,
    hasUnsaved,
    isLongTitle,
    canOrder,
    editingStep,
    title,
    notes,
    notesOpen,
    dueDate,
    steps,
    pendingDeletes,
    setTitle,
    setNotes,
    setNotesOpen,
    setDueDate,
    setStepSheet,
    setOrdenarVisible,
    setDeleteOpen,
    setDiscardOpen,
    openCreateSheet,
    openEditSheet,
    closeStepSheet,
    saveStepSheet,
    toggleDelete,
    handleOrdenarDone,
    save,
    deleteTask,
    discardChanges,
    loadData,
    aiStatus,
    aiSuggestions,
    aiMessage,
    suggestSteps,
    acceptAiSteps,
    discardAiSteps,
  };
}