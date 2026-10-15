// ⚠️ DESIGN: variante visual para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import ZenSanctuaryCard from '../../components/designlab/ZenSanctuaryCard';
import CadenceCard from '../../components/designlab/CadenceCard';
import AtmosphericBanner from '../../components/designlab/AtmosphericBanner';
import { sinTareasFixtures } from './focusFixtures';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

/**
 * Design Lab — "Focus — Sin tareas" (estado vacío del flujo Focus).
 *
 * Se muestra cuando no hay ninguna tarea activa: chip de estado + guía de
 * respiración, card ancla con anillo botánico, refuerzo "Ritmo de hoy", snippet
 * atmosférico y whisper de cierre.
 */
export default function FocusSinTareasScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();

  const [breathing, setBreathing] = useState(false);

  const handleCreateTask = useCallback(() => {
    console.log('[DesignLab] Open new task screen');
  }, []);

  const handleOpenHistory = useCallback(() => {
    console.log('[DesignLab] Open completed tasks history');
  }, []);

  const whisperColor = withAlpha(sereneColors['on-surface-variant'], 0.6);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={sinTareasFixtures.headerTitle} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Chip de estado + guía de respiración */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
            paddingTop: s(4),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(12),
              paddingVertical: s(6),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.7),
            }}
          >
            <View
              style={{
                width: s(8),
                height: s(8),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['primary-container'],
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-secondary-container'], textTransform: 'uppercase' },
              ]}
            >
              {sinTareasFixtures.status.chip}
            </RNText>
          </View>

          <Pressable
            onPress={() => setBreathing((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Guía de respiración"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(10),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: breathing
                ? sereneColors['secondary-container']
                : sereneColors['surface-container-low'],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="weather-windy"
              size={s(16)}
              color={sereneColors['on-secondary-container']}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                {
                  color: breathing
                    ? sereneColors['on-secondary-container']
                    : sereneColors['on-surface-variant'],
                },
              ]}
            >
              {breathing ? sinTareasFixtures.status.breatheActive : sinTareasFixtures.status.breatheIdle}
            </RNText>
          </Pressable>
        </View>

        <ZenSanctuaryCard
          headline={sinTareasFixtures.sanctuary.headline}
          body={sinTareasFixtures.sanctuary.body}
          primaryCta={sinTareasFixtures.sanctuary.primaryCta}
          secondaryCta={sinTareasFixtures.sanctuary.secondaryCta}
          breathing={breathing}
          onPrimary={handleCreateTask}
          onSecondary={handleOpenHistory}
        />

        <CadenceCard
          label={sinTareasFixtures.cadence.label}
          level={sinTareasFixtures.cadence.level}
          headline={sinTareasFixtures.cadence.headline}
          detail={sinTareasFixtures.cadence.detail}
          note={sinTareasFixtures.cadence.note}
          progress={sinTareasFixtures.cadence.progress}
        />

        <AtmosphericBanner caption={sinTareasFixtures.atmospheric.caption} />

        {/* Whisper de cierre */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: sereneSpacing['space-xs'],
            paddingBottom: sereneSpacing['space-xs'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
            <MaterialCommunityIcons name="spa" size={s(14)} color={whisperColor} />
            <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: whisperColor }]}>
              {sinTareasFixtures.whisper.sub}
            </RNText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
