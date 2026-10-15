import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';

export interface DurationChipsProps {
  /** Minutos seleccionados. */
  value: number;
  /** Opciones de duracion en minutos. */
  options?: number[];
  onChange: (minutes: number) => void;
  /** Etiqueta accesible del grupo. */
  label?: string;
}

const DEFAULT_OPTIONS = [1, 2, 3, 5, 10];

/**
 * Chips de duracion (1/2/3/5/10 min) para elegir el tamano de un paso.
 * Reusable por las 3 variantes de Crear y por el sheet "Editar paso".
 */
export default function DurationChips({
  value,
  options = DEFAULT_OPTIONS,
  onChange,
  label = 'Duración del paso',
}: DurationChipsProps) {
  const { scale: s } = useResponsive();

  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText
        style={[
          sereneTypography['label-md'] as TextStyle,
          { color: sereneColors['on-surface-variant'] },
        ]}
      >
        {label}
      </RNText>

      <View
        accessibilityRole="radiogroup"
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sereneSpacing['space-sm'] }}
      >
        {options.map((minutes) => {
          const active = minutes === value;
          return (
            <Pressable
              key={minutes}
              onPress={() => onChange(minutes)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${minutes} minutos`}
              style={({ pressed }) => ({
                minHeight: s(44),
                minWidth: s(48),
                paddingHorizontal: s(12),
                paddingVertical: s(8),
                borderRadius: sereneBorderRadius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active
                  ? sereneColors['primary-container']
                  : sereneColors['surface-container-high'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <RNText
                style={[
                  sereneTypography['label-md'] as TextStyle,
                  { color: active ? sereneColors['on-primary'] : sereneColors['on-surface'] },
                ]}
              >
                {`${minutes} min`}
              </RNText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
