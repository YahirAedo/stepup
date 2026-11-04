import React, { useCallback, useMemo } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { FocusStackParamList, MainTabParamList } from '../../types/navigation';
import { useFocus } from './hooks/useFocus';
import { buildFocusViewModel } from './logic/buildFocusViewModel';
import FocusView from './views/FocusView';

type Props = CompositeScreenProps<
  NativeStackScreenProps<FocusStackParamList, 'FocusMain'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function FocusMainScreen({ navigation }: Props) {
  const route = useRoute<RouteProp<FocusStackParamList, 'FocusMain'>>();
  const { status, model, errorMessage, reload, postpone, selectTask } = useFocus({
    routeTaskId: route.params?.taskId,
    onRouteTaskConsumed: () => navigation.setParams({ taskId: undefined }),
  });

  const viewModel = useMemo(() => (model ? buildFocusViewModel(model) : null), [model]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('Tasks', { screen: 'TaskCreate', initial: false });
  }, [navigation]);

  const handleOpenCompleted = useCallback(() => {
    navigation.navigate('Tasks', { screen: 'TaskList', initial: false });
    // REQUIERE MIGRACIÓN: abrir el listado ya filtrado en Completadas
  }, [navigation]);

  const handleEditTask = useCallback(() => {
    if (!viewModel) return;
    navigation.navigate('Tasks', { screen: 'TaskEdit', params: { taskId: viewModel.taskId }, initial: false });
  }, [navigation, viewModel]);

  const handleStart = useCallback(() => {
    // Lote 4d: iniciar el paso (timer).
  }, []);

  const handlePostpone = useCallback(() => {
    postpone();
  }, [postpone]);

  const handleSelectTask = useCallback((taskId: number) => {
    selectTask(taskId);
  }, [selectTask]);

  const handleRetry = useCallback(() => {
    reload();
  }, [reload]);

  return (
    <FocusView
      status={status}
      viewModel={viewModel}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onCreateTask={handleCreateTask}
      onOpenCompleted={handleOpenCompleted}
      onStart={handleStart}
      onPostpone={handlePostpone}
      onEditTask={handleEditTask}
      onSelectTask={handleSelectTask}
    />
  );
}