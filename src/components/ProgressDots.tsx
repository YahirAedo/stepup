import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';

interface ProgressDotsProps {
  total: number;
  active: number;
  color?: string;
}

export default function ProgressDots({ total, active, color = colors.primary }: ProgressDotsProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === active ? color : colors['outline-variant'],
          }}
        />
      ))}
    </View>
  );
}
