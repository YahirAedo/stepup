import React from 'react';
import { Pressable, Text as RNText, type TextStyle } from 'react-native';
import { sereneColors, sereneTypography, sereneSpacing, useResponsive } from '../../../theme/serene';

export interface AuthTextLinkProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Link de texto del flujo de acceso: Space Grotesk `label-lg` en `primary`,
 * con 48 px de alto para que sea tocable. Un único estilo para "Crear cuenta"
 * e "Iniciar sesión".
 */
export default function AuthTextLink({ label, onPress, disabled = false }: AuthTextLinkProps) {
  const { scale: s } = useResponsive();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        minHeight: s(48),
        justifyContent: 'center',
        paddingHorizontal: sereneSpacing['space-xs'],
        opacity: pressed && !disabled ? 0.7 : 1,
      })}
    >
      <RNText
        style={[
          sereneTypography['label-lg'] as TextStyle,
          { color: disabled ? sereneColors['on-surface-variant'] : sereneColors.primary },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  );
}
