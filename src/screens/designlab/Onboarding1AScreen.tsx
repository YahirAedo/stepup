// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import OnboardingProgress from '../../components/designlab/OnboardingProgress';
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
import type { ProfileStackParamList } from '../../types/navigation';
import { onboardingAProblemaFixtures } from './onboardingAFixtures';

/**
 * Los mockups de onboarding piden 16px en las listas; Serene no tiene token en
 * 16 (body-lg = 18, body-md = 15), así que se parte de body-lg y se ajusta.
 */
const listText = {
  ...sereneTypography['body-lg'],
  fontSize: 16,
  lineHeight: 24,
} as TextStyle;

/**
 * Tiles de la grilla 2x2 del visual. Colores mapeados por valor del mockup:
 * #003a24 → primary, #b8efce → primary-fixed (dos veces en el mockup),
 * #d2e8da → secondary-container.
 */
const TILES = [
  { background: sereneColors.primary, bar: withAlpha(sereneColors['surface-container-lowest'], 0.7) },
  { background: sereneColors['primary-fixed'], bar: withAlpha(sereneColors['surface-tint'], 0.6) },
  { background: sereneColors['primary-fixed'], bar: withAlpha(sereneColors['on-primary-fixed'], 0.5) },
  { background: sereneColors['secondary-container'], bar: withAlpha(sereneColors['on-secondary-fixed-variant'], 0.5) },
];

/**
 * Onboarding 1 — "El problema".
 *
 * Una tarea grande a la izquierda, sus pasos a la derecha, y dos motivos por
 * los que cuesta arrancar. El visual de la tarjeta es decorativo.
 */
export default function Onboarding1AScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'Onboarding1A'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = onboardingAProblemaFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress step={1} label={f.progressLabel} />

        {/* Visual decorativo: tarea grande → pasos chicos */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-lg'],
            ...sereneShadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: s(80),
                  height: s(96),
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['on-surface'],
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: s(6),
                  ...sereneShadows.card,
                }}
              >
                {[
                  { width: s(28), alpha: 0.4 },
                  { width: s(40), alpha: 0.3 },
                  { width: s(24), alpha: 0.2 },
                ].map((bar) => (
                  <View
                    key={bar.width}
                    style={{
                      width: bar.width,
                      height: s(6),
                      borderRadius: sereneBorderRadius.full,
                      backgroundColor: withAlpha(sereneColors['surface-variant'], bar.alpha),
                    }}
                  />
                ))}
              </View>
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  {
                    color: sereneColors['on-surface-variant'],
                    textTransform: 'uppercase',
                    marginTop: sereneSpacing['space-sm'],
                  },
                ]}
              >
                {f.visualTaskLabel}
              </RNText>
            </View>

            <MaterialCommunityIcons name={mci('arrow_forward')} size={s(20)} color={sereneColors.outline} />

            <View style={{ alignItems: 'center' }}>
              <View style={{ width: s(104), flexDirection: 'row', flexWrap: 'wrap', gap: s(8) }}>
                {TILES.map((tile, index) => (
                  <View
                    key={index}
                    style={{
                      width: s(48),
                      height: s(40),
                      borderRadius: sereneBorderRadius.lg,
                      backgroundColor: tile.background,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: s(16),
                        height: s(4),
                        borderRadius: sereneBorderRadius.full,
                        backgroundColor: tile.bar,
                      }}
                    />
                  </View>
                ))}
              </View>
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  {
                    color: sereneColors.primary,
                    textTransform: 'uppercase',
                    marginTop: sereneSpacing['space-sm'],
                  },
                ]}
              >
                {f.visualStepsLabel}
              </RNText>
            </View>
          </View>
        </View>

        <RNText style={[sereneTypography['headline-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {f.headline}
        </RNText>

        {f.points.map((point) => (
          <View
            key={point.text}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: sereneSpacing['space-md'],
              padding: sereneSpacing['space-md'],
              borderRadius: sereneBorderRadius.xl,
              backgroundColor: sereneColors['surface-container-lowest'],
              ...sereneShadows.card,
            }}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{
                width: s(40),
                height: s(40),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['secondary-container'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci(point.icon)} size={s(20)} color={sereneColors.primary} />
            </View>
            <RNText style={[listText, { color: sereneColors['on-surface'], flex: 1, minWidth: 0 }]}>
              {point.text}
            </RNText>
          </View>
        ))}
      </ScrollView>

      {/* Barra de acción fija (en flujo del layout, no absolute) */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          onPress={() => navigation.navigate('Onboarding2A')}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.primary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
