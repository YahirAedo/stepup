import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';

export interface MinutesStepperProps {
  value: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  /** `compact` para filas densas del formulario; `regular` para el sheet. */
  size?: 'compact' | 'regular';
  /** Etiqueta accesible del grupo. */
  label?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Control +/- para editar la duración de un paso (1..30 min). Reusable por el
 * formulario de Crear/Editar (tamaño `compact`) y por el sheet "Editar paso".
 */
export default function MinutesStepper({
  value,
  onChange,
  min = 1,
  max = 30,
  size = 'regular',
  label = 'Duración del paso',
}: MinutesStepperProps) {
  const { scale: s } = useResponsive();
  const compact = size === 'compact';
  const buttonSize = compact ? s(32) : s(44);
  const iconSize = compact ? s(16) : s(20);
  const valueMinWidth = compact ? s(44) : s(56);
  const atMin = value <= min;
  const atMax = value >= max;

  const step = (delta: number) => onChange(clamp(value + delta, min, max));

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? s(4) : s(6) }}
    >
      <Pressable
        onPress={() => step(-1)}
        disabled={atMin}
        accessibilityRole="button"
        accessibilityLabel="Quitar un minuto"
        style={({ pressed }) => ({
          width: buttonSize,
          height: buttonSize,
          borderRadius: sereneBorderRadius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors['surface-container-high'],
          opacity: atMin ? 0.4 : pressed ? 0.85 : 1,
        })}
      >
        <MaterialCommunityIcons name="minus" size={iconSize} color={sereneColors['on-surface']} />
      </Pressable>

      <RNText
        style={[
          (compact ? sereneTypography['label-md'] : sereneTypography['title-md']) as TextStyle,
          { color: sereneColors['on-surface'], minWidth: valueMinWidth, textAlign: 'center' },
        ]}
      >
        {`~${value} min`}
      </RNText>

      <Pressable
        onPress={() => step(1)}
        disabled={atMax}
        accessibilityRole="button"
        accessibilityLabel="Sumar un minuto"
        style={({ pressed }) => ({
          width: buttonSize,
          height: buttonSize,
          borderRadius: sereneBorderRadius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors['surface-container-high'],
          opacity: atMax ? 0.4 : pressed ? 0.85 : 1,
        })}
      >
        <MaterialCommunityIcons name="plus" size={iconSize} color={sereneColors['on-surface']} />
      </Pressable>
    </View>
  );
}
