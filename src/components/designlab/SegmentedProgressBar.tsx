import React from 'react';
import { View, type DimensionValue, Pressable } from 'react-native';
import { sereneColors, sereneBorderRadius, withAlpha, useResponsive } from '../../theme/serene';

export type StepSegmentStatus = 'done' | 'current' | 'pending';

export interface SegmentedProgressBarProps {
  /** Estado de cada segmento; la longitud define cuantos segmentos se pintan. */
  statuses: StepSegmentStatus[];
  /** Altura de la barra (default: 8 escalado). */
  height?: number;
  /** Etiqueta accesible (opcional). Si no se pasa, se genera desde los estados. */
  accessibilityLabel?: string;
  /** Valor accesible (opcional). Si no se pasa, se genera desde los estados. */
  accessibilityValue?: { text?: string };
}

/**
 * Barra de avance segmentada (un segmento por paso, con separacion).
 * Fuente unica del estilo compartido entre el panel de avance del Detalle
 * (`StepProgressPanel`) y la tarjeta "en foco" del Listado (`FeaturedTaskCard`),
 * para que la barra se vea igual en ambas pantallas.
 *
 * Colores: completado `primary-container`, actual `secondary-container` con borde
 * fino en `primary-container`, pendiente `surface-container-high`.
 *
 * Con mas de 8 pasos: barra continua con relleno proporcional, sin huecos.
 */
export default function SegmentedProgressBar({ statuses, height, accessibilityLabel, accessibilityValue }: SegmentedProgressBarProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(8);
  const total = statuses.length;
  const doneCount = statuses.filter((s) => s === 'done').length;
  const continuous = total > 8;

  const segmentColor = (status: StepSegmentStatus) => {
    switch (status) {
      case 'done':
        return sereneColors['primary-container'];
      case 'current':
        return sereneColors['secondary-container'];
      default:
        return sereneColors['surface-container-high'];
    }
  };

  const genLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    return `${doneCount} de ${total} pasos completados`;
  };

  const genValue = () => {
    if (accessibilityValue) return accessibilityValue;
    return { text: total > 0 ? `${Math.round((doneCount / total) * 100)}%` : '0%' };
  };

  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={genLabel()}
      accessibilityValue={genValue()}
      style={{ paddingHorizontal: s(1) }}
    >
      <View
        style={{
          height: h,
          flexDirection: 'row',
          gap: continuous ? 0 : s(2),
          padding: continuous ? 0 : s(1),
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['surface-container-high'],
          overflow: 'hidden',
        }}
      >
        {statuses.map((status, idx) => {
          if (continuous) {
            // Barra continua: segmentos iguales sin huecos, relleno proporcional
            const isDone = status === 'done';
            const isCurrent = status === 'current';
            return (
              <View
                key={idx}
                style={{
                  flex: 1,
                  height: '100%' as DimensionValue,
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: isDone || isCurrent ? segmentColor(status) : sereneColors['surface-container-high'],
                  overflow: 'hidden',
                  borderLeftWidth: isCurrent ? 1 : 0,
                  borderLeftColor: sereneColors['primary-container'],
                }}
              />
            );
          }
          return (
            <View
              key={idx}
              style={{
                flex: 1,
                height: '100%' as DimensionValue,
                borderRadius: sereneBorderRadius.full,
                backgroundColor: segmentColor(status),
                overflow: 'hidden',
                borderWidth: idx === total - 1 && status === 'current' ? 1 : 0,
                borderColor: sereneColors['primary-container'],
              }}
            >
              {status === 'current' && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: withAlpha(sereneColors.primary, 0.4),
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
