import { useCallback, useState, useRef } from 'react';
import { TaskService } from '../../../services/TaskService';
import type { Task } from '../../../types';
import { validateStepEdit } from '../logic/validateStepEdit';
import { applyStepSheetResult } from '../logic/stepSheetResult';
import { reorderByKeys } from '../logic/reorderByKeys';
import { canOrderSteps } from '../logic/canOrderSteps';
import { isLongTitle as isLongTitleFn } from '../../../utils/microplan';
import { validateTaskEdit } from '../logic/buildEditPlan';
import { buildCreatePayload } from '../logic/buildCreatePayload';
import { getCreateActions } from '../logic/getCreateActions';
import { taskCreateCopy } from '../logic/taskCreateCopy';
import type { DraftStep } from './draftStep';
import { useAiSteps } from './useAiSteps';
import type { SuggestedStep } from '../../../types';
import type { AiStatus } from '../../../components/ui/AiStepsPanel';

export interface UseTaskCreateResult {
  title: string;
  notes: string;
  notesOpen: boolean;
  dueDate: string | undefined;
  steps: DraftStep[];
  stepSheet: null | { mode: 'create' } | { mode: 'edit'; key: string };
  stepSheetError: string | null;
  ordenarVisible: boolean;
  discardOpen: boolean;
  skipGuardRef: React.MutableRefObject<boolean>;
  hasUnsaved: boolean;
  isLongTitle: boolean;
  canOrder: boolean;
  canSave: boolean;
  canSaveAndStart: boolean;
  isSaving: boolean;
  saveError: string | null;
  editingStep: DraftStep | null;
  setTitle: (v: string) => void;
  setNotes: (v: string) => void;
  setNotesOpen: (v: boolean) => void;
  setDueDate: (v: string | undefined) => void;
  setStepSheet: (v: null | { mode: 'create' } | { mode: 'edit'; key: string }) => void;
  setOrdenarVisible: (v: boolean) => void;
  setDiscardOpen: (v: boolean) => void;
  openCreateSheet: () => void;
  openEditSheet: (key: string) => void;
  closeStepSheet: () => void;
  saveStepSheet: (values: { title: string; duration: number; status: 'pending' | 'completed' }) => void;
  removeStep: (key: string) => void;
  handleOrdenarDone: (orderedKeys: string[]) => void;
  save: () => Promise<Task | null>;
  aiStatus: AiStatus;
  aiSuggestions: SuggestedStep[] | null;
  aiMessage: string | null;
  suggestSteps: () => Promise<void>;
  acceptAiSteps: () => void;
  discardAiSteps: () => void;
}

export function useTaskCreate(): UseTaskCreateResult {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [stepSheet, setStepSheet] = useState<null | { mode: 'create' } | { mode: 'edit'; key: string }>(null);
  const [stepSheetError, setStepSheetError] = useState<string | null>(null);
  const [ordenarVisible, setOrdenarVisible] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const skipGuardRef = useRef(false);
  const stepSeq = useRef(0);
  const savingRef = useRef(false);

  const hasUnsaved = title.trim().length > 0 || notes.trim().length > 0 || dueDate !== undefined || steps.length > 0;
  const isLongTitle = isLongTitleFn(title);
  const canOrder = canOrderSteps(steps.length);
  const { canSave, canSaveAndStart } = getCreateActions({ title, stepsCount: steps.length, isSaving });

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
    // En Crear todo paso es 'pending': se ignora el selector del sheet.
    const valuesWithPending = { ...values, status: 'pending' as const };
    const nextSteps = applyStepSheetResult(steps, target, valuesWithPending, newKey);
    setSteps(nextSteps);
    setStepSheet(null);
    setStepSheetError(null);
  }, [stepSheet, steps]);

  const removeStep = useCallback((key: string) => {
    setSteps((prev) => prev.filter((st) => st.key !== key));
  }, []);

  const handleOrdenarDone = useCallback((orderedKeys: string[]) => {
    setSteps(reorderByKeys(steps, orderedKeys));
    setOrdenarVisible(false);
  }, [steps]);

  const aiHook = useAiSteps({
    title,
    notes,
    getVisibleStepNames: () => steps.map((st) => st.name),
    getSeq: () => stepSeq.current,
    onAppend: (nextSteps, nextSeq) => {
      stepSeq.current = nextSeq;
      setSteps((prev) => [...prev, ...nextSteps]);
    },
  });
  const { aiStatus, aiSuggestions, aiMessage, suggestSteps, acceptAiSteps, discardAiSteps } = aiHook;

  const save = useCallback(async (): Promise<Task | null> => {
    if (savingRef.current) return null;
    const validation = validateTaskEdit(title);
    if (!validation.ok) {
      setSaveError(validation.error ?? 'Error de validación');
      return null;
    }
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = buildCreatePayload({ title, notes, dueDate, steps });
      // REQUIERE MIGRACIÓN: createWithSteps no usa transacción (si falla a mitad queda la tarea con pasos parciales).
      const created = await TaskService.createWithSteps(payload.input, payload.steps);
      return created;
    } catch {
      setSaveError(taskCreateCopy.saveError);
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, [title, notes, dueDate, steps]);

  return {
    title,
    notes,
    notesOpen,
    dueDate,
    steps,
    stepSheet,
    stepSheetError,
    ordenarVisible,
    discardOpen,
    skipGuardRef,
    hasUnsaved,
    isLongTitle,
    canOrder,
    canSave,
    canSaveAndStart,
    isSaving,
    saveError,
    editingStep,
    setTitle,
    setNotes,
    setNotesOpen,
    setDueDate,
    setStepSheet,
    setOrdenarVisible,
    setDiscardOpen,
    openCreateSheet,
    openEditSheet,
    closeStepSheet,
    saveStepSheet,
    removeStep,
    handleOrdenarDone,
    save,
    aiStatus,
    aiSuggestions,
    aiMessage,
    suggestSteps,
    acceptAiSteps,
    discardAiSteps,
  };
}
