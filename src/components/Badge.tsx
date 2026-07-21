import React from 'react';
import { View, Text } from 'react-native';
import { typography } from '../theme';

type BadgeVariant = 'urgent' | 'pending' | 'completed' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  urgent:    { bg: '#FFE8D6', text: '#9D430A' },
  pending:   { bg: '#D6E4FF', text: '#002F64' },
  completed: { bg: '#DDF0D4', text: '#2D4F1E' },
  default:   { bg: '#EEEEE7', text: '#43493E' },
};

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        backgroundColor: v.bg,
      }}
    >
      <Text
        style={[
          typography['label-sm'] ,
          { color: v.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
