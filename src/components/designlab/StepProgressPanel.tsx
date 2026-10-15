import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { mci } from './mciIconMap';

export type StepSegmentStatus = 'done' | 'current' | 'pending';

export interface StepProgressPanelProps {
  /** "50% completado" */
  percentLabel: string;
  /** "~9 min restantes" */
  remainingLabel: string;
  /** "2 de 4 pasos listos" */
  doneLabel: string;
  /** "Ritmo sereno" */
  paceLabel: string;
  /** Estado de cada segmento; la longitud define cuantos segmentos se pintan. */
  statuses: StepSegmentStatus[];
}

/**
 * Panel de avance segmentado del Detalle (bloque "Visual Progress Panel").
 *
 * El mockup dibuja N segmentos con separacion (`gap-0.5 p-[1px]`), coloreados
 * por estado: completado `primary`, actual `primary-fixed-dim` con overlay
 * pulsante, pendiente `surface-container-highest`. Reusa el patron visual de
 * `ProgressTrack` pero con segmentos discretos con gap (que aquel no soporta).
 */
export default function StepProgressPanel({
  percentLabel,
  remainingLabel,
  doneLabel,
  paceLabel,
  statuses,
}: StepProgressPanelProps) {
  const { scale: s } = useResponsive();

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

      {/* Barra segmentada */}
      <View
        style={{
          height: s(8),
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
              height: '100%',
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

      {/* Footer: pasos listos + ritmo */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <RNText
          style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          {doneLabel}
        </RNText>
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            { color: sereneColors.primary, fontWeight: '500' },
          ]}
        >
          {paceLabel}
        </RNText>
      </View>
    </View>
  );
}