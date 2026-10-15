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
import { clampStepPosition, computeTotalMinutes } from '../../utils/microplan';
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
        title: stepTitle,
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

          <StepProgressPanel
            percentLabel={percentLabel}
            remainingLabel={remainingLabel}
            doneLabel={doneLabel}
            paceLabel={f.summary.paceLabel}
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

          <View style={{ gap: s(10) }}>
            {steps.map((step, index) => (
              <View key={`${index}-${step.title}`} style={{ gap: sereneSpacing['space-xs'] }}>
                <StepSequenceItem
                  variant={step.variant}
                  index={index + 1}
                  title={step.title}
                  meta={step.meta}
                  minutes={step.variant === 'active' ? step.durationMin : undefined}
                  description={step.description}
                  activeBadge={step.activeBadge}
                  activeCta={step.activeCta}
                  onExecute={() => console.log('[DesignLab] Execute step:', step.title)}
                  onReorder={() => console.log('[DesignLab] Reorder step:', step.title)}
                  onPress={() => console.log('[DesignLab] Open step:', step.title)}
                />

                <Pressable
                  onPress={() => setEditingIdx(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.editStepLabel} paso ${index + 1}: ${step.title}`}
                  style={({ pressed }) => ({
                    alignSelf: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: s(4),
                    minHeight: s(44),
                    paddingHorizontal: sereneSpacing['space-sm'],
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name={mci('edit')} size={s(15)} color={sereneColors['primary-container']} />
                  <RNText
                    style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['primary-container'] }]}
                  >
                    {f.editStepLabel}
                  </RNText>
                </Pressable>
              </View>
            ))}
          </View>
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
        {/* REQUIERE MIGRACIÓN: iniciar una sesión de foco no existe en el modelo. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${f.actions.primaryPrefix} ${currentIndex} ${f.actions.primarySuffix}`}
          onPress={() => console.log('[DesignLab]', f.actions.startFocusLog)}
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.actions.secondary}
          onPress={() => navigation.navigate('TareasACompletada')}
          style={({ pressed }) => ({
            minHeight: s(44),
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: pressed ? sereneColors['surface-container-high'] : 'transparent',
          })}
        >
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {f.actions.secondary}
          </RNText>
        </Pressable>
      </View>

      <EditarPasoSheet
        visible={editingStep !== null}
        onClose={() => setEditingIdx(null)}
        onSave={() => setEditingIdx(null)}
        onDelete={handleDeleteStep}
        taskTitle={f.summary.title}
        initialTitle={editingStep?.title ?? ''}
        initialDuration={editingStep?.durationMin ?? flujoADetalleFixtures.addStepInline.suggestedMinutes}
        position={(editingIdx ?? 0) + 1}
        total={total}
      />
    </View>
  );
}
