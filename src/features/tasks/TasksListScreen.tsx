import { useCallback, useState } from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { useTasksList } from './hooks/useTasksList';
import TasksListView from './views/TasksListView';
import type { TaskListModel } from './logic/buildTasksListModel';
import type { TasksStackParamList } from '../../types/navigation';

export default function TasksListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<'inProgress' | 'notStarted' | 'completed'>('inProgress');
  const { refresh } = useTasksList();
  const [model, setModel] = useState<TaskListModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(async () => {
    try {
      setError(null);
      const m = await refresh();
      setModel(m);
    } catch {
      setError('No se pudieron cargar las tareas');
    }
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void handleLoad();
    }, [handleLoad]),
  );

  const handleOpenTask = useCallback((taskId: number) => {
    navigation.navigate('TaskDetail', { taskId });
  }, [navigation]);

  if (error) {
    const { scale: s } = useResponsive();
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing.margin,
        }}
      >
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}
        >
          {error}
        </RNText>
        <Pressable
          onPress={handleLoad}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          style={({ pressed }) => ({
            minWidth: s(48),
            minHeight: s(48),
            marginTop: sereneSpacing['space-md'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['primary-container'],
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: sereneSpacing['space-sm'],
          })}
        >
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}
          >
            Reintentar
          </RNText>
        </Pressable>
      </View>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <TasksListView
      model={model}
      activeFilter={activeFilter}
      onFilterChange={(key) => setActiveFilter(key)}
      onCreateTask={() => {
        // REQUIERE MIGRACIÓN: pantalla Crear/Editar es 3c
      }}
      onOpenTask={handleOpenTask}
      onResumeFocus={() => {
        // REQUIERE MIGRACIÓN: pantalla Foco queda para su fase
      }}
    />
  );
}
