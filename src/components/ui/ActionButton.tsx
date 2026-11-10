import React from 'react';
import { Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { getActionButtonPalette } from './actionButtonPalette';

export interface ActionButtonProps {
  variant: 'primary' | 'secondary';
  label: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function ActionButton({
  variant,
  label,
  onPress,
  icon,
  disabled = false,
  accessibilityLabel,
}: ActionButtonProps) {
  const { scale: s } = useResponsive();
  const palette = getActionButtonPalette(variant);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        width: '100%',
        minHeight: s(48),
        borderRadius: sereneBorderRadius.lg,
        backgroundColor: sereneColors[palette.background as keyof typeof sereneColors],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sereneSpacing['space-sm'],
        paddingVertical: sereneSpacing['space-sm'],
        opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
      })}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={s(20)}
          color={sereneColors[palette.content as keyof typeof sereneColors]}
          accessible={false}
          importantForAccessibility="no"
        />
      ) : null}
      <RNText
        style={[
          sereneTypography['label-lg'] as TextStyle,
          { color: sereneColors[palette.content as keyof typeof sereneColors] },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  );
}