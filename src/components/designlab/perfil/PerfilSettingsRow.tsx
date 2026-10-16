import React, { type ComponentProps } from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';
import PerfilSwitch from './PerfilSwitch';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type PerfilRowAccessory = 'chevron' | 'switch' | 'none';

export interface PerfilSettingsRowProps {
  /** Icono MCI a la izquierda del titulo. */
  icon?: MciName;
  title: string;
  /** Linea secundaria debajo del titulo. */
  subtitle?: string;
  /** Texto de valor a la derecha (antes del chevron si lo hay). */
  value?: string;
  /** Color del texto de valor. */
  valueTone?: 'default' | 'positive' | 'error';
  accessory?: PerfilRowAccessory;
  switchValue?: boolean;
  onToggleSwitch?: (value: boolean) => void;
  onPress?: () => void;
  /** Pinta el titulo con el color de error (ej. cerrar sesion). */
  destructive?: boolean;
  /** Dibuja la linea divisoria inferior. `false` en la ultima fila del grupo. */
  showDivider?: boolean;
  /**
   * Aplica el padding horizontal propio de la fila. `false` cuando la fila vive
   * dentro de una tarjeta que ya tiene su propio padding (Variante A).
   */
  horizontalInset?: boolean;
}

/**
 * Fila de ajustes estilo nativo: icono, titulo, subtitulo, valor y accesorio
 * (chevron o switch). Reusada por la Variante B (cuerpo entero) y por A/C para
 * los enlaces de cuenta y la fila de logros.
 */
export default function PerfilSettingsRow({
  icon,
  title,
  subtitle,
  value,
  valueTone = 'default',
  accessory = 'none',
  switchValue,
  onToggleSwitch,
  onPress,
  destructive = false,
  showDivider = true,
  horizontalInset = true,
}: PerfilSettingsRowProps) {
  const { scale: s } = useResponsive();

  const titleColor = destructive ? sereneColors.error : sereneColors['on-surface'];
  const iconColor = destructive ? sereneColors.error : sereneColors['on-surface-variant'];
  const valueColor =
    valueTone === 'error'
      ? sereneColors.error
      : valueTone === 'positive'
        ? sereneColors.primary
        : sereneColors['on-surface-variant'];
  const isSwitch = accessory === 'switch';
  const interactive = !isSwitch && onPress !== undefined;

  return (
    <Pressable
      onPress={interactive ? onPress : undefined}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={interactive ? title : undefined}
      style={({ pressed }) => ({
        minHeight: s(56),
        flexDirection: 'row',
        alignItems: 'center',
        gap: sereneSpacing['space-md'],
        paddingHorizontal: horizontalInset ? sereneSpacing['space-md'] : 0,
        paddingVertical: sereneSpacing['space-sm'],
        backgroundColor: pressed && interactive ? sereneColors['surface-container-high'] : 'transparent',
      })}
    >
      {icon ? (
        <MaterialCommunityIcons name={icon} size={s(22)} color={iconColor} />
      ) : null}

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <RNText style={[sereneTypography['body-md'] as TextStyle, { color: titleColor }]}>
          {title}
        </RNText>
        {subtitle ? (
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {subtitle}
          </RNText>
        ) : null}
      </View>

      {value ? (
        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: valueColor },
          ]}
        >
          {value}
        </RNText>
      ) : null}

      {accessory === 'chevron' ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={s(22)}
          color={sereneColors['on-surface-variant']}
        />
      ) : null}

      {accessory === 'switch' ? (
        <PerfilSwitch
          value={switchValue ?? false}
          onValueChange={(next) => onToggleSwitch?.(next)}
          label={title}
        />
      ) : null}

      {showDivider ? (
        <View
          style={{
            position: 'absolute',
            left: horizontalInset ? sereneSpacing['space-md'] : 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: withAlpha(sereneColors.outline, 0.2),
          }}
        />
      ) : null}
    </Pressable>
  );
}
