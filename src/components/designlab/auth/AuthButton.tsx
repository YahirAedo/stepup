import React from 'react';
import { ActivityIndicator, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci, type MciSymbolKey } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';

export interface AuthButtonProps {
  label: string;
  onPress: () => void;
  /** `outline`: contorno de 1,5 px en `primary`. */
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  /** Spinner nativo dentro del botón, junto a la etiqueta. */
  loading?: boolean;
  icon?: MciSymbolKey;
}

/**
 * Botón de 48 px y radio `xl` del flujo de acceso (Design Lab). `label-lg` es
 * el token de Space Grotesk para botones y links.
 */
export default function AuthButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: AuthButtonProps) {
  const { scale: s } = useResponsive();
  const blocked = disabled || loading;

  const background = disabled
    ? sereneColors['surface-container-high']
    : variant === 'primary'
      ? loading
        ? withAlpha(sereneColors.primary, 0.85)
        : sereneColors.primary
      : sereneColors['surface-container-lowest'];
  const textColor = disabled
    ? sereneColors['on-surface-variant']
    : variant === 'primary'
      ? sereneColors['on-primary']
      : sereneColors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      style={({ pressed }) => ({
        minHeight: s(48),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sereneSpacing['space-sm'],
        paddingHorizontal: sereneSpacing['space-md'],
        paddingVertical: sereneSpacing['space-sm'],
        borderRadius: sereneBorderRadius.xl,
        borderWidth: variant === 'outline' && !disabled ? 1.5 : 0,
        borderColor: variant === 'outline' && !disabled ? sereneColors.primary : 'transparent',
        backgroundColor: background,
        ...(variant === 'primary' ? sereneShadows.card : null),
        opacity: pressed && !blocked ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? sereneColors['on-primary'] : sereneColors.primary}
        />
      ) : icon ? (
        <MaterialCommunityIcons name={mci(icon)} size={s(20)} color={textColor} />
      ) : null}

      <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: textColor }]}>{label}</RNText>
    </Pressable>
  );
}
