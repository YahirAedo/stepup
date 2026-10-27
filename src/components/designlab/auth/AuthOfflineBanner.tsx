import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';

export interface AuthOfflineBannerProps {
  title: string;
  body: string;
}

/**
 * Banner "Sin conexión" del flujo de acceso (Design Lab).
 *
 * Fondo `primary-fixed` (#b8efce), ícono `wifi-off`, texto en `surface-tint`
 * (5,0:1 sobre el fondo — AA). No usa `on-primary-fixed` para respetar el
 * valor visual del mockup.
 */
export default function AuthOfflineBanner({ title, body }: AuthOfflineBannerProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: sereneSpacing['space-md'],
        padding: sereneSpacing['space-md'],
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['primary-fixed'],
      }}
    >
      <MaterialCommunityIcons
        name={mci('wifi_off')}
        size={s(20)}
        color={sereneColors['surface-tint']}
        style={{ marginTop: s(1) }}
      />
      <View style={{ flex: 1, gap: sereneSpacing['space-xs'] }}>
        <RNText
          style={[
            sereneTypography['headline-sm'] as TextStyle,
            { color: sereneColors['surface-tint'] },
          ]}
        >
          {title}
        </RNText>
        <RNText
          style={[
            sereneTypography['body-md'] as TextStyle,
            { color: sereneColors['surface-tint'] },
          ]}
        >
          {body}
        </RNText>
      </View>
    </View>
  );
}