import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { FocusStackParamList, MainTabParamList } from '../../types/navigation';
import { useFocus } from './hooks/useFocus';
import { buildFocusViewModel } from './logic/buildFocusViewModel';
import FocusView from './views/FocusView';
import FocusRunningView from '../../components/ui/FocusRunningView';
import FocusStepCompleteView from '../../components/ui/FocusStepCompleteView';

type Props = CompositeScreenProps<
  NativeStackScreenProps<FocusStackParamList, 'FocusMain'>,
  BottomTabScreenProps<MainTabParamList>
>;

type Phase = 'previo' | 'corriendo' | 'completado';

export default function FocusMainScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<FocusStackParamList, 'FocusMain'>>();
  const {
    status,
    model,
    emptyState,
    errorMessage,
    reload,
    postpone,
    selectTask,
    timer,
    toggleTimer,
    extend,
    cancelTimer,
    completeStep,
    completing,
  } = useFocus({
    routeTaskId: route.params?.taskId,
    onRouteTaskConsumed: () => navigation.setParams({ taskId: undefined }),
  });

  const viewModel = useMemo(() => (model ? buildFocusViewModel(model) : null), [model]);

  const [phase, setPhase] = useState<Phase>('previo');
  const [completedSnapshot, setCompletedSnapshot] = useState<{
    stepTitle: string;
    minutes: number | null;
    nextStep: { name: string; minutes: number | null } | null;
  } | null>(null);

  useEffect(() => {
    if (status !== 'ready' || !model?.current) {
      setPhase('previo');
      setCompletedSnapshot(null);
    }
  }, [status, model]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('Tasks', { screen: 'TaskCreate', initial: false });
  }, [navigation]);

  const handleOpenCompleted = useCallback(() => {
    navigation.navigate('Tasks', { screen: 'TaskList', initial: false });
    // REQUIERE MIGRACIÓN: abrir el listado ya filtrado en Completadas
  }, [navigation]);

  const handleOpenTasks = useCallback(() => {
    navigation.navigate('Tasks', { screen: 'TaskList', initial: false });
  }, [navigation]);

  const handleAddSteps = useCallback(
    (taskId: number) => {
      navigation.navigate('Tasks', { screen: 'TaskEdit', params: { taskId }, initial: false });
    },
    [navigation],
  );

  const handleEditTask = useCallback(() => {
    if (!viewModel) return;
    navigation.navigate('Tasks', { screen: 'TaskEdit', params: { taskId: viewModel.taskId }, initial: false });
  }, [navigation, viewModel]);

  const handlePostpone = useCallback(() => {
    postpone();
  }, [postpone]);

  const handleSelectTask = useCallback((taskId: number) => {
    selectTask(taskId);
  }, [selectTask]);

  const handleRetry = useCallback(() => {
    reload();
  }, [reload]);

  const handleStart = useCallback(() => {
    if (!model?.current) return;
    setPhase('corriendo');
    toggleTimer();
  }, [model, toggleTimer]);

  const handleCancel = useCallback(() => {
    cancelTimer();
    setPhase('previo');
  }, [cancelTimer]);

  const handleComplete = useCallback(async () => {
    if (!model?.current || !viewModel) return;
    const current = model.current;
    const nextRaw = model.upcoming[0] ?? null;
    const snapshot = {
      stepTitle: current.name,
      minutes: current.duration_min,
      nextStep: nextRaw ? { name: nextRaw.name, minutes: nextRaw.duration_min } : null,
    };
    const result = await completeStep();
    if (!result) return;
    if (result.taskCompleted) {
      setPhase('previo');
      setCompletedSnapshot(null);
      navigation.navigate('Tasks', { screen: 'TaskCompleted', params: { taskId: result.taskId }, initial: false });
      return;
    }
    setCompletedSnapshot(snapshot);
    setPhase('completado');
  }, [model, viewModel, completeStep, navigation]);

  const handleContinue = useCallback(() => {
    setPhase('previo');
    setCompletedSnapshot(null);
  }, []);

  const handleGoTasks = useCallback(() => {
    setPhase('previo');
    setCompletedSnapshot(null);
    navigation.navigate('Tasks', { screen: 'TaskList', initial: false });
  }, [navigation]);

  if (status === 'ready' && phase === 'corriendo' && model?.current && viewModel) {
    return (
      <FocusRunningView
        taskName={viewModel.taskName}
        stepTitle={model.current.name}
        stepIndex={model.stepIndex}
        totalSteps={model.totalSteps}
        timer={timer}
        completing={completing}
        onToggle={toggleTimer}
        onExtend={extend}
        onComplete={() => {
          void handleComplete();
        }}
        onBack={handleCancel}
      />
    );
  }

  if (status === 'ready' && phase === 'completado' && completedSnapshot) {
    return (
      <FocusStepCompleteView
        stepTitle={completedSnapshot.stepTitle}
        minutes={completedSnapshot.minutes}
        nextStep={completedSnapshot.nextStep}
        onContinue={handleContinue}
        onGoTasks={handleGoTasks}
      />
    );
  }

  return (
    <FocusView
      status={status}
      viewModel={viewModel}
      emptyState={emptyState}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onCreateTask={handleCreateTask}
      onOpenCompleted={handleOpenCompleted}
      onOpenTasks={handleOpenTasks}
      onAddSteps={handleAddSteps}
      onStart={handleStart}
      onPostpone={handlePostpone}
      onEditTask={handleEditTask}
      onSelectTask={handleSelectTask}
    />
  );
}
