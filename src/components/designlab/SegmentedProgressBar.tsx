import React from 'react';
import { View, type DimensionValue } from 'react-native';
import { sereneColors, sereneBorderRadius, withAlpha, useResponsive } from '../../theme/serene';

export type StepSegmentStatus = 'done' | 'current' | 'pending';

export interface SegmentedProgressBarProps {
  /** Estado de cada segmento; la longitud define cuantos segmentos se pintan. */
  statuses: StepSegmentStatus[];
  /** Altura de la barra (default: 8 escalado). */
  height?: number;
}

/**
 * Barra de avance segmentada (un segmento por paso, con separacion).
 * Fuente unica del estilo compartido entre el panel de avance del Detalle
 * (`StepProgressPanel`) y la tarjeta "en foco" del Listado (`FeaturedTaskCard`),
 * para que la barra se vea igual en ambas pantallas.
 *
 * Colores: completado `primary`, actual `primary-fixed-dim` con overlay
 * pulsante, pendiente `surface-container-highest`.
 */
export default function SegmentedProgressBar({ statuses, height }: SegmentedProgressBarProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(8);

  const segmentColor = (status: StepSegmentStatus) => {
    switch (status) {
      case 'done':
        return sereneColors.primary;
      case 'current':
        return sereneColors['primary-fixed-dim'];
      default:
        return sereneColors['surface-container-highest'];
    }
  };

  return (
    <View
      style={{
        height: h,
        flexDirection: 'row',
        gap: s(2),
        padding: s(1),
        borderRadius: sereneBorderRadius.full,
        backgroundColor: sereneColors['surface-container-high'],
        overflow: 'hidden',
      }}
    >
      {statuses.map((status, idx) => (
        <View
          key={idx}
          style={{
            flex: 1,
            height: '100%' as DimensionValue,
            borderRadius: sereneBorderRadius.full,
            backgroundColor: segmentColor(status),
            overflow: 'hidden',
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
      ))}
    </View>
  );
}
