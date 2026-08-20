import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { colors, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors['surface-container-low'],
          borderRadius: borderRadius.xl,
          padding: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.4)',
        },
        shadows.ambient,
        style,
      ]}
    >
      {children}
    </View>
  );
}
