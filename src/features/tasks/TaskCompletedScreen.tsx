import React from 'react';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTaskCompleted } from './hooks/useTaskCompleted';
import TaskCompletedView from './views/TaskCompletedView';
import type { TasksStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskCompleted'>;

export default function TaskCompletedScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { summary, loading, loadError } = useTaskCompleted(taskId);

  const handlePrimaryPress = () => {
    navigation.popToTop();
  };

  return (
    <TaskCompletedView
      summary={summary}
      loading={loading}
      loadError={loadError}
      onPrimaryPress={handlePrimaryPress}
    />
  );
}
