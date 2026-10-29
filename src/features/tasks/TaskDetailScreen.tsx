import { useCallback, useEffect } from 'react';
import { type CompositeScreenProps } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTaskDetail } from './hooks/useTaskDetail';
import TaskDetailView from './views/TaskDetailView';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
} from '../../theme/serene';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { task, steps, loadError, loadData } = useTaskDetail(taskId);

  const handleOpenEdit = useCallback(() => {
    navigation.navigate('TaskEdit', { taskId });
  }, [navigation, taskId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }: { tintColor?: string }) => (
        <Pressable
          onPress={handleOpenEdit}
          accessibilityRole="button"
          accessibilityLabel="Editar tarea"
          style={({ pressed }) => ({
            minWidth: 48,
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <MaterialCommunityIcons
            name={mci('edit')}
            size={24}
            color={tintColor ?? sereneColors['inverse-on-surface']}
          />
        </Pressable>
      ),
    });
  }, [navigation, handleOpenEdit]);

  const handleAddStep = useCallback(() => {
    navigation.navigate('TaskEdit', { taskId });
  }, [navigation, taskId]);

  if (!task && !loadError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <TaskDetailView
        task={task ?? undefined}
        steps={steps}
        onAddStep={handleAddStep}
        error={loadError}
        onRetry={() => {
          void loadData();
        }}
      />
    </View>
  );
}