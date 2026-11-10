import React, { type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../../theme/serene';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface PerfilPrimaryButtonProps {
  label: string;
  icon?: MciName;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * CTA primario de las previews de Perfil (fondo `primary`). Un solo boton
 * primario por pantalla; se reusa en las 3 variantes.
 */
export default function PerfilPrimaryButton({
  label,
  icon,
  onPress,
  disabled = false,
  loading = false,
}: PerfilPrimaryButtonProps) {
  const { scale: s } = useResponsive();
  const blocked = disabled || loading;

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
        borderRadius: sereneBorderRadius.lg,
        backgroundColor: sereneColors.primary,
        opacity: blocked ? 0.6 : pressed ? 0.9 : 1,
        ...sereneShadows.card,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={sereneColors['on-primary']} />
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={s(20)} color={sereneColors['on-primary']} />
      ) : null}
      <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
        {label}
      </RNText>
    </Pressable>
  );
}
