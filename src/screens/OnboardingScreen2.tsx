import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, useResponsive } from '../theme';
import ProgressDots from '../components/ProgressDots';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingScreen2({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const fade3 = useRef(new Animated.Value(0)).current;
  const fade4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fade1, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fade2, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fade3, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fade4, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade1, fade2, fade3, fade4]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing['container-padding'],
        }}
      >
        <Animated.View
          style={{
            opacity: fade1,
            transform: [
              {
                translateY: fade1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginBottom: spacing['section-gap'],
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: s(160),
              height: s(160),
              borderRadius: s(80),
              backgroundColor: colors['primary-fixed-dim'],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: s(60), lineHeight: s(68) }}>🎯</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fade2,
            transform: [
              {
                translateY: fade2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginBottom: spacing['stack-gap'],
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: borderRadius.full,
              backgroundColor: colors['secondary-fixed-dim'],
              alignSelf: 'center',
            }}
          >
            <Text style={[typography['label-sm'] as any, { color: colors['on-secondary-fixed'] }]}>
              ✅ Paso Final
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fade3,
            transform: [
              {
                translateY: fade3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            alignItems: 'center',
          }}
        >
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
            Tu flujo comienza aquí
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
            Crea tu primera tarea y experimentá la claridad de enfocarte en un solo paso.
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={{
          opacity: fade4,
          transform: [
            {
              translateY: fade4.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: insets.bottom + spacing['container-padding'],
          gap: spacing['stack-gap'],
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('NotificationPermission')}
          activeOpacity={0.85}
          style={{
            width: '100%',
            height: 64,
            borderRadius: borderRadius.full,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <Text style={[typography['label-md'] as any, { color: colors['on-primary'] }]}>
            Empezar
          </Text>
          <Text style={{ fontSize: s(20), color: colors['on-primary'] }}>→</Text>
        </TouchableOpacity>

        <ProgressDots total={3} active={2} />
      </Animated.View>
    </View>
  );
}
