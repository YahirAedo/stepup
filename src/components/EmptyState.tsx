import React from 'react';
import { View, Text, type ViewStyle, type StyleProp } from 'react-native';
import { colors, typography, spacing, scale, moderateScale } from '../theme';
import Button from './Button';

interface EmptyStateProps {
  headline: string;
  subtext: string;
  cta?: string;
  onCtaPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
  headline,
  subtext,
  cta,
  onCtaPress,
  style,
}: EmptyStateProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing['container-padding'],
        },
        style,
      ]}
    >
      <View
        style={{
          width: scale(200),
          height: scale(200),
          marginBottom: spacing['stack-gap'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: scale(120),
            height: scale(120),
            borderRadius: scale(120) / 2,
            backgroundColor: colors['surface-container-high'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: moderateScale(48), opacity: 0.4 }}>🪴</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: moderateScale(20),
            width: scale(160),
            height: moderateScale(8),
            borderRadius: 4,
            backgroundColor: colors['surface-container-highest'],
          }}
        />
      </View>

      <Text
        style={[
          typography['headline-lg-mobile'] ,
          {
            color: colors.primary,
            textAlign: 'center',
            marginBottom: spacing.unit * 2,
          },
        ]}
      >
        {headline}
      </Text>

      <Text
        style={[
          typography['body-md'] ,
          {
            color: colors['on-surface-variant'],
            textAlign: 'center',
            marginBottom: spacing['section-gap'],
          },
        ]}
      >
        {subtext}
      </Text>

      {cta && onCtaPress && (
        <Button
          title={cta}
          onPress={onCtaPress}
          variant="tertiary"
          style={{ paddingHorizontal: moderateScale(32) }}
        />
      )}
    </View>
  );
}
