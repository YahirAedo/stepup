import React from 'react';
import { Pressable, StyleProp, ViewStyle, TextStyle, Text as RNText, View } from 'react-native';
import { colors, typography, shadows, useResponsive, useBottomLayout } from '../theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  visible?: boolean;
  icon?: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}

export function FloatingActionButton({
  onPress,
  visible = true,
  icon = '+',
  label,
  variant = 'primary',
  style,
}: FloatingActionButtonProps) {
  const { scale: s } = useResponsive();
  const { fabSize, fabOffset } = useBottomLayout();

  if (!visible) return null;

  const iconSize = s(26);
  const rightMargin = s(24);

  const bgColor = variant === 'primary' ? colors['primary-container'] : colors['secondary-container'];
  const textColor = variant === 'primary' ? colors['on-primary-container'] : colors['on-secondary-container'];

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          position: 'absolute',
          right: rightMargin,
          bottom: fabOffset,
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: bgColor,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadows.fab,
          zIndex: 1000,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label ?? 'Acción principal'}
    >
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), paddingHorizontal: s(12) }}>
          <RNText style={[
            typography['label-md'] as TextStyle,
            { color: textColor },
          ]}>
            {label}
          </RNText>
        </View>
      ) : (
        <RNText style={[
          { fontSize: iconSize, color: textColor, transform: [{ translateY: -3 }] } as TextStyle,
        ]}>
          {icon}
        </RNText>
      )}
    </Pressable>
  );
}