// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProgressTrack from '../ProgressTrack';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import {
  completedStepCount,
  computeTotalMinutes,
  remainingMinutes,
  stepCountLabel,
} from '../../../utils/microplan';
import type { FlujoCPasoProgress } from '../../../screens/designlab/tareasFlujoCFixtures';

export interface TaskProgressRowProps {
  title: string;
  steps: FlujoCPasoProgress[];
  onPress?: () => void;
}

/**
 * Fila compacta de progreso de la Variante C "Sendero": título de la tarea,
 * resumen de pasos (`completedStepCount` + `stepCountLabel`), minutos
 * restantes (`remainingMinutes`) sobre el total (`computeTotalMinutes`) y una
 * barra corta con el avance. Sin porcentajes: todo sale de los datos de entrada.
 */
export default function TaskProgressRow({ title, steps, onPress }: TaskProgressRowProps) {
  const { scale: s } = useResponsive();

  const done = completedStepCount(steps);
  const total = computeTotalMinutes(steps);
  const restantes = remainingMinutes(steps);
  const progress = steps.length > 0 ? done / steps.length : 0;

  const meta = `${done} de ${stepCountLabel(steps.length)} listos · ~${restantes} min de ${total} min`;
  const a11yLabel = `${title}. ${meta}`;

  const content = (
    <View
      style={{
        gap: s(6),
        paddingVertical: sereneSpacing['space-md'],
        paddingHorizontal: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['on-surface'], flex: 1, minWidth: 0, flexWrap: 'wrap' },
          ]}
        >
          {title}
        </RNText>
        {onPress !== undefined && (
          <MaterialCommunityIcons name={mci('arrow_forward_ios')} size={s(16)} color={sereneColors['on-surface-variant']} />
        )}
      </View>

      <RNText
        style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
      >
        {meta}
      </RNText>

      <ProgressTrack progress={progress} height={s(4)} />
    </View>
  );

  if (onPress === undefined) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Tocá para abrir el detalle de la tarea"
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      {content}
    </Pressable>
  );
}
