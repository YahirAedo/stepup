// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';
import { clockLabel } from '../../../utils/microplan';

export type TimelineStepVariant = 'completed' | 'active' | 'pending';

export interface TimelineStepProps {
  title: string;
  durationMin: number;
  /** Texto secundario bajo el título (ej. "Ahora · 4 min"). */
  meta?: string;
  variant: TimelineStepVariant;
  /** Minuto acumulado en el que arranca el paso; se muestra como "MM:00". */
  startMinutes?: number;
  onPress?: () => void;
  /** El último paso de la lista no dibuja el tramo de riel siguiente. */
  isLast?: boolean;
}

/**
 * Fila de la timeline vertical de la Variante C "Sendero": riel (punto + línea)
 * a la izquierda y, a la derecha, la marca de minutos acumulados
 * (`clockLabel(startMinutes)`), el meta y el título del paso.
 */
export default function TimelineStep({
  title,
  durationMin,
  meta,
  variant,
  startMinutes,
  onPress,
  isLast = false,
}: TimelineStepProps) {
  const { scale: s } = useResponsive();

  const done = variant === 'completed';
  const active = variant === 'active';

  const dotColor = done || active ? sereneColors.primary : sereneColors['outline-variant'];
  const lineColor = done ? withAlpha(sereneColors.primary, 0.35) : sereneColors['outline-variant'];
  const clock = startMinutes !== undefined ? clockLabel(startMinutes) : null;

  const body = (
    <View style={{ flexDirection: 'row', gap: sereneSpacing['space-sm'] }}>
      {/* Riel vertical: punto + línea */}
      <View style={{ alignItems: 'center', width: s(24) }}>
        <View
          style={{
            width: s(20),
            height: s(20),
            borderRadius: sereneBorderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: active ? sereneColors['primary-container'] : 'transparent',
          }}
        >
          <MaterialCommunityIcons
            name={done ? mci('done') : active ? mci('play_circle') : mci('task_alt')}
            size={s(16)}
            color={done || active ? (active ? sereneColors['on-primary'] : sereneColors.primary) : dotColor}
          />
        </View>
        {!isLast && (
          <View style={{ flex: 1, width: s(2), minHeight: s(24), backgroundColor: lineColor }} />
        )}
      </View>

      {/* Contenido */}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          gap: s(2),
          paddingVertical: sereneSpacing['space-sm'],
          paddingRight: sereneSpacing['space-sm'],
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: active ? withAlpha(sereneColors['secondary-container'], 0.35) : 'transparent',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'], flexWrap: 'wrap' }}>
          {clock !== null && (
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: active ? sereneColors.primary : sereneColors['on-surface-variant'] },
              ]}
            >
              {clock}
            </RNText>
          )}
          {meta !== undefined && (
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}
            >
              {meta}
            </RNText>
          )}
        </View>

        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['on-surface'], flexShrink: 1, flexWrap: 'wrap' },
          ]}
        >
          {title}
        </RNText>

        <RNText
          style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          {`~${durationMin} min`}
        </RNText>
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${meta !== undefined ? `, ${meta}` : ''}${clock !== null ? `, arranca en ${clock}` : ''}`}
      style={({ pressed }) => ({ minHeight: s(44), opacity: pressed ? 0.85 : 1 })}
    >
      {body}
    </Pressable>
  );
}
