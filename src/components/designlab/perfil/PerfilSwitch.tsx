import React from 'react';
import { Pressable, View } from 'react-native';
import { sereneColors, sereneBorderRadius, useResponsive } from '../../../theme/serene';

export interface PerfilSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Etiqueta accesible del control. */
  label: string;
  disabled?: boolean;
}

/**
 * Switch del Design Lab. Se dibuja a mano (track + knob) para respetar los
 * tokens Serene en vez del `Switch` nativo, que no acepta theme.
 */
export default function PerfilSwitch({ value, onValueChange, label, disabled = false }: PerfilSwitchProps) {
  const { scale: s } = useResponsive();
  const trackWidth = s(48);
  const trackHeight = s(28);
  const knob = s(22);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minWidth: s(48),
        minHeight: s(44),
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed && !disabled ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: trackWidth,
          height: trackHeight,
          borderRadius: sereneBorderRadius.full,
          padding: (trackHeight - knob) / 2,
          justifyContent: 'center',
          backgroundColor: value ? sereneColors.primary : sereneColors['surface-container-highest'],
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View
          style={{
            width: knob,
            height: knob,
            borderRadius: sereneBorderRadius.full,
            backgroundColor: value ? sereneColors['on-primary'] : sereneColors['surface-container-lowest'],
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </Pressable>
  );
}
