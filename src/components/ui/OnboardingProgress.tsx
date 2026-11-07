import React from 'react';
import { View } from 'react-native';
import { sereneColors, sereneSpacing, sereneBorderRadius, useResponsive } from '../../theme/serene';

/** Cantidad de pantallas de onboarding (indicador de 2 pasos). */
const TOTAL_STEPS = 2;

export interface OnboardingProgressProps {
  /** Paso activo, 1-based. */
  step: 1 | 2;
  /** Etiqueta accesible, ej. "Paso 1 de 2". */
  label: string;
}

/**
 * Indicador de progreso del onboarding: pastilla 24x8 en `primary` para el
 * paso activo y punto 8x8 en `surface-dim` para el inactivo.
 */
export default function OnboardingProgress({ step, label }: OnboardingProgressProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sereneSpacing['space-sm'],
      }}
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => {
        const active = index + 1 === step;
        return (
          <View
            key={index}
            style={{
              width: active ? s(24) : s(8),
              height: s(8),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: active ? sereneColors.primary : sereneColors['surface-dim'],
            }}
          />
        );
      })}
    </View>
  );
}
