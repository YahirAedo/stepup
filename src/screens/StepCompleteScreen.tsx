import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../types/navigation';
import { colors, typography, spacing, borderRadius, shadows, scale } from '../theme';
import ConfettiOverlay from '../components/ConfettiOverlay';

type Props = NativeStackScreenProps<TasksStackParamList, 'StepComplete'>;

export default function StepCompleteScreen({ navigation, route }: Props) {
  const { stepName, stepDuration, nextStepName } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkScale = scaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 1],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <ConfettiOverlay visible />

      {/* Animated checkmark */}
      <Animated.View
        style={{
          width: scale(120),
          height: scale(120),
          borderRadius: scale(120) / 2,
          backgroundColor: '#a9d293',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: checkScale }],
          ...shadows.card,
        }}
      >
        <Text style={{ fontSize: 48, color: '#FFFFFF' }}>✓</Text>
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          alignItems: 'center',
          paddingHorizontal: 32,
          marginTop: spacing['stack-gap'] * 2,
        }}
      >
        <Text
          style={[
            typography.display,
            {
              color: colors['on-surface'],
              textAlign: 'center',
              fontSize: 36,
              marginBottom: spacing.unit * 3,
            },
          ]}
        >
          Paso{'\n'}completado!
        </Text>

        <Text
          style={[
            typography['body-lg'],
            {
              color: colors['on-surface-variant'],
              textAlign: 'center',
              marginBottom: spacing['section-gap'],
            },
          ]}
        >
          {stepName}
          {stepDuration ? ` (${stepDuration}m)` : ''} listo.
        </Text>

        {nextStepName && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: borderRadius.full,
              backgroundColor: colors['tertiary'],
              ...shadows.fab,
            }}
          >
            <Text style={[typography['label-md'], { color: colors['on-tertiary'], fontSize: 15 }]}>
              Siguiente paso: {nextStepName}
            </Text>
            <Text style={{ color: colors['on-tertiary'], fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.popToTop()}
          style={{ marginTop: spacing['stack-gap'], padding: spacing['stack-gap'] }}
        >
          <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
