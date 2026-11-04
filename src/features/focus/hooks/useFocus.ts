import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../../../services/TaskService';
import { StepService } from '../../../services/StepService';
import { ProgressService } from '../../../services/ProgressService';
import { TimerService } from '../../../services/TimerService';
import { buildFocusModel } from '../logic/buildFocusModel';
import { getTimerAction } from '../logic/getTimerAction';
import { resolveStepMinutes, shouldKeepTimer, EXTEND_SECONDS } from '../logic/stepTimer';
import { focusCopy } from '../logic/focusCopy';
import {
  getManualTaskId,
  setManualTaskId,
  getPostponedIds,
  postponeInSession,
} from '../state/focusSession';
import type { Task, Step } from '../../../types';

export type FocusModel = NonNullable<ReturnType<typeof buildFocusModel<Task, Step>>>;

export interface FocusTimer {
  display: string;
  seconds: number;
  totalSeconds: number;
  started: boolean;
  running: boolean;
  finished: boolean;
}

export interface UseFocusResult {
  status: 'loading' | 'ready' | 'empty' | 'error';
  model: FocusModel | null;
  stepsToday: number;
  timer: FocusTimer;
  completing: boolean;
  errorMessage: string | null;
  toggleTimer: () => void;
  extend: () => void;
  cancelTimer: () => void;
  completeStep: () => Promise<{ taskId: number; taskCompleted: boolean } | null>;
  postpone: () => void;
  selectTask: (taskId: number) => void;
  reload: () => void;
}

const initialTimer = (model: FocusModel | null): FocusTimer => {
  const minutes = model?.current ? resolveStepMinutes(model.current.duration_min) : 0;
  const seconds = minutes * 60;
  return {
    display: TimerService.format(seconds),
    seconds,
    totalSeconds: seconds,
    started: false,
    running: false,
    finished: false,
  };
};

export function useFocus(options?: { routeTaskId?: number; onRouteTaskConsumed?: () => void }): UseFocusResult {
  const [status, setStatus] = useState<UseFocusResult['status']>('loading');
  const [model, setModel] = useState<FocusModel | null>(null);
  const [stepsToday, setStepsToday] = useState(0);
  const [timer, setTimer] = useState<FocusTimer>({ display: '00:00', seconds: 0, totalSeconds: 0, started: false, running: false, finished: false });
  const [completing, setCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const candidatesRef = useRef<Array<{ task: Task; steps: Step[] }> | null>(null);
  const completingRef = useRef(false);
  const isFirstLoad = useRef(true);
  const requestIdRef = useRef(0);
  const consumedRouteTaskRef = useRef<number | undefined>(undefined);
  const modelRef = useRef<FocusModel | null>(null);
  modelRef.current = model;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const timerRef = useRef(timer);
  timerRef.current = timer;

  const onTick = useCallback((s: { seconds: number; running: boolean; finished: boolean }) => {
    setTimer((t) => ({
      ...t,
      display: TimerService.format(s.seconds),
      seconds: s.seconds,
      running: s.running,
      finished: s.finished,
    }));
  }, []);

  const onFinish = useCallback(() => {
    setTimer((t) => ({ ...t, finished: true, running: false }));
  }, []);

  const load = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    const first = isFirstLoad.current;
    if (first) setStatus('loading');
    setErrorMessage(null);

    try {
      const opts = optionsRef.current;
      if (opts?.routeTaskId !== undefined && consumedRouteTaskRef.current !== opts.routeTaskId) {
        setManualTaskId(opts.routeTaskId);
        consumedRouteTaskRef.current = opts.routeTaskId;
        opts.onRouteTaskConsumed?.();
      }

      const tasks = await TaskService.getAll();
      const candidates: Array<{ task: Task; steps: Step[] }> = [];
      for (const task of tasks) {
        const steps = await StepService.getByTask(task.id);
        candidates.push({ task, steps });
      }
      if (reqId !== requestIdRef.current) return;

      candidatesRef.current = candidates;
      const nextModel = buildFocusModel(candidates, getManualTaskId(), getPostponedIds());

      const prevId = modelRef.current?.current?.id ?? null;
      const keep = shouldKeepTimer({
        started: timerRef.current.started,
        prevStepId: prevId,
        nextStepId: nextModel?.current?.id ?? null,
      });

      setModel(nextModel);
      if (!keep) {
        TimerService.stop();
        setTimer(initialTimer(nextModel));
      }

      const today = await ProgressService.getToday();
      if (reqId !== requestIdRef.current) return;
      setStepsToday(today);

      if (isFirstLoad.current) isFirstLoad.current = false;
      setStatus(nextModel ? 'ready' : 'empty');
    } catch {
      if (reqId !== requestIdRef.current) return;
      if (isFirstLoad.current) isFirstLoad.current = false;
      setStatus('error');
      setErrorMessage(focusCopy.loadError);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {
        const t = timerRef.current;
        if (t.started && !t.finished) {
          TimerService.pause();
          setTimer((prev) => ({ ...prev, running: false }));
        } else if (t.finished) {
          // conservar el estado "tiempo cumplido"
        } else {
          TimerService.stop();
          setTimer(initialTimer(modelRef.current));
        }
      };
    }, [load]),
  );

  const toggleTimer = useCallback(() => {
    if (!model?.current) return;
    setErrorMessage(null);
    const action = getTimerAction({ started: timer.started, running: timer.running, finished: timer.finished });
    if (action === 'start') {
      setTimer((t) => ({ ...t, started: true }));
      TimerService.start(resolveStepMinutes(model.current.duration_min), onTick, onFinish);
    } else if (action === 'pause') {
      TimerService.pause();
      setTimer((t) => ({ ...t, running: false }));
    } else if (action === 'resume') {
      TimerService.resume();
      setTimer((t) => ({ ...t, running: true }));
    }
  }, [model, timer, onTick, onFinish]);

  const extend = useCallback(() => {
    if (!timerRef.current.started) return;
    if (timerRef.current.finished) {
      TimerService.start(EXTEND_SECONDS / 60, onTick, onFinish);
      setTimer((t) => ({
        ...t,
        running: true,
        finished: false,
        seconds: EXTEND_SECONDS,
        totalSeconds: EXTEND_SECONDS,
        display: TimerService.format(EXTEND_SECONDS),
      }));
    } else {
      TimerService.addSeconds(EXTEND_SECONDS);
      setTimer((t) => ({ ...t, totalSeconds: t.totalSeconds + EXTEND_SECONDS }));
    }
  }, [onTick, onFinish]);

  const cancelTimer = useCallback(() => {
    TimerService.stop();
    setTimer(initialTimer(modelRef.current));
    setErrorMessage(null);
  }, []);

  const selectTask = useCallback(
    (taskId: number) => {
      setErrorMessage(null);
      setManualTaskId(taskId);
      TimerService.stop();
      const candidates = candidatesRef.current;
      if (!candidates) return;
      const nextModel = buildFocusModel(candidates, getManualTaskId(), getPostponedIds());
      setModel(nextModel);
      setTimer(initialTimer(nextModel));
    },
    [],
  );

  const postpone = useCallback(() => {
    if (!model?.canPostpone) return;
    setErrorMessage(null);
    postponeInSession(model.current.id);
    TimerService.stop();
    const candidates = candidatesRef.current;
    if (!candidates) return;
    const nextModel = buildFocusModel(candidates, getManualTaskId(), getPostponedIds());
    setModel(nextModel);
    setTimer(initialTimer(nextModel));
  }, [model]);

  const completeStep = useCallback(async () => {
    if (!model?.current) return null;
    if (completingRef.current) return null;
    completingRef.current = true;
    setCompleting(true);
    setErrorMessage(null);
    TimerService.stop();
    setTimer((t) => ({ ...t, started: false, running: false, finished: false }));

    const current = model.current;
    const taskId = model.task.id;
    try {
      const { taskCompleted } = await StepService.complete(current.id);
      if (taskCompleted) {
        completingRef.current = false;
        setCompleting(false);
        return { taskId, taskCompleted: true };
      }
      await load();
      completingRef.current = false;
      setCompleting(false);
      return { taskId, taskCompleted: false };
    } catch {
      completingRef.current = false;
      setCompleting(false);
      setErrorMessage(focusCopy.completeError);
      return null;
    }
  }, [model, load]);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  return {
    status,
    model,
    stepsToday,
    timer,
    completing,
    errorMessage,
    toggleTimer,
    extend,
    cancelTimer,
    completeStep,
    postpone,
    selectTask,
    reload,
  };
}
