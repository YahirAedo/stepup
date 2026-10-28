import { useCallback } from 'react';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTaskDetail } from './hooks/useTaskDetail';
import TasksOrderView from './views/TasksOrderView';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskOrder'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskOrderScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const pendingDeleteIds = route.params.pendingDeleteIds ?? [];
  const {
    steps,
    selectedStepId,
    previousOrder,
    selectStep,
    undoReorder,
  } = useTaskDetail(taskId);

  const handleSelectStep = useCallback((stepId: number) => {
    selectStep(stepId, pendingDeleteIds);
  }, [selectStep, pendingDeleteIds]);

  const handleUndoReorder = useCallback(async () => {
    await undoReorder();
  }, [undoReorder]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <TasksOrderView
        steps={steps}
        pendingDeleteIds={pendingDeleteIds}
        selectedStepId={selectedStepId}
        previousOrder={previousOrder}
        onSelectStep={handleSelectStep}
        onUndoReorder={handleUndoReorder}
        onClose={handleClose}
      />
    </View>
  );
}
