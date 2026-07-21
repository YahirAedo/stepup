import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, useResponsive } from '../theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  icon?: string;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = colors.primary,
  bgColor = colors['outline-variant'],
  icon,
}: ProgressRingProps) {
  const { scale: s } = useResponsive();
  const ringSize = s(size);
  const sw = s(strokeWidth);
  const radius = (ringSize - sw) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference * (1 - clamped);

  return (
    <View
      style={{ width: ringSize, height: ringSize, justifyContent: 'center', alignItems: 'center' }}
    >
      <Svg width={ringSize} height={ringSize}>
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={sw}
          fill="none"
        />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${ringSize / 2}, ${ringSize / 2}`}
        />
      </Svg>
      {icon && (
        <View style={{ position: 'absolute' }}>
          <Text style={{ fontSize: s(icon.length > 2 ? 24 : 28) }}>{icon}</Text>
        </View>
      )}
    </View>
  );
}
