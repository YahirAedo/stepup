// ⚠️ DESIGN: variante visual para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import CadenceCard from '../../components/designlab/CadenceCard';
import AtmosphericBanner from '../../components/designlab/AtmosphericBanner';
import { sinTareasFixtures } from './focusFixtures';
import type { ProfileStackParamList } from '../../types/navigation';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

/**
 * Design Lab — "Focus — Sin tareas" (estado vacío del flujo Focus).
 *
 * Se muestra cuando no hay ninguna tarea activa: chip de estado, card ancla con
 * los accesos para crear una tarea o ver las completadas, refuerzo "Ritmo de hoy",
 * snippet atmosférico y whisper de cierre.
 */
export default function FocusSinTareasScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'FocusSinTareas'>>();
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();

  const handleCreateTask = useCallback(() => {
    navigation.navigate('TareasACrear');
  }, [navigation]);

  const handleOpenHistory = useCallback(() => {
    navigation.navigate('TareasAListado');
  }, [navigation]);

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
        {/* Chip de estado */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: s(4) }}>
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
        </View>

        {/* Card ancla */}
        <View
          style={{
            width: '100%',
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-lg'],
            gap: sereneSpacing['space-sm'],
            ...sereneShadows.card,
          }}
        >
          <RNText style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors.primary }]}>
            {sinTareasFixtures.sanctuary.headline}
          </RNText>
          <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {sinTareasFixtures.sanctuary.body}
          </RNText>

          <View style={{ width: '100%', gap: sereneSpacing['space-sm'], marginTop: sereneSpacing['space-xs'] }}>
            <Pressable
              onPress={handleCreateTask}
              accessibilityRole="button"
              accessibilityLabel={sinTareasFixtures.sanctuary.primaryCta}
              style={({ pressed }) => ({
                width: '100%',
                height: s(44),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['primary-container'],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(8),
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={s(19)} color={sereneColors['on-primary']} />
              <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
                {sinTareasFixtures.sanctuary.primaryCta}
              </RNText>
            </Pressable>

            <Pressable
              onPress={handleOpenHistory}
              accessibilityRole="button"
              accessibilityLabel={sinTareasFixtures.sanctuary.secondaryCta}
              style={({ pressed }) => ({
                width: '100%',
                height: s(44),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['secondary-container'],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: s(8),
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <MaterialCommunityIcons name="history" size={s(19)} color={sereneColors['on-secondary-container']} />
              <RNText
                style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-secondary-container'] }]}
              >
                {sinTareasFixtures.sanctuary.secondaryCta}
              </RNText>
            </Pressable>
          </View>
        </View>

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
