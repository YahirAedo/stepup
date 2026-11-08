import React from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  ActivityIndicator,
  type TextStyle,
} from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import { focusCopy } from '../logic/focusCopy';
import { buildFocusViewModel } from '../logic/buildFocusViewModel';
import FocusEmptyView from '../../../components/ui/FocusEmptyView';
import type { FocusEmptyState } from '../logic/buildFocusEmptyState';
import { buildStepProgress } from '../logic/buildStepProgress';
import FocusStepCard from '../../../components/ui/FocusStepCard';
import FocusQueue from '../../../components/ui/FocusQueue';
import FocusTaskSwitcher from '../../../components/ui/FocusTaskSwitcher';

export interface FocusViewProps {
  status: 'loading' | 'ready' | 'empty' | 'error';
  viewModel: ReturnType<typeof buildFocusViewModel> | null;
  emptyState: FocusEmptyState | null;
  errorMessage: string | null;
  onRetry: () => void;
  onCreateTask: () => void;
  onOpenCompleted: () => void;
  onOpenTasks: () => void;
  onAddSteps: (taskId: number) => void;
  onStart: () => void;
  onPostpone: () => void;
  onEditTask: () => void;
  onSelectTask: (taskId: number) => void;
}

export default function FocusView({
  status,
  viewModel,
  emptyState,
  errorMessage,
  onRetry,
  onCreateTask,
  onOpenCompleted,
  onOpenTasks,
  onAddSteps,
  onStart,
  onPostpone,
  onEditTask,
  onSelectTask,
}: FocusViewProps) {
  const { scale: s } = useResponsive();

  if (status === 'loading') {
    return (
      <View
        accessible
        accessibilityLabel={focusCopy.loading}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors.surface,
        }}
      >
        <ActivityIndicator
          color={sereneColors.primary}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], marginTop: sereneSpacing['space-sm'] }]}
        >
          {focusCopy.loading}
        </RNText>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          backgroundColor: sereneColors.surface,
          gap: sereneSpacing['space-md'],
        }}
      >
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}
        >
          {errorMessage ?? focusCopy.loadError}
        </RNText>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={focusCopy.retry}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            paddingHorizontal: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {focusCopy.retry}
          </RNText>
        </Pressable>
      </View>
    );
  }

  if (status === 'empty' || !viewModel) {
    const state = emptyState ?? { kind: 'no-tasks' as const, taskIds: [] };
    const onPrimary = () => {
      if (state.kind === 'no-tasks' || state.kind === 'all-done') {
        onCreateTask();
      } else if (state.kind === 'needs-steps') {
        if (state.taskIds.length === 1) {
          onAddSteps(state.taskIds[0]);
        } else {
          onOpenTasks();
        }
      }
    };
    const onSecondary =
      state.kind === 'no-tasks'
        ? undefined
        : state.kind === 'needs-steps'
          ? state.taskIds.length === 1
            ? onOpenTasks
            : onCreateTask
          : onOpenCompleted;

    return (
      <FocusEmptyView
        emptyState={state}
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />
    );
  }

  const step = viewModel.step;
  const switcher = viewModel.switcher;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <FocusStepCard
          stepIndex={step.stepIndex}
          totalSteps={step.totalSteps}
          minutes={step.minutes}
          title={step.title}
          taskName={viewModel.taskName}
          progress={buildStepProgress(step.stepIndex, step.totalSteps)}
          onStart={onStart}
          onPostpone={viewModel.canPostpone ? onPostpone : undefined}
        />

        <FocusQueue items={viewModel.queue} onEdit={onEditTask} />

        {switcher.show ? (
          <FocusTaskSwitcher
            active={switcher.active!}
            alternatives={switcher.alternatives}
            pendingCount={switcher.pendingCount}
            onSelect={onSelectTask}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
