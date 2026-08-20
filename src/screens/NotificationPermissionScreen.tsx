import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, useResponsive, moderateScale } from '../theme';
import { storage } from '../services/storage';
import type { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ONBOARDING_KEY = 'hasSeenOnboarding';

function WaveRing({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const { scale: s } = useResponsive();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  const size = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [s(100), s(220)],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.15, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: moderateScale(100),
        borderWidth: 2,
        borderColor: colors.tertiary,
        opacity,
      }}
    />
  );
}

export default function NotificationPermissionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  const completeOnboarding = async () => {
    await storage.setItem(ONBOARDING_KEY, 'true');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -s(80),
          right: -s(80),
          width: s(240),
          height: s(240),
          borderRadius: s(120),
          backgroundColor: colors['tertiary-fixed-dim'],
          opacity: 0.12,
        }}
      />

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
            height: s(220),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing['section-gap'],
          }}
        >
          <WaveRing delay={0} />
          <WaveRing delay={800} />
          <WaveRing delay={1600} />

          <View
            style={{
              width: s(100),
              height: s(100),
              borderRadius: s(50),
              backgroundColor: colors['tertiary-container'],
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: s(40) }}>🔔</Text>
          </View>
        </View>

        <Text
          style={[
            typography['headline-lg-mobile'] as TextStyle,
            {
              color: colors['on-surface'],
              textAlign: 'center',
              marginBottom: spacing['stack-gap'],
            },
          ]}
        >
          Mantené el ritmo sin esfuerzo
        </Text>

        <Text
          style={[
            typography['body-lg'] as TextStyle,
            {
              color: colors['on-surface-variant'],
              textAlign: 'center',
              lineHeight: 28,
            },
          ]}
        >
          Te avisaremos exactamente cuando es tu próximo paso.
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
          onPress={completeOnboarding}
          activeOpacity={0.85}
          style={{
            width: '100%',
            height: 56,
            borderRadius: borderRadius.full,
            backgroundColor: colors.tertiary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={[typography['label-md'] as TextStyle, { color: colors['on-tertiary'] }]}>
            Activar Notificaciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={completeOnboarding}
          activeOpacity={0.7}
          style={{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={[typography['body-md'] as TextStyle, { color: colors['on-surface-variant'] }]}>
            Ahora no
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
