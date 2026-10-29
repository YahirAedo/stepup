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
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import StepRow from '../../../components/ui/StepRow';
import DueDateField from '../../../components/ui/DueDateField';
import OrdenarPaso from '../../../components/ui/OrdenarPaso';
import EditarPasoSheet from '../../../components/ui/EditarPasoSheet';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { getStepSheetPosition } from '../logic/stepSheetResult';
import { taskEditCopy as f } from '../logic/taskEditCopy';

export interface TaskEditViewProps {
  title: string;
  notes: string;
  notesOpen: boolean;
  dueDate: string | undefined;
  steps: Array<{ key: string; id: number | null; name: string; duration_min: number | null }>;
  pendingDeletes: Set<string>;
  hasUnsaved: boolean;
  isLongTitle: boolean;
  canOrder: boolean;
  stepSheet: null | { mode: 'create' } | { mode: 'edit'; key: string };
  stepSheetError: string | null;
  ordenarVisible: boolean;
  deleteOpen: boolean;
  discardOpen: boolean;
  onTitleChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onNotesToggle: () => void;
  onDueDateChange: (v: string | undefined) => void;
  onOpenEditSheet: (key: string) => void;
  onSaveEditStep: (values: { title: string; duration: number }) => void;
  onCloseEditSheet: () => void;
  onToggleDelete: (key: string) => void;
  onOpenCreateSheet: () => void;
  onOrdenarDone: (orderedKeys: string[]) => void;
  onOrdenarVisibleChange: (visible: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
  onDiscardConfirm: () => void;
  onDiscardClose: () => void;
  saveError: string | null;
}

export default function TaskEditView({
  title,
  notes,
  notesOpen,
  dueDate,
  steps,
  pendingDeletes,
  hasUnsaved,
  isLongTitle: showLongTitle,
  canOrder,
  stepSheet,
  stepSheetError,
  ordenarVisible,
  deleteOpen,
  discardOpen,
  onTitleChange,
  onNotesChange,
  onNotesToggle,
  onDueDateChange,
  onOpenEditSheet,
  onSaveEditStep,
  onCloseEditSheet,
  onToggleDelete,
  onOpenCreateSheet,
  onOrdenarDone,
  onOrdenarVisibleChange,
  onDeleteOpenChange,
  onSave,
  onDelete,
  onDiscardConfirm,
  onDiscardClose,
  saveError,
}: TaskEditViewProps) {
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
  const stepSheetInitialDuration = stepSheet?.mode === 'edit' ? (editStep?.duration_min ?? 3) : f.addInline.suggestedMinutes;
  const stepSheetPosition = getStepSheetPosition(steps, pendingDeletes, stepSheet);

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
          {/* Título */}
          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sereneSpacing['space-sm'] }}>
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.titleLabel}</RNText>
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

          {/* Notas colapsables (secundario) */}
          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <Pressable
              onPress={onNotesToggle}
              accessibilityRole="button"
              accessibilityState={{ expanded: notesOpen }}
              accessibilityLabel={f.notesLabel}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: sereneSpacing['space-sm'],
                minHeight: s(44),
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

          {/* Fecha meta (dato neutro y opcional) */}
          <DueDateField
            value={dueDate}
            onChange={onDueDateChange}
            label={f.dueLabel}
            noneLabel={f.dueNone}
            clearLabel={f.dueClear}
            a11yLabel={f.dueA11y}
          />

          {/* Pasos */}
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
                    pendingDelete={pendingDeletes.has(step.key)}
                    onPress={() => onOpenEditSheet(step.key)}
                    onDelete={() => onToggleDelete(step.key)}
                    onUndoDelete={() => onToggleDelete(step.key)}
                  />
                ))}
              </View>
            )}

            {pendingDeletes.size > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: s(6),
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
                  {pendingDeletes.size} paso(s) marcado(s) para borrado. Se aplicará al guardar.
                </RNText>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
              {canOrder && (
                <Pressable
                  onPress={() => onOrdenarVisibleChange(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Ordenar pasos"
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    minHeight: s(44),
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
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  minHeight: s(44),
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
              accessibilityLabel={f.saveLabel}
              accessibilityState={{ disabled: !hasUnsaved }}
              onPress={onSave}
              disabled={!hasUnsaved}
              style={({ pressed }) => ({
                minHeight: s(48),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sereneSpacing['space-sm'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: hasUnsaved ? sereneColors.primary : sereneColors['surface-container-high'],
                ...sereneShadows.card,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('check')} size={s(20)} color={hasUnsaved ? sereneColors['on-primary'] : sereneColors['on-surface-variant']} />
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: hasUnsaved ? sereneColors['on-primary'] : sereneColors['on-surface-variant'] }]}>
                {f.saveLabel}
              </RNText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={f.deleteLabel}
              onPress={() => onDeleteOpenChange(true)}
              style={({ pressed }) => ({
                minHeight: s(44),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: sereneSpacing['space-sm'],
                paddingVertical: sereneSpacing['space-sm'],
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors.error,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('delete')} size={s(18)} color={sereneColors['on-error']} />
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-error'] }]}>
                {f.deleteLabel}
              </RNText>
            </Pressable>
          </View>
          )}
        </ScrollView>
        </KeyboardAvoidingView>

        {/* Ordenar modal */}
        <OrdenarPaso
          visible={ordenarVisible}
          steps={steps
            .filter((st) => !pendingDeletes.has(st.key))
            .map((st) => ({
              id: st.key,
              name: st.name,
              completed: false,
              pendingDelete: false,
            }))}
          lockedIds={[]}
          onClose={() => onOrdenarVisibleChange(false)}
          onDone={(orderedKeys) => {
            const byKey = new Map(steps.map((st) => [st.key, st]));
            const nextSteps = orderedKeys
              .map((key) => byKey.get(key))
              .filter((st): st is { key: string; id: number | null; name: string; duration_min: number | null } => st !== undefined);
            const remaining = steps.filter((st) => !orderedKeys.includes(st.key));
            onOrdenarDone([...nextSteps, ...remaining].map((st) => st.key));
          }}
        />

        {/* Edit step sheet */}
        <EditarPasoSheet
          visible={stepSheet !== null}
          mode={stepSheet?.mode ?? 'edit'}
          onClose={onCloseEditSheet}
          onSave={onSaveEditStep}
          taskTitle={title || 'Tarea'}
          initialTitle={stepSheetInitialTitle}
          initialDuration={stepSheetInitialDuration}
          position={stepSheetPosition.position}
          total={stepSheetPosition.total}
          error={stepSheetError}
        />

        {/* Confirm delete */}
        <ConfirmDialog
          visible={deleteOpen}
          title={f.deleteDialog.title}
          body={f.deleteDialog.body}
          confirmLabel={f.deleteDialog.confirm}
          cancelLabel={f.deleteDialog.cancel}
          onConfirm={onDelete}
          onClose={() => onDeleteOpenChange(false)}
        />

        {/* Confirm discard */}
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