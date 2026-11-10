import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { sereneColors, sereneBorderRadius, useResponsive } from '../../theme/serene';

export interface ProgressTrackProps {
  /**
   * Modo simple: progreso acumulado 0..1 (un único fill continuo).
   * Se ignora cuando se pasan `completed` y `current` (modo segmentado).
   */
  progress?: number;
  /** Altura de la barra (default: 6 escalado) */
  height?: number;
  /** Mostrar porcentaje numérico al lado */
  showPercent?: boolean;
  /** Color del fill completado (default: primary en segmentado, primary-container en simple) */
  fillColor?: string;
  /** Color del track (default: surface-container-high) */
  trackColor?: string;
  /**
   * Modo segmentado: fracción ya completada 0..1 (pasos previos).
   * Requiere `current` para activar el render por segmentos.
   */
  completed?: number;
  /** Modo segmentado: fracción del paso actual 0..1 (lo que se completa al terminarlo). */
  current?: number;
  /** Color del segmento "paso actual" (default: primary-fixed) */
  currentColor?: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Barra de progreso lineal con dos modos:
 * - Simple: un único fill controlado por `progress` (0..1).
 * - Segmentado (backward compatible): pasa `completed` + `current` para pintar
 *   tres zonas contiguas — completado (sólido), paso actual (claro) y lo que
 *   falta (track). Pensado para `currentIndex` 1-based: en "Paso Y de Y" el
 *   paso actual todavía NO está hecho, así que la barra no se ve llena.
 */
export default function ProgressTrack({
  progress,
  height,
  showPercent = false,
  fillColor,
  trackColor,
  completed,
  current,
  currentColor,
}: ProgressTrackProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(6);
  const hasSegments = completed !== undefined && current !== undefined;
  const clamped = clamp01(progress ?? 0);
  const completedClamped = clamp01(completed ?? 0);
  const currentClamped = clamp01(current ?? 0);
  const percent = hasSegments ? completedClamped + currentClamped : clamped;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
      <View
        style={{
          flex: 1,
          height: h,
          borderRadius: sereneBorderRadius.full,
          backgroundColor: trackColor ?? sereneColors['surface-container-high'],
          overflow: 'hidden',
        }}
      >
        {hasSegments ? (
          <View style={{ flexDirection: 'row', height: '100%' }}>
            <View
              style={{
                width: `${completedClamped * 100}%`,
                height: '100%',
                backgroundColor: fillColor ?? sereneColors.primary,
              }}
            />
            <View
              style={{
                width: `${currentClamped * 100}%`,
                height: '100%',
                backgroundColor: currentColor ?? sereneColors['primary-fixed'],
              }}
            />
          </View>
        ) : (
          <View
            style={{
              width: `${clamped * 100}%`,
              height: '100%',
              borderRadius: sereneBorderRadius.full,
              backgroundColor: fillColor ?? sereneColors['primary-container'],
            }}
          />
        )}
      </View>
      {showPercent && (
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], minWidth: s(36), textAlign: 'right' },
          ]}
        >
          {Math.round(percent * 100)}%
        </RNText>
      )}
    </View>
  );
}

// Re-exportar sereneTypography para que los consumers no tengan que importarla aparte
import { sereneTypography } from '../../theme/serene';