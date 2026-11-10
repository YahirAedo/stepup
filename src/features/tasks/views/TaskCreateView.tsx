import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '../../../theme/serene';
import { sereneColors, sereneTypography, sereneSpacing, sereneBorderRadius, sereneShadows, withAlpha } from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import StepRow from '../../../components/ui/StepRow';
import DueDateField from '../../../components/ui/DueDateField';
import OrdenarPaso from '../../../components/ui/OrdenarPaso';
import EditarPasoSheet from '../../../components/ui/EditarPasoSheet';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import AiStepsPanel from '../../../components/ui/AiStepsPanel';
import type { SuggestedStep } from '../../../types';
import type { AiStatus } from '../../../components/ui/AiStepsPanel';
import { getStepSheetPosition } from '../logic/stepSheetResult';
import { taskEditCopy } from '../logic/taskEditCopy';
import { taskCreateCopy as f } from '../logic/taskCreateCopy';
import type { DraftStep } from '../hooks/draftStep';

export interface TaskCreateViewProps {
  title: string;
  notes: string;
  notesOpen: boolean;
  dueDate: string | undefined;
  steps: DraftStep[];
  stepSheet: null | { mode: 'create' } | { mode: 'edit'; key: string };
  stepSheetError: string | null;
  ordenarVisible: boolean;
  discardOpen: boolean;
  hasUnsaved: boolean;
  isLongTitle: boolean;
  canOrder: boolean;
  canSave: boolean;
  canSaveAndStart: boolean;
  isSaving: boolean;
  saveError: string | null;
  onTitleChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onNotesToggle: () => void;
  onDueDateChange: (v: string | undefined) => void;
  onOpenCreateSheet: () => void;
  onOpenEditSheet: (key: string) => void;
  onSaveEditStep: (values: { title: string; duration: number; status: 'pending' | 'completed' }) => void;
  onCloseEditSheet: () => void;
  onRemoveStep: (key: string) => void;
  onOrdenarDone: (orderedKeys: string[]) => void;
  onOrdenarVisibleChange: (visible: boolean) => void;
  onSave: () => void;
  onSaveAndStart: () => void;
  onDiscardConfirm: () => void;
  onDiscardClose: () => void;
  aiStatus: AiStatus;
  aiSuggestions: SuggestedStep[] | null;
  aiMessage: string | null;
  onSuggestSteps: () => void;
  onAcceptAiSteps: () => void;
  onDiscardAiSteps: () => void;
}

export default function TaskCreateView({
  title,
  notes,
  notesOpen,
  dueDate,
  steps,
  stepSheet,
  stepSheetError,
  ordenarVisible,
  discardOpen,
  isLongTitle: showLongTitle,
  canOrder,
  canSave,
  canSaveAndStart,
  isSaving,
  saveError,
  onTitleChange,
  onNotesChange,
  onNotesToggle,
  onDueDateChange,
  onOpenCreateSheet,
  onOpenEditSheet,
  onSaveEditStep,
  onCloseEditSheet,
  onRemoveStep,
  onOrdenarDone,
  onOrdenarVisibleChange,
  onSave,
  onSaveAndStart,
  onDiscardConfirm,
  onDiscardClose,
  aiStatus,
  aiSuggestions,
  aiMessage,
  onSuggestSteps,
  onAcceptAiSteps,
  onDiscardAiSteps,
}: TaskCreateViewProps) {
  const { scale: s } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const editStep = stepSheet?.mode === 'edit'
    ? (steps.find((st) => st.key === stepSheet.key) ?? null)
    : null;

  const stepSheetInitialTitle = stepSheet?.mode === 'edit' ? (editStep?.name ?? '') : '';
  const stepSheetInitialDuration = stepSheet?.mode === 'edit' ? (editStep?.duration_min ?? 3) : taskEditCopy.addInline.suggestedMinutes;
  const stepSheetInitialStatus = stepSheet?.mode === 'edit' ? (editStep?.status ?? 'pending') : 'pending';
  const stepSheetPosition = getStepSheetPosition(steps, new Set(), stepSheet);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingHorizontal: sereneSpacing.margin,
            paddingTop: sereneSpacing['space-md'],
            paddingBottom: sereneSpacing['space-lg'],
            gap: sereneSpacing['space-lg'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sereneSpacing['space-sm'] }}>
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}>{f.titleLabel}</RNText>
              <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>{`${title.length}/${f.titleMaxLength}`}</RNText>
            </View>

            <TextInput
              value={title}
              onChangeText={onTitleChange}
              placeholder={f.titlePlaceholder}
              placeholderTextColor={sereneColors['on-surface-variant']}
              multiline
              maxLength={f.titleMaxLength}
              accessibilityLabel={f.titleLabel}
              accessibilityState={{ disabled: isSaving }}
              editable={!isSaving}
              style={[
                sereneTypography['body-md'] as TextStyle,
                {
                  backgroundColor: sereneColors['surface-container-high'],
                  borderRadius: sereneBorderRadius.lg,
                  padding: sereneSpacing['space-md'],
                  color: sereneColors['on-surface'],
                  minHeight: s(56),
                  textAlignVertical: 'top',
                },
              ]}
            />

            {showLongTitle && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
                <MaterialCommunityIcons name={mci('lightbulb')} size={s(16)} color={sereneColors.primary} />
                <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.longTitleMicrocopy}</RNText>
              </View>
            )}
          </View>

          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <Pressable
              onPress={onNotesToggle}
              accessibilityRole="button"
              accessibilityState={{ expanded: notesOpen, disabled: isSaving }}
              accessibilityLabel={f.notesLabel}
              disabled={isSaving}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: sereneSpacing['space-sm'],
                minHeight: s(48),
                paddingHorizontal: sereneSpacing['space-md'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-low'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}>{f.notesLabel}</RNText>
              <MaterialCommunityIcons name={notesOpen ? mci('expand_less') : mci('expand_more')} size={s(20)} color={sereneColors['on-surface-variant']} />
            </Pressable>

            {notesOpen && (
              <TextInput
                value={notes}
                onChangeText={onNotesChange}
                placeholder={f.notesPlaceholder}
                placeholderTextColor={sereneColors['on-surface-variant']}
                multiline
                maxLength={200}
                accessibilityLabel={f.notesLabel}
                accessibilityState={{ disabled: isSaving }}
                editable={!isSaving}
                style={[
                  sereneTypography['body-md'] as TextStyle,
                  {
                    backgroundColor: sereneColors['surface-container-high'],
                    borderRadius: sereneBorderRadius.lg,
                    padding: sereneSpacing['space-md'],
                    color: sereneColors['on-surface'],
                    minHeight: s(72),
                    textAlignVertical: 'top',
                  },
                ]}
              />
            )}
          </View>

          <DueDateField
            value={dueDate}
            onChange={onDueDateChange}
            label={f.dueLabel}
            noneLabel={f.dueNone}
            clearLabel={f.dueClear}
            a11yLabel={f.dueA11y}
          />

          <View style={{ gap: sereneSpacing['space-sm'] }}>
            <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>{f.stepsTitle}</RNText>

            {steps.length > 0 && (
              <View style={{ gap: sereneSpacing['space-xs'] }}>
                {steps.map((step) => (
                  <StepRow
                    key={step.key}
                    name={step.name}
                    durationMin={step.duration_min}
                    completed={false}
                    pendingDelete={false}
                    onPress={() => onOpenEditSheet(step.key)}
                    onDelete={() => onRemoveStep(step.key)}
                  />
                ))}
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
              {canOrder && (
                <Pressable
                  onPress={() => onOrdenarVisibleChange(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Ordenar pasos"
                  disabled={isSaving}
                  accessibilityState={{ disabled: isSaving }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    minHeight: s(48),
                    paddingHorizontal: sereneSpacing['space-md'],
                    paddingVertical: sereneSpacing['space-sm'],
                    borderRadius: sereneBorderRadius.full,
                    backgroundColor: sereneColors['surface-container-high'],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <MaterialCommunityIcons name={mci('swap_vert')} size={s(18)} color={sereneColors['on-surface']} />
                  <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>Ordenar</RNText>
                </Pressable>
              )}
              <Pressable
                onPress={() => onOpenCreateSheet()}
                accessibilityRole="button"
                accessibilityLabel="Añadir paso"
                disabled={isSaving}
                accessibilityState={{ disabled: isSaving }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  minHeight: s(48),
                  paddingHorizontal: sereneSpacing['space-md'],
                  paddingVertical: sereneSpacing['space-sm'],
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: sereneColors['surface-container-high'],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <MaterialCommunityIcons name={mci('add')} size={s(18)} color={sereneColors['on-surface']} />
                <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>{f.addManualLabel}</RNText>
              </Pressable>
            </View>
          </View>

          <AiStepsPanel
            status={aiStatus}
            onSuggest={onSuggestSteps}
            onRetry={onSuggestSteps}
            title={taskEditCopy.ai.title}
            cta={taskEditCopy.ai.cta}
            hint={taskEditCopy.ai.hint}
            loadingMessage={taskEditCopy.ai.loading}
            readyMessage={taskEditCopy.ai.ready}
            errorMessage={aiMessage ?? taskEditCopy.ai.offline}
            offlineMessage={taskEditCopy.ai.offline}
          />

          {aiStatus === 'ready' && aiSuggestions && aiSuggestions.length > 0 && (
            <View style={{ gap: sereneSpacing['space-sm'], paddingTop: sereneSpacing['space-xs'] }}>
              <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                Pasos recomendados
              </RNText>
              {aiSuggestions.map((suggest, idx) => (
                <View
                  key={idx}
                  accessible={true}
                  accessibilityLabel={`${suggest.name}, ${suggest.duration_min} minutos`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    paddingHorizontal: sereneSpacing['space-sm'],
                    paddingVertical: sereneSpacing['space-sm'],
                    borderRadius: sereneBorderRadius.lg,
                    backgroundColor: sereneColors['surface-container-low'],
                    minHeight: s(48),
                  }}
                >
                  <MaterialCommunityIcons name={mci('check')} size={s(16)} color={sereneColors['primary']} />
                  <View style={{ flex: 1 }}>
                    <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                       {suggest.name}
                    </RNText>
                    <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
                      {taskEditCopy.ai.minutes(suggest.duration_min)}
                    </RNText>
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'], flexWrap: 'wrap' }}>
                <Pressable
                  onPress={onAcceptAiSteps}
                  accessibilityRole="button"
                  accessibilityLabel={taskEditCopy.ai.add}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: s(48),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: s(6),
                    borderRadius: sereneBorderRadius.lg,
                    backgroundColor: sereneColors.primary,
                    opacity: pressed ? 0.9 : 1,
                    paddingHorizontal: sereneSpacing['space-sm'],
                  })}
                >
                  <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}>
                    {taskEditCopy.ai.add}
                  </RNText>
                </Pressable>
                <Pressable
                  onPress={onDiscardAiSteps}
                  accessibilityRole="button"
                  accessibilityLabel={taskEditCopy.ai.discard}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: s(48),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: s(6),
                    borderRadius: sereneBorderRadius.lg,
                    borderWidth: 1,
                    borderColor: sereneColors.outline,
                    backgroundColor: sereneColors.surface,
                    opacity: pressed ? 0.9 : 1,
                    paddingHorizontal: sereneSpacing['space-sm'],
                  })}
                >
                  <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
                    {taskEditCopy.ai.discard}
                  </RNText>
                </Pressable>
              </View>
            </View>
          )}

          {aiMessage != null && aiStatus === 'idle' && (
            <RNText
              accessibilityLiveRegion="polite"
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {aiMessage}
            </RNText>
          )}

          {!keyboardVisible && (
          <View
            style={{
              paddingHorizontal: sereneSpacing.margin,
              paddingTop: sereneSpacing['space-sm'],
              paddingBottom: sereneSpacing['space-md'],
              gap: sereneSpacing['space-sm'],
              borderTopWidth: 1,
              borderTopColor: withAlpha(sereneColors.outline, 0.2),
              backgroundColor: sereneColors.surface,
            }}
          >
            {saveError && (
              <RNText
                style={[sereneTypography['caption'] as TextStyle, { color: sereneColors.error }]}
              >
                {saveError}
              </RNText>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={f.saveAndStartLabel}
              accessibilityState={{ disabled: !canSaveAndStart }}
              onPress={onSaveAndStart}
              disabled={!canSaveAndStart}
              style={({ pressed }) => ({
                minHeight: s(48),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sereneSpacing['space-sm'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: canSaveAndStart ? sereneColors.primary : sereneColors['surface-container-high'],
                ...sereneShadows.card,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('check')} size={s(20)} color={canSaveAndStart ? sereneColors['on-primary'] : sereneColors['on-surface-variant']} />
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: canSaveAndStart ? sereneColors['on-primary'] : sereneColors['on-surface-variant'] }]}>
                {f.saveAndStartLabel}
              </RNText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={f.saveLabel}
              accessibilityState={{ disabled: !canSave }}
              onPress={onSave}
              disabled={!canSave}
              style={({ pressed }) => ({
                minHeight: s(48),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sereneSpacing['space-sm'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                borderWidth: 1,
                borderColor: sereneColors.outline,
                backgroundColor: sereneColors.surface,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: canSave ? sereneColors['on-surface'] : sereneColors['on-surface-variant'] }]}>
                {f.saveLabel}
              </RNText>
            </Pressable>
          </View>
          )}
        </ScrollView>
        </KeyboardAvoidingView>

        <OrdenarPaso
          visible={ordenarVisible}
          steps={steps.map((st) => ({
            id: st.key,
            name: st.name,
            completed: false,
            pendingDelete: false,
          }))}
          lockedIds={[]}
          onClose={() => onOrdenarVisibleChange(false)}
          onDone={(orderedKeys) => {
            onOrdenarDone(orderedKeys);
          }}
        />

        <EditarPasoSheet
          visible={stepSheet !== null}
          mode={stepSheet?.mode ?? 'edit'}
          onClose={onCloseEditSheet}
          onSave={onSaveEditStep}
          taskTitle={title || f.screenTitle}
          initialTitle={stepSheetInitialTitle}
          initialDuration={stepSheetInitialDuration}
          initialStatus={stepSheetInitialStatus}
          position={stepSheetPosition.position}
          total={stepSheetPosition.total}
          error={stepSheetError}
          hideStatus
        />

        <ConfirmDialog
          visible={discardOpen}
          title={f.discardDialog.title}
          body={f.discardDialog.body}
          confirmLabel={f.discardDialog.confirm}
          cancelLabel={f.discardDialog.cancel}
          emphasis="cancel"
          onConfirm={onDiscardConfirm}
          onClose={onDiscardClose}
        />
      </View>
  );
}
