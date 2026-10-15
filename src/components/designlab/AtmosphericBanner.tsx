import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

export interface AtmosphericBannerProps {
  /** Texto sobre el degradado, ej. "Pausa restauradora". */
  caption: string;
}

/**
 * Snippet atmosférico de cierre. El mockup usa una foto con degradado; acá se
 * resuelve sin `expo-image` ni `expo-linear-gradient` (no son dependencias del
 * proyecto): fondo sage + ícono tenue + degradado SVG. Design Lab — no final.
 */
export default function AtmosphericBanner({ caption }: AtmosphericBannerProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        width: '100%',
        height: s(112),
        borderRadius: sereneBorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: sereneColors['secondary-fixed'],
        ...sereneShadows.card,
      }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons
          name="leaf"
          size={s(56)}
          color={withAlpha(sereneColors.primary, 0.25)}
        />
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="atmos" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={sereneColors.primary} stopOpacity={0.7} />
              <Stop offset="0.5" stopColor={sereneColors.primary} stopOpacity={0.2} />
              <Stop offset="1" stopColor={sereneColors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#atmos)" />
        </Svg>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: sereneSpacing['space-md'],
        }}
      >
        <RNText
          style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-primary'], textAlign: 'center' }]}
        >
          {caption}
        </RNText>
      </View>
    </View>
  );
}
