// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import AddMicroStepInline from '../../components/designlab/AddMicroStepInline';
import EditarPasoSheet from '../../components/designlab/EditarPasoSheet';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import {
  flujoBDetalleFixtures,
  type FlujoBPasoChecklist,
} from './tareasFlujoBFixtures';

type TareasBDetalleNav = NativeStackNavigationProp<ProfileStackParamList, 'TareasBDetalle'>;

/**
 * Preview "Tareas Variante B — Detalle" (Ritmo): el paso actual queda FIJADO
 * arriba del `ScrollView` con su CTA, y debajo corre una checklist compacta
 * con checkbox táctil, edición por fila (bottom sheet) y alta de pasos inline.
 */
export default function TareasBDetalleScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const navigation = useNavigation<TareasBDetalleNav>();
  const f = flujoBDetalleFixtures;

  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    f.checklist.reduce<Record<string, boolean>>((acc, step) => {
      acc[step.id] = step.done;
      return acc;
    }, {})
  );
  const [addOpen, setAddOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState<FlujoBPasoChecklist | null>(null);

  const toggleStep = useCallback((id: string) => {
    setDoneMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const closeSheet = useCallback(() => setSheetStep(null), []);

  const handleSaveStep = useCallback(() => {
    console.log('[DesignLab] Save step from sheet');
    setSheetStep(null);
  }, []);

  const handleDeleteStep = useCallback(() => {
    console.log('[DesignLab] Delete step from sheet');
    setSheetStep(null);
  }, []);

  const handleAddStep = useCallback((stepTitle: string) => {
    console.log('[DesignLab] Add step:', stepTitle);
    setAddOpen(false);
  }, []);

  const sheetPosition = sheetStep
    ? Math.max(1, f.checklist.findIndex((step) => step.id === sheetStep.id) + 1)
    : 1;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      {/* Paso actual FIJADO arriba: fuera del ScrollView. */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-sm'],
        }}
      >
        <View
          style={{
            gap: sereneSpacing['space-sm'],
            padding: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container-lowest'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-xs'],
              flexWrap: 'wrap',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: s(6),
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
                  { color: sereneColors['on-secondary-fixed-variant'] },
                ]}
              >
                {f.current.badge}
              </RNText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
              <MaterialCommunityIcons
                name={mci('schedule')}
                size={s(15)}
                color={sereneColors.primary}
              />
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors.primary },
                ]}
              >
                {`~${f.current.minutes} min`}
              </RNText>
            </View>
          </View>

          <RNText
            style={[
              sereneTypography['title-md'] as TextStyle,
              { color: sereneColors['on-surface'], flexShrink: 1, flexWrap: 'wrap' },
            ]}
          >
            {f.current.title}
          </RNText>

          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {f.current.positionLabel}
          </RNText>

          <Pressable
            onPress={() => console.log('[DesignLab] Continuar en foco')}
            accessibilityRole="button"
            accessibilityLabel={f.actions.primary}
            style={({ pressed }) => ({
              minHeight: s(48),
              paddingHorizontal: sereneSpacing['space-md'],
              paddingVertical: s(12),
              borderRadius: sereneBorderRadius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              backgroundColor: sereneColors.primary,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={mci('play_circle')}
              size={s(20)}
              color={sereneColors['on-primary']}
            />
            <RNText
              style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
            >
              {f.actions.primary}
            </RNText>
          </Pressable>
        </View>
      </View>

      {/* Checklist compacta */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-md'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-sm'],
              flexWrap: 'wrap',
            }}
          >
            <RNText
              style={[
                sereneTypography['title-md'] as TextStyle,
                { color: sereneColors['on-surface'], flexShrink: 1 },
              ]}
            >
              {f.checklistTitle}
            </RNText>

            {!addOpen && (
              <Pressable
                onPress={() => setAddOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={f.addStep}
                style={({ pressed }) => ({
                  minHeight: s(44),
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: s(4),
                  paddingHorizontal: s(10),
                  paddingVertical: s(6),
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['surface-container-high'],
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={mci('add')}
                  size={s(16)}
                  color={sereneColors['on-surface']}
                />
                <RNText
                  style={[
                    sereneTypography['label-md'] as TextStyle,
                    { color: sereneColors['on-surface'] },
                  ]}
                >
                  {f.addStep}
                </RNText>
              </Pressable>
            )}
          </View>

          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {f.checklist.map((step) => {
              const done = doneMap[step.id];
              return (
                <View
                  key={step.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    paddingVertical: s(4),
                    paddingHorizontal: s(4),
                    borderRadius: sereneBorderRadius.lg,
                    backgroundColor: done
                      ? sereneColors['surface-container-low']
                      : sereneColors['surface-container-lowest'],
                  }}
                >
                  <Pressable
                    onPress={() => toggleStep(step.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={`${step.title} (${step.minutes} min)`}
                    style={({ pressed }) => ({
                      width: s(44),
                      height: s(44),
                      borderRadius: sereneBorderRadius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: done
                        ? sereneColors.primary
                        : sereneColors['surface-container-high'],
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    {done && (
                      <MaterialCommunityIcons
                        name={mci('done')}
                        size={s(18)}
                        color={sereneColors['on-primary']}
                      />
                    )}
                  </Pressable>

                  <View style={{ flex: 1, minWidth: 0, gap: s(2) }}>
                    <RNText
                      style={[
                        sereneTypography['body-md'] as TextStyle,
                        {
                          color: done
                            ? sereneColors['on-surface-variant']
                            : sereneColors['on-surface'],
                          textDecorationLine: done ? 'line-through' : 'none',
                          flexShrink: 1,
                          flexWrap: 'wrap',
                        },
                      ]}
                    >
                      {step.title}
                    </RNText>
                    <RNText
                      style={[
                        sereneTypography['label-sm'] as TextStyle,
                        { color: sereneColors['on-surface-variant'] },
                      ]}
                    >
                      {`~${step.minutes} min`}
                    </RNText>
                  </View>

                  <Pressable
                    onPress={() => setSheetStep(step)}
                    accessibilityRole="button"
                    accessibilityLabel={`${f.editStepLabel} ${step.title}`}
                    style={({ pressed }) => ({
                      minHeight: s(44),
                      paddingHorizontal: s(10),
                      paddingVertical: s(6),
                      borderRadius: sereneBorderRadius.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: pressed
                        ? sereneColors['surface-container-highest']
                        : sereneColors['surface-container-high'],
                    })}
                  >
                    <RNText
                      style={[
                        sereneTypography['label-md'] as TextStyle,
                        { color: sereneColors['on-surface'] },
                      ]}
                    >
                      {f.editStepLabel}
                    </RNText>
                  </Pressable>
                </View>
              );
            })}
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
        </View>
      </ScrollView>

      {/* Acción secundaria fija, después del ScrollView. */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: contentPaddingBottom,
          backgroundColor: sereneColors['surface-container-low'],
        }}
      >
        <Pressable
          onPress={() => {
            console.log('[DesignLab] Editar tarea');
            navigation.navigate('TareasBEditar');
          }}
          accessibilityRole="button"
          accessibilityLabel={f.actions.secondary}
          style={({ pressed }) => ({
            minHeight: s(44),
            paddingHorizontal: sereneSpacing['space-md'],
            paddingVertical: s(10),
            borderRadius: sereneBorderRadius.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(6),
            backgroundColor: pressed
              ? sereneColors['surface-container-highest']
              : sereneColors['surface-container-high'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons
            name={mci('edit')}
            size={s(18)}
            color={sereneColors['on-surface']}
          />
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {f.actions.secondary}
          </RNText>
        </Pressable>
      </View>

      <EditarPasoSheet
        visible={sheetStep !== null}
        onClose={closeSheet}
        onSave={handleSaveStep}
        onDelete={handleDeleteStep}
        taskTitle={f.taskTitle}
        initialTitle={sheetStep?.title ?? ''}
        initialDuration={sheetStep?.minutes ?? f.addStepInline.suggestedMinutes}
        position={sheetPosition}
        total={f.checklist.length}
      />
    </View>
  );
}
