import React from 'react';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTaskCompleted } from './hooks/useTaskCompleted';
import TaskCompletedView from './views/TaskCompletedView';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskCompleted'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskCompletedScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { summary, loading, loadError } = useTaskCompleted(taskId);

  const handlePrimaryPress = () => {
    navigation.popToTop();
  };

  const handleSecondaryPress = () => {
    navigation.popToTop();
    navigation.navigate('Focus', { screen: 'FocusMain', initial: false });
  };

  return (
    <TaskCompletedView
      summary={summary}
      loading={loading}
      loadError={loadError}
      onPrimaryPress={handlePrimaryPress}
      onSecondaryPress={handleSecondaryPress}
    />
  );
}
