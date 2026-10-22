import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { mci } from './mciIconMap';
import SegmentedProgressBar, { type StepSegmentStatus } from './SegmentedProgressBar';

export type { StepSegmentStatus } from './SegmentedProgressBar';

export interface StepProgressPanelProps {
  /** "50% completado" */
  percentLabel: string;
  /** "~9 min restantes" */
  remainingLabel: string;
  /** "2 de 4 pasos listos" */
  doneLabel: string;
  /** Etiqueta de ritmo; opcional. Si no viene, no se muestra. */
  paceLabel?: string;
  /** Estado de cada segmento; la longitud define cuantos segmentos se pintan. */
  statuses: StepSegmentStatus[];
}

/**
 * Panel de avance segmentado del Detalle (bloque "Visual Progress Panel").
 *
 * Envuelve `SegmentedProgressBar` (barra compartida con la tarjeta "en foco"
 * del Listado) con el header de % / tiempo restante y el footer de pasos listos.
 */
export default function StepProgressPanel({
  percentLabel,
  remainingLabel,
  doneLabel,
  paceLabel,
  statuses,
}: StepProgressPanelProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: sereneColors['surface-container-low'],
        borderRadius: sereneBorderRadius.lg,
        padding: sereneSpacing['space-sm'],
        gap: sereneSpacing['space-xs'],
      }}
    >
      {/* Header: % completado + tiempo restante */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
          <MaterialCommunityIcons name={mci('timelapse')} size={s(16)} color={sereneColors.primary} />
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {percentLabel}
          </RNText>
        </View>
        <RNText
          style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          {remainingLabel}
        </RNText>
      </View>

      {/* Barra segmentada compartida */}
      <SegmentedProgressBar statuses={statuses} />

      {/* Footer: pasos listos + ritmo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <RNText
          style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          {doneLabel}
        </RNText>
        {paceLabel ? (
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors.primary, fontWeight: '500' },
            ]}
          >
            {paceLabel}
          </RNText>
        ) : null}
      </View>
    </View>
  );
}