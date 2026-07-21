import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, useResponsive } from '../theme';
import ProgressDots from '../components/ProgressDots';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingScreen1({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <TouchableOpacity
        onPress={() => navigation.replace('Onboarding2')}
        style={{
          position: 'absolute',
          top: insets.top + 8,
          right: spacing['container-padding'],
          zIndex: 10,
        }}
      >
        <Text style={[typography['label-md'] as any, { color: colors['on-surface-variant'] }]}>
          Saltar
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing['container-padding'],
        }}
      >
        <View
          style={{
            width: s(220),
            height: s(180),
            marginBottom: spacing['section-gap'],
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: s(100),
              height: s(100),
              backgroundColor: colors['primary-fixed-dim'],
              borderRadius: borderRadius.lg,
              transform: [{ rotate: '-8deg' }],
            }}
          >
            <View
              style={{
                position: 'absolute',
                right: -s(12),
                bottom: -s(8),
                width: s(36),
                height: s(36),
                backgroundColor: colors.primary,
                borderRadius: borderRadius.sm,
                transform: [{ rotate: '15deg' }],
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: s(16),
                top: s(20),
                width: s(12),
                height: s(12),
                backgroundColor: colors['on-primary'],
                borderRadius: borderRadius.full,
                opacity: 0.3,
              }}
            />
          </View>

          <View
            style={{
              position: 'absolute',
              top: s(20),
              right: 0,
              width: s(70),
              height: s(70),
              backgroundColor: colors['tertiary-fixed-dim'],
              borderRadius: borderRadius.lg,
              transform: [{ rotate: '12deg' }],
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: -s(10),
                top: -s(6),
                width: s(28),
                height: s(28),
                backgroundColor: colors.tertiary,
                borderRadius: borderRadius.sm,
                transform: [{ rotate: '-10deg' }],
              }}
            />
          </View>

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: s(30),
              width: s(80),
              height: s(80),
              backgroundColor: colors['secondary-fixed-dim'],
              borderRadius: borderRadius.lg,
              transform: [{ rotate: '-15deg' }],
            }}
          >
            <View
              style={{
                position: 'absolute',
                right: s(8),
                top: s(10),
                width: s(16),
                height: s(16),
                backgroundColor: colors['on-secondary-container'],
                borderRadius: borderRadius.full,
                opacity: 0.25,
              }}
            />
          </View>

          <View
            style={{
              position: 'absolute',
              top: s(40),
              left: s(30),
              width: s(40),
              height: s(40),
              backgroundColor: colors['surface-container-high'],
              borderRadius: borderRadius.full,
              opacity: 0.5,
            }}
          />
        </View>

        <Text
          style={[
            typography['headline-lg-mobile'] as any,
            {
              color: colors['on-surface'],
              textAlign: 'center',
              marginBottom: spacing['stack-gap'],
            },
          ]}
        >
          Un paso a la vez
        </Text>

        <Text
          style={[
            typography['body-lg'] as any,
            {
              color: colors['on-surface-variant'],
              textAlign: 'center',
              lineHeight: 28,
            },
          ]}
        >
          Dividimos tus metas en fragmentos de 5 a 15 minutos para que empezar sea lo más fácil.
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: insets.bottom + spacing['container-padding'],
          gap: spacing['stack-gap'],
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Onboarding2')}
          activeOpacity={0.85}
          style={{
            width: '100%',
            height: 56,
            borderRadius: borderRadius.full,
            backgroundColor: colors['primary-container'],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={[typography['label-md'] as any, { color: colors['on-primary'] }]}>
            Siguiente
          </Text>
        </TouchableOpacity>

        <ProgressDots total={3} active={0} />
      </View>
    </View>
  );
}
