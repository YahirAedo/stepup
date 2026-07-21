import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { colors, typography, shadows, scale } from '../theme';

interface TimerWidgetProps {
  display: string;
  finished: boolean;
}

export default function TimerWidget({ display, finished }: TimerWidgetProps) {
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [ringAnim]);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Breathing rings */}
      <Animated.View
        style={{
          position: 'absolute',
          width: scale(256),
          height: scale(256),
          borderRadius: scale(256) / 2,
          borderWidth: 1,
          borderColor: `${colors['tertiary-container']}4D`,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: scale(320),
          height: scale(320),
          borderRadius: scale(320) / 2,
          borderWidth: 1,
          borderColor: `${colors['tertiary-container']}33`,
          opacity: ringOpacity,
          transform: [{ scale: ringAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }) }],
        }}
      />

      {/* Glass card circle */}
      <View
        style={{
          width: scale(224),
          height: scale(224),
          borderRadius: scale(224) / 2,
          backgroundColor: 'rgba(255,255,255,0.4)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.ambient,
        }}
      >
        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <Text
            style={{
              fontSize: 32,
              color: colors.tertiary,
              marginBottom: 8,
            }}
          >
            ⏱
          </Text>
          <Text
            style={[
              typography['headline-md'] ,
              {
                color: colors['tertiary-container'],
                fontSize: 32,
              },
            ]}
          >
            {finished ? '¡Listo!' : display}
          </Text>
          <Text
            style={[
              typography['label-sm'] ,
              {
                color: colors['on-surface-variant'],
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginTop: 4,
              },
            ]}
          >
            Tiempo Restante
          </Text>
        </View>
      </View>
    </View>
  );
}
