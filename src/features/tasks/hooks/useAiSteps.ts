import { useCallback, useState, useRef } from 'react';
import { AIService, aiErrorMessage } from '../../../services/AIService';
import { getAiAvailability } from '../logic/getAiAvailability';
import { mergeSuggestedSteps } from '../logic/mergeSuggestedSteps';
import { buildNewDraftSteps } from '../logic/buildNewDraftSteps';
import { buildAiDescription } from '../logic/buildAiDescription';
import { appendProposedNames } from '../logic/appendProposedNames';
import { taskEditCopy } from '../logic/taskEditCopy';
import { hasSession } from '../../../services/session';
import { useIsOnline } from '../../../hooks/useIsOnline';
import type { DraftStep } from './draftStep';
import type { SuggestedStep } from '../../../types';
import type { AiStatus } from '../../../components/ui/AiStepsPanel';

export interface UseAiStepsParams {
  title: string;
  notes: string;
  getVisibleStepNames: () => string[];
  getSeq: () => number;
  onAppend: (steps: DraftStep[], nextSeq: number) => void;
}

export function useAiSteps({ title, notes, getVisibleStepNames, getSeq, onAppend }: UseAiStepsParams) {
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [aiSuggestions, setAiSuggestions] = useState<SuggestedStep[] | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const isOnline = useIsOnline();
  const requestRef = useRef(0);
  const proposedRef = useRef<string[]>([]);

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
      const existingNames = getVisibleStepNames();
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
  }, [aiStatus, isOnline, title, notes, getVisibleStepNames]);

  const acceptAiSteps = useCallback(() => {
    if (!aiSuggestions || aiSuggestions.length === 0) {
      setAiStatus('idle');
      setAiMessage(taskEditCopy.ai.allDuplicated);
      setAiSuggestions(null);
      return;
    }
    const existingNames = getVisibleStepNames();
    const merged = mergeSuggestedSteps(existingNames, aiSuggestions);
    if (merged.steps.length === 0) {
      setAiStatus('idle');
      setAiSuggestions(null);
      setAiMessage(taskEditCopy.ai.allDuplicated);
      return;
    }
    const currentSeq = getSeq();
    const built = buildNewDraftSteps(currentSeq, merged.steps.map((s) => ({ name: s.name, duration: s.duration })));
    onAppend(built.steps, built.nextSeq);
    setAiSuggestions(null);
    setAiStatus('idle');
    setAiMessage(merged.skipped > 0 ? taskEditCopy.ai.allDuplicated : null);
  }, [aiSuggestions, getVisibleStepNames, getSeq, onAppend]);

  const discardAiSteps = useCallback(() => {
    setAiSuggestions(null);
    setAiStatus('idle');
    setAiMessage(null);
  }, []);

  return {
    aiStatus,
    aiSuggestions,
    aiMessage,
    suggestSteps,
    acceptAiSteps,
    discardAiSteps,
  };
}
