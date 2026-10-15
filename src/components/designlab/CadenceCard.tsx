import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';

export interface CadenceCardProps {
  /** Etiqueta de la sección, ej. "Ritmo de hoy". */
  label: string;
  /** Nivel mostrado a la derecha, ej. "Ritmo estable". */
  level: string;
  /** Titular del progreso, ej. "4 pasos completados". */
  headline: string;
  /** Detalle entre paréntesis, ej. "(18 min enfocados)". */
  detail: string;
  /** Refuerzo positivo debajo. */
  note: string;
  /** Progreso 0..1 de la barra. */
  progress: number;
}

/**
 * Card de refuerzo positivo "Ritmo de hoy" (estado vacío del flujo Focus).
 * Design Lab — no es la pantalla final.
 */
export default function CadenceCard({
  label,
  level,
  headline,
  detail,
  note,
  progress,
}: CadenceCardProps) {
  const { scale: s } = useResponsive();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: sereneColors['surface-container-low'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-md'],
        ...sereneShadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: sereneSpacing['space-sm'] }}>
        <View
          style={{
            width: s(36),
            height: s(36),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['secondary-container'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="leaf" size={s(20)} color={sereneColors['on-secondary-container']} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: sereneSpacing['space-sm'],
            }}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
              ]}
            >
              {label}
            </RNText>
            <View
              style={{
                paddingHorizontal: s(10),
                paddingVertical: s(2),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['surface-container'],
              }}
            >
              <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary }]}>
                {level}
              </RNText>
            </View>
          </View>

          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface'], fontWeight: '600', marginTop: s(2) },
            ]}
          >
            {headline}{' '}
            <RNText style={{ color: sereneColors['on-surface-variant'], fontWeight: '400' }}>{detail}</RNText>
          </RNText>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4), marginTop: s(4) }}>
            <MaterialCommunityIcons name="check" size={s(15)} color={sereneColors.primary} />
            <RNText
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors.secondary, flex: 1 }]}
            >
              {note}
            </RNText>
          </View>
        </View>
      </View>

      <View
        style={{
          width: '100%',
          height: s(6),
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['surface-container-highest'],
          marginTop: sereneSpacing['space-md'],
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped * 100}%`,
            height: '100%',
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['primary-container'],
          }}
        />
      </View>
    </View>
  );
}
