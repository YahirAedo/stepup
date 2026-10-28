import { useCallback } from 'react';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useTaskDetail } from './hooks/useTaskDetail';
import TaskDetailView from './views/TaskDetailView';
import EditarPasoSheet from '../../components/ui/EditarPasoSheet';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';
import type { Step } from '../../types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const {
    task,
    steps,
    loadError,
    editError,
    pendingDeleteIds,
    canShowReorder,
    editSheetVisible,
    editStep,
    toggleDeleteStep,
    openEditSheet,
    closeEditSheet,
    saveEdit,
    loadData,
  } = useTaskDetail(taskId);

  const handleOpenOrder = useCallback(() => {
    navigation.navigate('TaskOrder', {
      taskId,
      pendingDeleteIds,
    });
  }, [navigation, taskId, pendingDeleteIds]);

  const handleOpenEditSheet = useCallback((step: Step) => {
    openEditSheet(step);
  }, [openEditSheet]);

  if (!task && !loadError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <TaskDetailView
        task={task ?? undefined}
        steps={steps}
        pendingDeleteIds={pendingDeleteIds}
        canShowReorder={canShowReorder}
        onDeleteStep={toggleDeleteStep}
        onUndoDelete={toggleDeleteStep}
        onOpenEditSheet={handleOpenEditSheet}
        onOrderSteps={handleOpenOrder}
        onAddStep={() => {
          // 3c: navegar a Crear/Editar paso
        }}
        error={loadError}
        onRetry={() => {
          void loadData();
        }}
      />
      {editSheetVisible && editStep && task && (
        <EditarPasoSheet
          visible={editSheetVisible}
          onClose={closeEditSheet}
          onSave={saveEdit}
          taskTitle={task.name}
          initialTitle={editStep.name}
          initialDuration={editStep.duration_min ?? 0}
          position={editStep.order_index + 1}
          total={steps.length}
          error={editError}
        />
      )}
    </View>
  );
}
