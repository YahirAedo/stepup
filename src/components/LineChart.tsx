import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';

interface LineChartProps {
  data: number[];
  height?: number;
  color?: string;
  dotColor?: string;
}

export default function LineChart({
  data,
  height = 160,
  color = colors['primary-container'],
  dotColor = '#FFFFFF',
}: LineChartProps) {
  const max = Math.max(1, ...data);
  const padding = 8;

  return (
    <View style={{ height, width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {data.map((val, i) => {
        const pct = val / max;
        const barHeight = Math.max(4, pct * (height - padding * 2));
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            {/* Area fill */}
            <View
              style={{
                width: '100%',
                height: barHeight,
                backgroundColor: color,
                opacity: 0.5 + pct * 0.3,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                position: 'relative',
              }}
            />
            {/* Dot marker */}
            <View
              style={{
                position: 'absolute',
                top: barHeight - 6,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: dotColor,
                borderWidth: 2,
                borderColor: color,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
