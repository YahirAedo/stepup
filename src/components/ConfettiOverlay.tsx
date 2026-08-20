import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

interface ConfettiOverlayProps {
  visible: boolean;
}

const COLORS = ['#a9d293', '#2d4f1e', '#98c083', '#d6e3ff', '#8fb6fb'];
const PARTICLE_COUNT = 30;

function Particle({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  const { width: screenW } = Dimensions.get('window');
  const x = Math.random() * screenW;
  const size = 6 + Math.random() * 8;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const rotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() * 360}deg`],
  });

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 3000 + Math.random() * 2000,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color,
        opacity: anim.interpolate({
          inputRange: [0, 0.1, 1],
          outputRange: [0, 1, 0],
        }),
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, Dimensions.get('window').height * 0.8],
            }),
          },
          { rotate: rotation },
          {
            translateX: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, (Math.random() - 0.5) * 100],
            }),
          },
        ],
      }}
    />
  );
}

export default function ConfettiOverlay({ visible }: ConfettiOverlayProps) {
  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
      }}
    >
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <Particle key={i} delay={i * 80} />
      ))}
    </View>
  );
}
