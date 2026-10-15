import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
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

export interface AntiOverwhelmCardProps {
  title: string;
  body: string;
  cta: string;
  onActivate?: () => void;
}

/**
 * Card de rescate ante paralisis (bloque G del Listado): "¿Muchas cosas
 * pendientes?" + CTA "Activar modo túnel anti-abrumamiento".
 *
 * Es puramente presentacional en la preview: el modo túnel es un concepto de
 * producto a validar, no existe en el modelo real (⚠️ DESIGN).
 */
export default function AntiOverwhelmCard({ title, body, cta, onActivate }: AntiOverwhelmCardProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: sereneSpacing['space-md'],
        padding: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
      }}
    >
      <View
        style={{
          width: s(32),
          height: s(32),
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['primary-container'],
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: s(2),
        }}
      >
        <MaterialCommunityIcons name={mci('self_improvement')} size={s(18)} color={sereneColors['on-primary']} />
      </View>

      <View style={{ gap: s(6), flex: 1 }}>
        <RNText
          style={[
            sereneTypography['label-lg'] as TextStyle,
            { color: sereneColors['primary-container'], fontWeight: '600' },
          ]}
        >
          {title}
        </RNText>
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-secondary-container'], lineHeight: s(20) },
          ]}
        >
          {body}
        </RNText>
        <Pressable
          onPress={onActivate}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginTop: s(4),
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(4),
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['primary-container'], fontWeight: '600' },
            ]}
          >
            {cta}
          </RNText>
          <MaterialCommunityIcons
            name={mci('visibility_off')}
            size={s(14)}
            color={sereneColors['primary-container']}
          />
        </Pressable>
      </View>
    </View>
  );
}