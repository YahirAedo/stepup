import React from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '../../../theme/serene';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import StepRow from '../../../components/ui/StepRow';
import TaskProgressBar from '../../../components/ui/TaskProgressBar';
import { getTaskDetailDateLabel } from '../../../features/tasks/logic/getTaskDetailDateLabel';
import type { Task, Step } from '../../../types';
import { getProgressBar } from '../../../features/tasks/logic/getProgressBar';
import type { ProgressBarResult } from '../../../features/tasks/logic/getProgressBar';

export interface TaskDetailViewProps {
  task?: Task;
  steps: ReadonlyArray<Step>;
  pendingDeleteIds: ReadonlyArray<number>;
  canShowReorder: boolean;
  onDeleteStep: (stepId: number) => void;
  onUndoDelete: (stepId: number) => void;
  onOpenEditSheet: (step: Step) => void;
  onOrderSteps: () => void;
  onAddStep: () => void;
  error: string | null;
  onRetry: () => void;
}

export default function TaskDetailView({
  task,
  steps,
  pendingDeleteIds,
  canShowReorder,
  onDeleteStep,
  onUndoDelete,
  onOpenEditSheet,
  onOrderSteps,
  onAddStep,
  error,
  onRetry,
}: TaskDetailViewProps) {
  const { scale: s } = useResponsive();

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const hasPending = steps.some(
    (step) => step.status === 'pending' && !pendingDeleteIds.includes(step.id),
  );
  const deletedSteps = steps.filter((step) => pendingDeleteIds.includes(step.id));

  const isDeleted = (stepId: number) => pendingDeleteIds.includes(stepId);

  const progressResult: ProgressBarResult = getProgressBar(steps);

  if (!task) {
    if (error) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: sereneSpacing.margin,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <RNText
              style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {error}
            </RNText>
          </View>
          <Pressable
            onPress={onRetry}
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
    return null;
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing.margin,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <RNText
            style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {error}
          </RNText>
        </View>
        <Pressable
          onPress={onRetry}
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

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: sereneSpacing['space-md'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
            <MaterialCommunityIcons
              name={mci('flag')}
              size={s(16)}
              color={sereneColors['on-surface-variant']}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
              ]}
            >
              Tarea
            </RNText>
          </View>
          <RNText
            style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {task.name}
          </RNText>
          {task.description ? (
            <RNText
              style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {task.description}
            </RNText>
          ) : null}
          {getTaskDetailDateLabel(task) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
              <MaterialCommunityIcons
                name={mci('calendar_today')}
                size={s(14)}
                color={sereneColors['on-surface-variant']}
              />
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {getTaskDetailDateLabel(task)}
              </RNText>
            </View>
          )}
        </View>

        {/* Progreso */}
        <View style={{ gap: sereneSpacing['space-sm'], marginTop: sereneSpacing['space-md'] }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <RNText
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              Progreso
            </RNText>
            <RNText
              style={[sereneTypography['headline-md'] as TextStyle, { color: sereneColors.primary }]}
            >
              {Math.round(progress * 100)}%
            </RNText>
          </View>
          <TaskProgressBar progress={progressResult} height={s(8)} />
        </View>

        {/* Pasos */}
        <View style={{ gap: sereneSpacing['space-sm'], marginTop: sereneSpacing['space-md'] }}>
          <RNText
            style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            Pasos
          </RNText>

          {totalCount === 0 ? (
            <View
              style={{
                alignItems: 'center',
                paddingVertical: sereneSpacing['space-lg'],
                gap: sereneSpacing['space-sm'],
              }}
            >
              <MaterialCommunityIcons
                name={mci('task_alt')}
                size={s(40)}
                color={sereneColors['on-surface-variant']}
              />
              <RNText
                style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                Esta tarea no tiene pasos todavía.
              </RNText>
              <Pressable
                onPress={onAddStep}
                accessibilityRole="button"
                accessibilityLabel="Agregar primer paso"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: s(6),
                  minHeight: s(48),
                  borderRadius: sereneBorderRadius.lg,
                  borderWidth: 1,
                  borderColor: sereneColors.outline,
                  backgroundColor: sereneColors.surface,
                  opacity: pressed ? 0.9 : 1,
                  paddingHorizontal: sereneSpacing['space-sm'],
                })}
              >
                <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors.primary} />
                <RNText
                  style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
                >
                  Agregar paso
                </RNText>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              {steps.map((step) => (
                <StepRow
                  key={step.id}
                  name={step.name}
                  durationMin={step.duration_min ?? null}
                  completed={step.status === 'completed'}
                  pendingDelete={isDeleted(step.id)}
                  onPress={() => onOpenEditSheet(step)}
                  onDelete={() => onDeleteStep(step.id)}
                  onUndoDelete={() => onUndoDelete(step.id)}
                />
              ))}
              {deletedSteps.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: s(6),
                    marginTop: sereneSpacing['space-xs'],
                    paddingHorizontal: sereneSpacing['space-sm'],
                  }}
                >
                  <MaterialCommunityIcons
                    name={mci('delete')}
                    size={s(14)}
                    color={sereneColors['on-surface-variant']}
                  />
                  <RNText
                    style={[
                      sereneTypography['caption'] as TextStyle,
                      { color: sereneColors['on-surface-variant'] },
                    ]}
                  >
                    {deletedSteps.length} paso(s) marcado(s) para borrado. Se aplicará al salir.
                  </RNText>
                </View>
              )}
            </View>
          )}

          {hasPending && canShowReorder && (
            <Pressable
              onPress={onOrderSteps}
              accessibilityRole="button"
              accessibilityLabel="Ordenar pasos"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(6),
                minHeight: s(48),
                marginTop: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-high'],
                opacity: pressed ? 0.85 : 1,
                paddingHorizontal: sereneSpacing['space-sm'],
              })}
            >
              <MaterialCommunityIcons name={mci('swap_vert')} size={s(18)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
              >
                Ordenar pasos
              </RNText>
            </Pressable>
          )}

          <Pressable
            onPress={onAddStep}
            accessibilityRole="button"
            accessibilityLabel="Agregar paso"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(6),
              marginTop: sereneSpacing['space-sm'],
              minHeight: s(48),
              borderRadius: sereneBorderRadius.lg,
              borderWidth: 1,
              borderColor: sereneColors.outline,
              backgroundColor: sereneColors.surface,
              opacity: pressed ? 0.9 : 1,
              paddingHorizontal: sereneSpacing['space-sm'],
            })}
          >
            <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors.primary} />
            <RNText
              style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
            >
              Agregar paso
            </RNText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
