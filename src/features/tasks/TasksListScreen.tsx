import { useCallback, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
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
import { getInitialTaskFilter } from './logic/getInitialTaskFilter';
import type { TaskCategory } from '../../utils/designlab/deriveTaskCategory';
import type { TasksStackParamList, MainTabParamList } from '../../types/navigation';

export default function TasksListScreen() {
  const navigation = useNavigation<
    CompositeScreenProps<
      NativeStackScreenProps<TasksStackParamList, 'TaskList'>,
      BottomTabScreenProps<MainTabParamList>
    >['navigation']
  >();
  const [activeFilter, setActiveFilter] = useState<TaskCategory>('inProgress');
  const filterInitialized = useRef(false);
  const { refresh } = useTasksList();
  const [model, setModel] = useState<TaskListModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = useCallback(async () => {
    try {
      setError(null);
      const m = await refresh();
      setModel(m);
      if (!filterInitialized.current) {
        setActiveFilter(getInitialTaskFilter(m));
        filterInitialized.current = true;
      }
    } catch {
      setError('No se pudieron cargar las tareas');
    }
  }, [refresh]);

  const handleFilterChange = useCallback((key: TaskCategory) => {
    setActiveFilter(key);
    filterInitialized.current = true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      void handleLoad();
    }, [handleLoad]),
  );

  const handleOpenTask = useCallback((taskId: number) => {
    navigation.navigate('TaskDetail', { taskId });
  }, [navigation]);

  const handleCreateTask = useCallback(() => {
    navigation.navigate('TaskCreate');
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
      onFilterChange={handleFilterChange}
      onCreateTask={handleCreateTask}
      onOpenTask={handleOpenTask}
      onResumeFocus={(taskId) => {
        navigation.navigate('Focus', { screen: 'FocusMain', params: { taskId }, initial: false });
      }}
    />
  );
}
