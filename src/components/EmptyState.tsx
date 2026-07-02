import React from 'react';
import { View, Text, type ViewStyle, type StyleProp } from 'react-native';
import { colors, typography, spacing } from '../theme';
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
          width: 200,
          height: 200,
          marginBottom: spacing['stack-gap'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors['surface-container-high'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 48, opacity: 0.4 }}>🪴</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            width: 160,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors['surface-container-highest'],
          }}
        />
      </View>

      <Text
        style={[
          typography['headline-lg-mobile'] as any,
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
          typography['body-md'] as any,
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
          style={{ paddingHorizontal: 32 }}
        />
      )}
    </View>
  );
}
