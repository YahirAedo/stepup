// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import StepProgressPanel, { type StepSegmentStatus } from '../../components/designlab/StepProgressPanel';
import StepSequenceItem from '../../components/designlab/StepSequenceItem';
import EditarPasoSheet from '../../components/designlab/EditarPasoSheet';
import AddMicroStepInline from '../../components/designlab/AddMicroStepInline';
import DueDateField from '../../components/designlab/DueDateField';
import ConfirmDialog from '../../components/designlab/ConfirmDialog';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import {
  canPostponeStep,
  clampStepPosition,
  computeTotalMinutes,
  postponePendingStep,
} from '../../utils/microplan';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoADetalleFixtures, type FlujoAPasoDetalle } from './tareasFlujoAFixtures';

/**
 * Variante A "Enfoque" — Tareas / Detalle.
 *
 * Secuencia lineal con el paso actual resaltado: card resumen + panel de avance
 * segmentado, "Secuencia de pasos" (completado / en foco / en espera), una única
 * superficie de calma y un solo CTA principal ("Iniciar paso X en foco").
 */
export default function TareasADetalleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasADetalle'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoADetalleFixtures;

  const [steps, setSteps] = useState<FlujoAPasoDetalle[]>(f.steps);
  const [addOpen, setAddOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string | undefined>(f.summary.dueDate);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const total = steps.length;
  const doneCount = steps.filter((step) => step.variant === 'completed').length;
  const currentIndex = clampStepPosition(doneCount + 1, total);
  const remainingMin = computeTotalMinutes(
    steps.filter((step) => step.variant !== 'completed').map((step) => ({ duration_min: step.durationMin }))
  );

  const statuses: StepSegmentStatus[] = steps.map((step) =>
    step.variant === 'completed' ? 'done' : step.variant === 'active' ? 'current' : 'pending'
  );

  const percentLabel = total > 0 ? `${Math.round((doneCount / total) * 100)}% completado` : 'Sin pasos';
  const remainingLabel = `~${remainingMin} min restantes`;
  const doneLabel = `${doneCount} de ${total} pasos listos`;

  const handleAddStep = useCallback((stepTitle: string) => {
    setSteps((prev) => [
      ...prev,
      {
        variant: 'pending',
        name: stepTitle,
        meta: `En espera · ${flujoADetalleFixtures.addStepInline.suggestedMinutes} min`,
        durationMin: flujoADetalleFixtures.addStepInline.suggestedMinutes,
      },
    ]);
    setAddOpen(false);
  }, []);

  const handleDeleteStep = useCallback(() => {
    setSteps((prev) => prev.filter((_, index) => index !== editingIdx));
    setEditingIdx(null);
  }, [editingIdx]);

  /** B7: vuelve a pendiente un paso completado. */
  const handleUndoStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index
          ? { ...step, variant: 'pending' as const, meta: `En espera · ${step.durationMin} min` }
          : step
      )
    );
  }, []);

  /** B12: mueve el paso pendiente al final de los pendientes de la tarea. */
  const handlePostponeStep = useCallback((index: number) => {
    setSteps((prev) => postponePendingStep(prev, index));
  }, []);

  /**
   * Marca el paso en foco como hecho y activa el siguiente. Si era el último
   * pendiente, la tarea queda completa y se muestra el aviso de tarea completada.
   */
  const handleCompleteActive = useCallback(() => {
    const activeIndex = steps.findIndex((step) => step.variant === 'active');
    if (activeIndex < 0) return;
    const activeStep = steps[activeIndex];
    const nextIndex = steps.findIndex(
      (step, index) => index > activeIndex && step.variant === 'pending'
    );
    setSteps((prev) =>
      prev.map((step, index) => {
        if (index === activeIndex) {
          return {
            ...step,
            variant: 'completed' as const,
            meta: `Completado · ${step.durationMin} min`,
            description: undefined,
            activeBadge: undefined,
            startCta: undefined,
            completeCta: undefined,
          };
        }
        if (index === nextIndex) {
          return {
            ...step,
            variant: 'active' as const,
            description: activeStep.description,
            activeBadge: activeStep.activeBadge,
            startCta: activeStep.startCta,
            completeCta: activeStep.completeCta,
          };
        }
        return step;
      })
    );
    if (nextIndex < 0) navigation.navigate('TareasACompletada');
  }, [steps, navigation]);

  /** Entra al flujo Focus (preview del Lab) para el paso en foco. */
  const handleStartFocus = useCallback(() => {
    navigation.navigate('EnfoqueFocus');
  }, [navigation]);

  const editingStep = editingIdx !== null ? steps[editingIdx] : null;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card resumen */}
        <View
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            gap: sereneSpacing['space-md'],
            ...sereneShadows.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              alignSelf: 'flex-start',
              paddingHorizontal: s(10),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['secondary-container'],
            }}
          >
            <View
              style={{
                width: s(6),
                height: s(6),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors.primary,
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-secondary-fixed-variant'], fontWeight: '600' },
              ]}
            >
              {`${f.summary.statusBadge.prefix} ${currentIndex} ${f.summary.statusBadge.of} ${total}`}
            </RNText>
          </View>

          <View style={{ gap: sereneSpacing['space-xs'] }}>
            <RNText
              style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
            >
              {f.summary.title}
            </RNText>
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], lineHeight: s(24) },
              ]}
            >
              {f.summary.description}
            </RNText>
          </View>

          {/* Vencimiento (dato neutro y opcional), editable acá mismo. */}
          <DueDateField
            value={dueDate}
            onChange={setDueDate}
            label={f.summary.dueLabel}
            noneLabel={f.summary.dueNone}
            clearLabel={f.summary.dueClear}
            a11yLabel={f.summary.dueA11y}
          />

          <StepProgressPanel
            percentLabel={percentLabel}
            remainingLabel={remainingLabel}
            doneLabel={doneLabel}
            statuses={statuses}
          />
        </View>

        {/* Secuencia de pasos */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-sm'],
              paddingHorizontal: s(2),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), flexShrink: 1 }}>
              <MaterialCommunityIcons name={mci('alt_route')} size={s(20)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
              >
                {f.stepsTitle}
              </RNText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={f.addStep}
              onPress={() => setAddOpen(true)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: s(4),
                minHeight: s(44),
                paddingHorizontal: s(10),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-high'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name={mci('add')} size={s(16)} color={sereneColors['on-surface']} />
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                {f.addStep}
              </RNText>
            </Pressable>
          </View>

          {addOpen && (
            <AddMicroStepInline
              visible={addOpen}
              suggestedMinutes={f.addStepInline.suggestedMinutes}
              maxMinutes={f.addStepInline.maxMinutes}
              heading={f.addStepInline.heading}
              placeholder={f.addStepInline.placeholder}
              onClose={() => setAddOpen(false)}
              onSave={handleAddStep}
            />
          )}

          {total === 0 ? (
            <View
              style={{
                gap: sereneSpacing['space-sm'],
                padding: sereneSpacing['space-md'],
                borderRadius: sereneBorderRadius.xl,
                backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
              }}
            >
              <RNText
                style={[
                  sereneTypography['body-md'] as TextStyle,
                  { color: sereneColors['on-secondary-container'], flexShrink: 1 },
                ]}
              >
                {f.noSteps.text}
              </RNText>
              {!addOpen && (
                <Pressable
                  onPress={() => setAddOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={f.noSteps.cta}
                  style={({ pressed }) => ({
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    minHeight: s(44),
                    paddingHorizontal: sereneSpacing['space-md'],
                    paddingVertical: sereneSpacing['space-sm'],
                    borderRadius: sereneBorderRadius.full,
                    backgroundColor: sereneColors.primary,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <MaterialCommunityIcons name={mci('add')} size={s(18)} color={sereneColors['on-primary']} />
                  <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}>
                    {f.noSteps.cta}
                  </RNText>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ gap: s(10) }}>
              {steps.map((step, index) => (
                <StepSequenceItem
                  key={`${index}-${step.name}`}
                  variant={step.variant}
                  index={index + 1}
                  title={step.name}
                  meta={step.meta}
                  minutes={step.variant === 'active' ? step.durationMin : undefined}
                  description={step.description}
                  activeBadge={step.activeBadge}
                  startCta={step.startCta}
                  completeCta={step.completeCta}
                  onStart={step.variant === 'active' ? handleStartFocus : undefined}
                  onComplete={step.variant === 'active' ? handleCompleteActive : undefined}
                  onReorder={
                    step.variant !== 'completed'
                      ? () => console.log('[DesignLab] Reorder step:', step.name)
                      : undefined
                  }
                  onPress={() => console.log('[DesignLab] Open step:', step.name)}
                  onEdit={() => setEditingIdx(index)}
                  editLabel={f.editStepLabel}
                  onUndo={step.variant === 'completed' ? () => handleUndoStep(index) : undefined}
                  undoLabel={f.undoStepLabel}
                  onPostpone={step.variant === 'pending' ? () => handlePostponeStep(index) : undefined}
                  postponeDisabled={!canPostponeStep(steps, index)}
                  postponeLabel={f.postponeLabel}
                />
              ))}
            </View>
          )}
        </View>

        {/* Gestión + calma */}
        <View style={{ gap: sereneSpacing['space-sm'], paddingTop: s(4) }}>
          <View style={{ flexDirection: 'row', gap: s(8) }}>
            {f.management.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => {
                  if (item.key === 'editar') {
                    navigation.navigate('TareasAEditar');
                    return;
                  }
                  if (item.key === 'eliminar') {
                    setDeleteOpen(true);
                    return;
                  }
                  console.log('[DesignLab] Manage:', item.key);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: s(10),
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['surface-container-low'],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <MaterialCommunityIcons name={mci(item.icon)} size={s(20)} color={sereneColors['on-surface']} />
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'], textAlign: 'center', marginTop: s(4) },
                  ]}
                >
                  {item.label}
                </RNText>
              </Pressable>
            ))}
          </View>

          <View
            style={{
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
              borderRadius: sereneBorderRadius.xl,
              padding: sereneSpacing['space-md'],
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: sereneSpacing['space-sm'],
            }}
          >
            <View
              style={{
                width: s(32),
                height: s(32),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['secondary-container'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci('spa')} size={s(20)} color={sereneColors.primary} />
            </View>
            <View style={{ gap: s(2), flex: 1 }}>
              <RNText
                style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary, fontWeight: '600' }]}
              >
                {f.calm.title}
              </RNText>
              <RNText
                style={[
                  sereneTypography['body-sm'] as TextStyle,
                  { color: sereneColors['on-secondary-container'], lineHeight: s(20) },
                ]}
              >
                {f.calm.body}
              </RNText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra de acción fija (en flujo del layout, no absolute) */}
      {total > 0 && (
        <View
          style={{
            paddingHorizontal: sereneSpacing.margin,
            paddingTop: sereneSpacing['space-sm'],
            paddingBottom: insets.bottom + sereneSpacing['space-md'],
            gap: sereneSpacing['space-sm'],
            borderTopWidth: 1,
            borderTopColor: withAlpha(sereneColors.outline, 0.2),
            backgroundColor: sereneColors.surface,
          }}
        >
          {/* CTA principal: entra al flujo Focus (preview del Lab). */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${f.actions.primaryPrefix} ${currentIndex} ${f.actions.primarySuffix}`}
            onPress={() => navigation.navigate('EnfoqueFocus')}
            style={({ pressed }) => ({
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sereneSpacing['space-sm'],
              paddingVertical: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors.primary,
              ...sereneShadows.card,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('play_circle')} size={s(20)} color={sereneColors['on-primary']} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
              {`${f.actions.primaryPrefix} ${currentIndex} ${f.actions.primarySuffix}`}
            </RNText>
          </Pressable>
        </View>
      )}

      <EditarPasoSheet
        visible={editingStep !== null}
        onClose={() => setEditingIdx(null)}
        onSave={() => setEditingIdx(null)}
        onDelete={handleDeleteStep}
        taskTitle={f.summary.title}
        initialTitle={editingStep?.name ?? ''}
        initialDuration={editingStep?.durationMin ?? flujoADetalleFixtures.addStepInline.suggestedMinutes}
        position={(editingIdx ?? 0) + 1}
        total={total}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title={f.deleteDialog.title}
        body={f.deleteDialog.body}
        confirmLabel={f.deleteDialog.confirm}
        cancelLabel={f.deleteDialog.cancel}
        onConfirm={() => {
          setDeleteOpen(false);
          navigation.navigate('TareasAListado');
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </View>
  );
}
