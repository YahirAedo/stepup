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
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import OnboardingProgress from '../../../components/ui/OnboardingProgress';
import type { OnboardingASolutionFixtures } from '../logic/authCopy';

const listText = {
  ...sereneTypography['body-lg'],
  fontSize: 16,
  lineHeight: 24,
} as TextStyle;

export interface OnboardingSolutionViewProps {
  copy: OnboardingASolutionFixtures;
  onPrimary: () => void;
}

export default function OnboardingSolutionView({ copy, onPrimary }: OnboardingSolutionViewProps) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <View style={{ paddingTop: insets.top + sereneSpacing['space-md'], paddingHorizontal: sereneSpacing.margin, paddingBottom: sereneSpacing['space-sm'] }}>
        <OnboardingProgress step={2} label={copy.progressLabel} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
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
                backgroundColor: sereneColors['surface-container-low'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci(point.icon)} size={s(20)} color={sereneColors.primary} importantForAccessibility="no" accessibilityElementsHidden />
            </View>
            <RNText style={[listText, { color: sereneColors['on-surface'], flex: 1, minWidth: 0 }]}>{point.text}</RNText>
          </View>
        ))}

        <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}>{copy.footnote}</RNText>

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
