// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import TimelineStep from '../../components/designlab/tareas/TimelineStep';
import EditarPasoSheet from '../../components/designlab/EditarPasoSheet';
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
  clampStepPosition,
  remainingMinutes,
  stepCountLabel,
  stepStartMinutes,
} from '../../utils/microplan';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoCDetalleFixtures, type FlujoCPasoTimeline } from './tareasFlujoCFixtures';

/**
 * Variante C "Sendero" — Tareas / Detalle.
 *
 * Toda la tarea se lee como una timeline vertical: card resumen con totales
 * derivados (minutos acumulados, restantes y pasos listos), el sendero de pasos
 * en `TimelineStep` (tocá un paso para editarlo) y, abajo, gestión + una única
 * superficie de calma. Barra de acción fija con un solo CTA principal.
 */
export default function TareasCDetalleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasCDetalle'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoCDetalleFixtures;

  const [steps, setSteps] = useState<FlujoCPasoTimeline[]>(f.steps);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const total = steps.length;
  const doneCount = steps.filter((step) => step.completed).length;
  const currentIndex = clampStepPosition(doneCount + 1, total);
  const starts = stepStartMinutes(steps.map((step) => ({ duration_min: step.durationMin })));
  const remainingMin = remainingMinutes(
    steps.map((step) => ({ duration_min: step.durationMin, completed: step.completed }))
  );

  const doneLabel = `${doneCount} de ${stepCountLabel(total)} listos`;
  const remainingLabel = `~${remainingMin} min`;
  const a11yStatus = `${f.summary.title}. Paso ${currentIndex} de ${total}. ${doneLabel}.`;

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
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-secondary-fixed-variant'] }]}
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

          {/* Totales derivados de los pasos (sin stats inventados) */}
          <View
            style={{
              flexDirection: 'row',
              gap: sereneSpacing['space-md'],
              paddingTop: sereneSpacing['space-sm'],
              borderTopWidth: 1,
              borderTopColor: withAlpha(sereneColors.outline, 0.2),
            }}
          >
            <View style={{ flex: 1, gap: s(2) }}>
              <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                {f.summary.totalClock}
              </RNText>
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                Sendero completo
              </RNText>
            </View>

            <View style={{ flex: 1, gap: s(2) }}>
              <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                {remainingLabel}
              </RNText>
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                Restantes
              </RNText>
            </View>

            <View style={{ flex: 1, gap: s(2) }}>
              <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
                {`${doneCount}/${total}`}
              </RNText>
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                Pasos listos
              </RNText>
            </View>
          </View>
        </View>

        {/* Sendero de pasos (timeline) */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), paddingHorizontal: s(2) }}>
            <MaterialCommunityIcons name={mci('timelapse')} size={s(20)} color={sereneColors.primary} />
            <RNText
              style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
            >
              {f.stepsTitle}
            </RNText>
          </View>

          <View style={{ gap: s(2) }}>
            {steps.map((step, index) => (
              <View key={`${index}-${step.title}`} style={{ gap: sereneSpacing['space-xs'] }}>
                <TimelineStep
                  variant={step.variant}
                  title={step.title}
                  meta={step.meta}
                  durationMin={step.durationMin}
                  startMinutes={starts[index]}
                  isLast={index === total - 1}
                  onPress={() => setEditingIdx(index)}
                />

                {step.description !== undefined && (
                  <RNText
                    style={[
                      sereneTypography['body-sm'] as TextStyle,
                      {
                        color: sereneColors['on-surface-variant'],
                        paddingLeft: s(32),
                        paddingRight: sereneSpacing['space-sm'],
                        marginTop: -sereneSpacing['space-sm'],
                      },
                    ]}
                  >
                    {step.description}
                  </RNText>
                )}

                <Pressable
                  onPress={() => setEditingIdx(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${f.editStepLabel} ${index + 1}: ${step.title}`}
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
                  <MaterialCommunityIcons name={mci('edit')} size={s(15)} color={sereneColors.primary} />
                  <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary }]}>
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
                // REQUIERE MIGRACIÓN: "Plantilla" guarda la tarea como plantilla reutilizable; no existe en el modelo.
                onPress={() => {
                  if (item.key === 'editar') {
                    navigation.navigate('TareasCEditar');
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
              <MaterialCommunityIcons name={mci('eco')} size={s(20)} color={sereneColors.primary} />
            </View>
            <View style={{ gap: s(2), flex: 1 }}>
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.actions.primary}
          accessibilityHint={a11yStatus}
          onPress={() => console.log('[DesignLab] Mark step complete')}
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
          <MaterialCommunityIcons name={mci('done')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.actions.primary}
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
        initialDuration={editingStep?.durationMin ?? flujoCDetalleFixtures.steps[0].durationMin}
        position={(editingIdx ?? 0) + 1}
        total={total}
      />
    </View>
  );
}
