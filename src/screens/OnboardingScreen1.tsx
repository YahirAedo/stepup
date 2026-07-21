import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, scale } from '../theme';
import ProgressDots from '../components/ProgressDots';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingScreen1({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <TouchableOpacity
        onPress={() => navigation.replace('Onboarding2')}
        style={{ position: 'absolute', top: 60, right: 24, zIndex: 10 }}
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
            width: scale(240),
            height: scale(240),
            marginBottom: spacing['section-gap'],
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: scale(8),
              left: scale(16),
              width: scale(100),
              height: scale(100),
              backgroundColor: colors['primary-fixed-dim'],
              borderRadius: borderRadius.md,
              transform: [{ rotate: '-12deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: scale(60),
              right: scale(20),
              width: scale(70),
              height: scale(70),
              backgroundColor: colors['tertiary-fixed-dim'],
              borderRadius: borderRadius.md,
              transform: [{ rotate: '8deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: scale(30),
              left: scale(40),
              width: scale(80),
              height: scale(80),
              backgroundColor: colors['secondary-fixed-dim'],
              borderRadius: borderRadius.md,
              transform: [{ rotate: '20deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: scale(8),
              right: scale(30),
              width: scale(50),
              height: scale(50),
              backgroundColor: colors['surface-container-high'],
              borderRadius: borderRadius.md,
              transform: [{ rotate: '-5deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: scale(100),
              left: scale(80),
              width: scale(90),
              height: scale(90),
              backgroundColor: colors['primary-container'],
              borderRadius: borderRadius.full,
              opacity: 0.15,
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
          paddingBottom: spacing['container-padding'],
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
