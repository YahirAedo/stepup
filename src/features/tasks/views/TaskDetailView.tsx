import React from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
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
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { getTaskDetailDateLabel } from '../../../features/tasks/logic/getTaskDetailDateLabel';
import { getDetailFooterMode } from '../../../features/tasks/logic/getDetailFooterMode';
import { getCompleteAllPlan } from '../../../features/tasks/logic/getCompleteAllPlan';
import { taskDetailCopy } from '../../../features/tasks/logic/taskDetailCopy';
import type { Task, Step } from '../../../types';
import { getProgressBar } from '../../../features/tasks/logic/getProgressBar';
import type { ProgressBarResult } from '../../../features/tasks/logic/getProgressBar';

export interface TaskDetailViewProps {
  task?: Task;
  steps: ReadonlyArray<Step>;
  onAddStep: () => void;
  error: string | null;
  onRetry: () => void;
  onContinue: () => void;
  onCompleteAll: () => Promise<void>;
  onReopenAll: () => Promise<void>;
  isBusy: boolean;
  actionError: string | null;
  onDismissActionError: () => void;
}

export default function TaskDetailView({
  task,
  steps,
  onAddStep,
  error,
  onRetry,
  onContinue,
  onCompleteAll,
  onReopenAll,
  isBusy,
  actionError,
  onDismissActionError,
}: TaskDetailViewProps) {
  const { scale: s } = useResponsive();

  const completedCount = steps.filter((step) => step.status === 'completed').length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const progressResult: ProgressBarResult = getProgressBar(steps);
  const footerMode = getDetailFooterMode(steps);
  const pendingCount = getCompleteAllPlan(steps).pendingCount;

  const [completeOpen, setCompleteOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);

  if (!task) {
    if (error) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: sereneSpacing.margin,
            paddingBottom: sereneSpacing['space-lg'],
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
          paddingBottom: sereneSpacing['space-lg'],
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

  const handleCompletePress = () => {
    setCompleteOpen(true);
  };

  const handleReopenPress = () => {
    setReopenOpen(true);
  };

  const handleCompleteConfirm = () => {
    setCompleteOpen(false);
    void onCompleteAll();
  };

  const handleReopenConfirm = () => {
    setReopenOpen(false);
    void onReopenAll();
  };

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
                accessibilityLabel={taskDetailCopy.addFirstStep.trim()}
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
                  {taskDetailCopy.addFirstStep.trim()}
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
                  pendingDelete={false}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Error de acción */}
      {actionError != null && (
        <View style={{ paddingHorizontal: sereneSpacing.margin, gap: sereneSpacing['space-xs'] }}>
          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <RNText
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors.error }]}
              accessibilityLiveRegion="polite"
            >
              {actionError}
            </RNText>
          </View>
          <Pressable
            onPress={onDismissActionError}
            accessibilityRole="button"
            accessibilityLabel="Eliminar error"
            style={({ pressed }) => ({
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              borderWidth: 1,
              borderColor: sereneColors.outline,
              backgroundColor: sereneColors.surface,
              opacity: pressed ? 0.9 : 1,
              paddingHorizontal: sereneSpacing['space-sm'],
            })}
          >
            <RNText
              style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {taskDetailCopy.dismissError.trim()}
            </RNText>
          </Pressable>
        </View>
      )}

      {/* Pie de acciones */}
      {footerMode !== 'none' && (
        <View
          style={{
            paddingHorizontal: sereneSpacing.margin,
            paddingTop: sereneSpacing['space-sm'],
            paddingBottom: sereneSpacing['space-lg'],
            gap: sereneSpacing['space-sm'],
            backgroundColor: sereneColors.surface,
          }}
        >
          {footerMode === 'active' && (
            <Pressable
              onPress={isBusy ? undefined : onContinue}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={taskDetailCopy.footer.continue}
              accessibilityState={{ disabled: isBusy }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(6),
                minHeight: s(48),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors.primary,
                opacity: isBusy ? 0.5 : pressed ? 0.9 : 1,
                paddingHorizontal: sereneSpacing['space-sm'],
              })}
            >
              <RNText
                style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}
              >
                {taskDetailCopy.footer.continue}
              </RNText>
            </Pressable>
          )}

          {(footerMode === 'active' || footerMode === 'completed') && (
            <>
              {footerMode === 'active' ? (
                <Pressable
                  onPress={isBusy ? undefined : handleCompletePress}
                  disabled={isBusy}
                  accessibilityRole="button"
                  accessibilityLabel={taskDetailCopy.footer.completeAll}
                  accessibilityState={{ disabled: isBusy }}
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
                    opacity: isBusy ? 0.5 : pressed ? 0.9 : 1,
                    paddingHorizontal: sereneSpacing['space-sm'],
                  })}
                >
                  <MaterialCommunityIcons name={mci('check')} size={s(20)} color={sereneColors.primary} />
                  <RNText
                    style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
                  >
                    {taskDetailCopy.footer.completeAll}
                  </RNText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={isBusy ? undefined : handleReopenPress}
                  disabled={isBusy}
                  accessibilityRole="button"
                  accessibilityLabel={taskDetailCopy.footer.reopen}
                  accessibilityState={{ disabled: isBusy }}
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
                    opacity: isBusy ? 0.5 : pressed ? 0.9 : 1,
                    paddingHorizontal: sereneSpacing['space-sm'],
                  })}
                >
                  <MaterialCommunityIcons name={mci('undo')} size={s(20)} color={sereneColors.primary} />
                  <RNText
                    style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
                  >
                    {taskDetailCopy.footer.reopen}
                  </RNText>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}

      {/* Diálogos */}
      <ConfirmDialog
        visible={completeOpen}
        title={taskDetailCopy.completeDialog.title}
        body={taskDetailCopy.getCompleteDialogBody(pendingCount)}
        confirmLabel={taskDetailCopy.completeDialog.confirm.trim()}
        cancelLabel={taskDetailCopy.completeDialog.cancel.trim()}
        destructive={false}
        onConfirm={handleCompleteConfirm}
        onClose={() => setCompleteOpen(false)}
      />
      <ConfirmDialog
        visible={reopenOpen}
        title={taskDetailCopy.reopenDialog.title}
        body={taskDetailCopy.reopenDialog.body}
        confirmLabel={taskDetailCopy.reopenDialog.confirm.trim()}
        cancelLabel={taskDetailCopy.reopenDialog.cancel.trim()}
        destructive={false}
        onConfirm={handleReopenConfirm}
        onClose={() => setReopenOpen(false)}
      />
    </View>
  );
}
