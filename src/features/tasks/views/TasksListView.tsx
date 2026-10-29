import React, { useCallback } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import TaskCard from '../../../components/ui/TaskCard';
import FocusTaskCard from '../../../components/ui/FocusTaskCard';
import FilterPills from '../../../components/ui/FilterPills';
import type { TaskCategory } from '../../../utils/designlab/deriveTaskCategory';
import type { TaskListModel } from '../logic/buildTasksListModel';
import { formatDateShort } from '../logic/formatDateShort';
import { getVisibleQueue } from '../logic/getVisibleQueue';
import { getCategoryLabels } from '../logic/getCategoryLabels';

export interface TasksListViewProps {
  model: TaskListModel;
  activeFilter: TaskCategory;
  onFilterChange: (key: TaskCategory) => void;
  onCreateTask: () => void;
  onOpenTask: (taskId: number) => void;
  onResumeFocus: () => void;
}

const CATEGORY_ORDER: TaskCategory[] = ['inProgress', 'notStarted', 'completed'];

export default function TasksListView({
  model,
  activeFilter,
  onFilterChange,
  onCreateTask,
  onOpenTask,
  onResumeFocus,
}: TasksListViewProps) {
  const { scale: s } = useResponsive();

  const { counts } = model;
  const { focusItem, queue, isEmpty } = getVisibleQueue(model, activeFilter);

  const focusPendingStep = focusItem?.steps.find((step) => !step.done);
  const focusStepTitle = focusPendingStep
    ? focusPendingStep.title
    : `Paso ${(focusItem?.completedStepCount ?? 0) + 1}`;

  const labels = getCategoryLabels();

  const filterOptions = CATEGORY_ORDER.map((key) => ({
    key,
    label: labels.pills[key],
    count: counts[key],
    isActive: key === activeFilter,
  }));

  const handleFilterChange = useCallback((key: TaskCategory) => {
    onFilterChange(key);
  }, [onFilterChange]);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sereneSpacing.margin, paddingTop: sereneSpacing['space-sm'], gap: sereneSpacing['space-sm'] }}>
        <RNText
          style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          Tareas
        </RNText>
        <Pressable
          onPress={onCreateTask}
          accessibilityRole="button"
          accessibilityLabel="Nueva tarea"
          style={({ pressed }) => ({
            minWidth: s(48),
            minHeight: s(48),
            paddingHorizontal: sereneSpacing['space-sm'],
            paddingVertical: s(8),
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <FilterPills
          options={filterOptions}
          activeKey={activeFilter}
          onChange={(key) => handleFilterChange(key)}
          accessibilityLabel="Filtros de tareas"
        />

        {focusItem && activeFilter === 'inProgress' && (
          <FocusTaskCard
            badge="En foco"
            minutesLabel={undefined}
            title={focusItem.name}
            stepTitle={focusStepTitle}
            primaryCta="Continuar"
            toggleOpen="Ver pasos"
            toggleClose="Ocultar pasos"
            steps={focusItem.steps}
            progress={focusItem.progress}
            taskId={focusItem.id}
            onOpenTask={onOpenTask}
            dueLabel={focusItem.targetDate ? formatDateShort(focusItem.targetDate) ?? undefined : undefined}
            onResume={onResumeFocus}
          />
        )}

        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <RNText
            style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
          >
            {labels.sections[activeFilter]}
          </RNText>

          <View style={{ gap: sereneSpacing['space-sm'] + 2 }}>
            {queue.length === 0 && isEmpty ? (
              <RNText
                style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {labels.emptyMessages[activeFilter]}
              </RNText>
            ) : (
              queue.map((item) => (
                <TaskCard key={item.id} item={item} onPress={onOpenTask} />
              ))
            )}
          </View>
        </View>

        <Pressable
          onPress={onCreateTask}
          accessibilityRole="button"
          accessibilityLabel="Crear tarea"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            minHeight: s(48),
            borderRadius: sereneBorderRadius.xl,
            borderWidth: 1,
            borderColor: sereneColors.outline,
            backgroundColor: sereneColors.surface,
            opacity: pressed ? 0.9 : 1,
            paddingHorizontal: sereneSpacing['space-sm'],
          })}
        >
          <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors.primary} />
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}>
            Crear tarea
          </RNText>
        </Pressable>

        <View
          style={{
            alignItems: 'center',
            paddingTop: sereneSpacing['space-xs'],
            paddingBottom: sereneSpacing['space-xs'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
            <MaterialCommunityIcons name={mci('spa')} size={s(14)} color={sereneColors['on-surface-variant']} />
            <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
              Una tarea a la vez. El resto se acomoda.
            </RNText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
