import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import OnboardingProgress from '../../../components/ui/OnboardingProgress';
import type { OnboardingAProblemFixtures } from '../logic/authCopy';

const listText = {
  ...sereneTypography['body-lg'],
  fontSize: 16,
  lineHeight: 24,
} as TextStyle;

const TILES = [
  { background: sereneColors.primary, bar: withAlpha(sereneColors['surface-container-lowest'], 0.7) },
  { background: sereneColors['primary-fixed'], bar: withAlpha(sereneColors['surface-tint'], 0.6) },
  { background: sereneColors['primary-fixed'], bar: withAlpha(sereneColors['on-primary-fixed'], 0.5) },
  { background: sereneColors['secondary-container'], bar: withAlpha(sereneColors['on-secondary-fixed-variant'], 0.5) },
];

export interface OnboardingProblemViewProps {
  copy: OnboardingAProblemFixtures;
  onPrimary: () => void;
}

export default function OnboardingProblemView({ copy, onPrimary }: OnboardingProblemViewProps) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <View style={{ paddingTop: insets.top + sereneSpacing['space-md'], paddingHorizontal: sereneSpacing.margin, paddingBottom: sereneSpacing['space-sm'] }}>
        <OnboardingProgress step={1} label={copy.progressLabel} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
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
                {[{ width: s(28), alpha: 0.4 }, { width: s(40), alpha: 0.3 }, { width: s(24), alpha: 0.2 }].map((bar) => (
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
              <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', marginTop: sereneSpacing['space-sm'] }]}>
                {copy.visualTaskLabel}
              </RNText>
            </View>

            <MaterialCommunityIcons name={mci('arrow_forward')} size={s(20)} color={sereneColors.outline} importantForAccessibility="no" accessibilityElementsHidden />

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
                    <View style={{ width: s(16), height: s(4), borderRadius: sereneBorderRadius.full, backgroundColor: tile.bar }} />
                  </View>
                ))}
              </View>
              <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary, textTransform: 'uppercase', marginTop: sereneSpacing['space-sm'] }]}>
                {copy.visualStepsLabel}
              </RNText>
            </View>
          </View>
        </View>

        <RNText style={[sereneTypography['headline-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>{copy.headline}</RNText>

        {copy.points.map((point) => (
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
              <MaterialCommunityIcons name={mci(point.icon)} size={s(20)} color={sereneColors.primary} importantForAccessibility="no" accessibilityElementsHidden />
            </View>
            <RNText style={[listText, { color: sereneColors['on-surface'], flex: 1, minWidth: 0 }]}>{point.text}</RNText>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.primary}
          onPress={onPrimary}
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
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>{copy.primary}</RNText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
