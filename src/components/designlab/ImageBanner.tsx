import React from 'react';
import { View, Text as RNText, Image, type TextStyle, type DimensionValue } from 'react-native';
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

export interface ImageBannerProps {
  imageUrl: string;
  caption: string;
  /** Altura del banner (default: 112 escalado = h-28 del mockup). */
  height?: number;
}

/** Capas del degradado inferior (alfa sobre `surface-container-lowest`). */
const GRADIENT_LAYERS: Array<{ heightPct: string; alpha: number }> = [
  { heightPct: '100%', alpha: 0.05 },
  { heightPct: '78%', alpha: 0.15 },
  { heightPct: '56%', alpha: 0.3 },
  { heightPct: '34%', alpha: 0.55 },
  { heightPct: '18%', alpha: 0.85 },
];

/**
 * Imagen serena de contexto editorial y descanso visual (bloque H del Listado).
 *
 * El mockup usa `bg-gradient-to-t from-surface-container-lowest/90 via-.../40
 * to-transparent`. RN no trae gradientes y el proyecto no incluye
 * `expo-linear-gradient`, asi que se aproxima con bandas apiladas de alfa
 * decreciente (mismo recurso que el resto del lab: sin dependencias nuevas).
 *
 * Reutilizable por la preview "Tarea - Seleccionar" (misma pieza editorial).
 */
export default function ImageBanner({ imageUrl, caption, height }: ImageBannerProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(112);

  return (
    <View
      style={{
        borderRadius: sereneBorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: sereneColors['surface-container-low'],
      }}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: '100%', height: h }}
        resizeMode="cover"
        accessibilityLabel={caption}
      />

      {/* Degradado inferior aproximado */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h }}>
        {GRADIENT_LAYERS.map((layer, idx) => (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: layer.heightPct as DimensionValue,
              backgroundColor: withAlpha(sereneColors['surface-container-lowest'], layer.alpha),
            }}
          />
        ))}
      </View>

      {/* Caption */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: s(14),
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
        }}
      >
        <MaterialCommunityIcons name={mci('eco')} size={s(16)} color={sereneColors['primary-container']} />
        <RNText
          numberOfLines={2}
          style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flex: 1 }]}
        >
          {caption}
        </RNText>
      </View>
    </View>
  );
}