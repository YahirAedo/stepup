// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import StepProgressPanel from '../../components/designlab/StepProgressPanel';
import StepSequenceItem from '../../components/designlab/StepSequenceItem';
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
import { detalleFixtures } from './tareasFixtures';

/**
 * Preview "Tareas — Detalle".
 *
 * Mockup fuente: `Tareas - Detalle/code.html`. Normalizacion de copy EN→ES:
 * "Task Detail" → "Detalle de Tarea", "Secuencia de micro-pasos" → "Secuencia
 * de pasos". Header del shell y tab bar no se reproducen (el lab usa
 * `DesignLabHeader`; `GlassTabBar` es el shell real).
 */
export default function TareasDetalleScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = detalleFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta resumen principal */}
        <View
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            ...sereneShadows.card,
            overflow: 'hidden',
          }}
        >
          {/* Decoracion de calma cognitiva (blur aproximado) */}
          <View
            style={{
              position: 'absolute',
              right: s(-48),
              top: s(-48),
              width: s(144),
              height: s(144),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
            }}
          />

          <View style={{ gap: sereneSpacing['space-md'] }}>
            {/* Top meta bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: sereneSpacing['space-xs'],
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
                    {
                      color: sereneColors['on-secondary-fixed-variant'],
                      textTransform: 'uppercase',
                      fontWeight: '600',
                    },
                  ]}
                >
                  {f.summary.statusBadge}
                </RNText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Opciones de tarea"
                onPress={() => console.log('[DesignLab] Task options')}
                style={({ pressed }) => ({
                  width: s(32),
                  height: s(32),
                  borderRadius: sereneBorderRadius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={mci('more_horiz')}
                  size={s(20)}
                  color={sereneColors['on-surface-variant']}
                />
              </Pressable>
            </View>

            {/* Titulo + contexto */}
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              <RNText
                style={[
                  sereneTypography['headline-lg-mobile'] as TextStyle,
                  { color: sereneColors['on-surface'] },
                ]}
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
              percentLabel={f.summary.progress.percentLabel}
              remainingLabel={f.summary.progress.remainingLabel}
              doneLabel={f.summary.progress.doneLabel}
              paceLabel={f.summary.progress.paceLabel}
              statuses={f.summary.progress.statuses}
            />
          </View>
        </View>

        {/* Secuencia de pasos */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: s(2),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
              <MaterialCommunityIcons name={mci('alt_route')} size={s(20)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
              >
                {f.stepsTitle}
              </RNText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={f.addStep}
              onPress={() => console.log('[DesignLab] Add step')}
              style={({ pressed }) => ({
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
              <MaterialCommunityIcons name={mci('add')} size={s(16)} color={sereneColors['on-surface']} />
              <RNText
                style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
              >
                {f.addStep}
              </RNText>
            </Pressable>
          </View>

          <View style={{ gap: s(10) }}>
            {f.steps.map((step) => (
              <StepSequenceItem
                key={step.index}
                variant={step.variant}
                index={step.index}
                title={step.title}
                meta={step.meta}
                minutes={step.minutes}
                description={step.description}
                activeBadge={step.activeBadge}
                activeCta={step.activeCta}
                onExecute={() => console.log('[DesignLab] Execute step:', step.title)}
                onReorder={() => console.log('[DesignLab] Reorder step:', step.title)}
                onPress={() => console.log('[DesignLab] Open step:', step.title)}
              />
            ))}
          </View>
        </View>

        {/* Gestion + calma */}
        <View style={{ gap: sereneSpacing['space-sm'], paddingTop: s(4) }}>
          <View style={{ flexDirection: 'row', gap: s(8) }}>
            {f.management.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => console.log('[DesignLab] Manage:', item.key)}
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
                <MaterialCommunityIcons
                  name={mci(item.icon)}
                  size={s(20)}
                  color={sereneColors['on-surface']}
                />
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
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: sereneColors.primary, fontWeight: '600' },
                ]}
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

        {/* Acciones principales inferiores */}
        <View style={{ paddingTop: sereneSpacing['space-xs'], gap: s(10) }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={f.actions.primary}
            onPress={() => console.log('[DesignLab] Start focus')}
            style={({ pressed }) => ({
              width: '100%',
              height: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors.primary,
              ...sereneShadows.card,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('play_circle')} size={s(20)} color={sereneColors['on-primary']} />
            <RNText
              style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
            >
              {f.actions.primary}
            </RNText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={f.actions.secondary}
            onPress={() => console.log('[DesignLab] Mark task complete')}
            style={({ pressed }) => ({
              width: '100%',
              height: s(40),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(6),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: pressed ? sereneColors['surface-container-high'] : 'transparent',
            })}
          >
            <MaterialCommunityIcons
              name={mci('task_alt')}
              size={s(18)}
              color={sereneColors['on-surface-variant']}
            />
            <RNText
              style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {f.actions.secondary}
            </RNText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}