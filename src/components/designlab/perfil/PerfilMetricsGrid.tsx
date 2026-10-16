import React from 'react';
import { Text as RNText, View, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import { activeDaysRatioLabel } from '../../../utils/profileActivity';
import type { PerfilCopy } from '../../../screens/designlab/perfilFixtures';

export interface PerfilMetricsGridProps {
  copy: PerfilCopy['metrics'];
  activeDaysWeek: number;
  activeDaysMonth: number;
  stepsTotal: number;
}

/**
 * Las dos metricas de Perfil ("Dias activos" y "Pasos completados").
 *
 * Los tiles se acomodan en fila y envuelven a una sola columna cuando el ancho
 * es chico o la fuente del sistema esta al 200%, para que nada se corte.
 * Nunca se muestra "racha".
 */
export default function PerfilMetricsGrid({
  copy,
  activeDaysWeek,
  activeDaysMonth,
  stepsTotal,
}: PerfilMetricsGridProps) {
  const { scale: s } = useResponsive();

  return (
    <View style={{ gap: sereneSpacing['space-sm'] }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: sereneSpacing['space-sm'],
        }}
      >
        <View
          style={{
            flexGrow: 1,
            flexBasis: s(140),
            gap: s(4),
            padding: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container-high'],
          }}
        >
          <RNText
            style={[
              sereneTypography['label-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {copy.activeDaysTitle}
          </RNText>
          <RNText
            style={[
              sereneTypography['headline-md'] as TextStyle,
              { color: sereneColors['on-surface'] },
            ]}
          >
            {activeDaysRatioLabel(activeDaysWeek, 7)}
          </RNText>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {copy.activeDaysWeekCaption}
          </RNText>
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {`${copy.activeDaysMonthCaption}: ${activeDaysMonth}`}
          </RNText>
        </View>

        <View
          style={{
            flexGrow: 1,
            flexBasis: s(140),
            gap: s(4),
            padding: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors['surface-container-high'],
          }}
        >
          <RNText
            style={[
              sereneTypography['label-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {copy.stepsTitle}
          </RNText>
          <RNText
            style={[
              sereneTypography['headline-md'] as TextStyle,
              { color: sereneColors['on-surface'] },
            ]}
          >
            {String(stepsTotal)}
          </RNText>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {copy.stepsCaption}
          </RNText>
        </View>
      </View>

      <RNText
        style={[
          sereneTypography['body-sm'] as TextStyle,
          { color: sereneColors['on-surface-variant'] },
        ]}
      >
        {copy.activeDaysNote}
      </RNText>
    </View>
  );
}
