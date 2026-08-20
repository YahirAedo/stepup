import React from 'react';
import {
  TouchableOpacity,
  Text,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import { colors, typography, borderRadius } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: {
    bg: colors['primary-container'],
    text: colors['on-primary'],
  },
  secondary: {
    bg: 'transparent',
    text: colors['on-surface-variant'],
    border: colors['outline-variant'],
  },
  tertiary: {
    bg: colors['tertiary-container'],
    text: colors['on-tertiary'],
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 56,
          borderRadius: borderRadius.full,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          paddingHorizontal: 24,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[typography['label-md'] as TextStyle, { color: v.text }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
