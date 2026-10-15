import React from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sereneColors, sereneTypography, sereneSpacing, sereneBorderRadius, sereneShadows, useResponsive } from '../../theme/serene';
import ProgressTrack from './ProgressTrack';

export interface FocusStepCardProps {
  /** Índice 1-based del paso actual */
  currentIndex: number;
  /** Total de pasos */
  totalSteps: number;
  /** Duración en minutos (ya definida, no se elige en esta pantalla) */
  minutes: number;
  /** Título del paso */
  title: string;
  /** Descripción / guía (opcional) */
  description?: string;
  /** Callback al iniciar el foco */
  onStart: () => void;
  /** Callback al posponer el paso */
  onPostpone?: () => void;
  /** Callback al presionar la card completa (para navegar a detalle) */
  onPress?: () => void;
}

export default function FocusStepCard({
  currentIndex,
  totalSteps,
  minutes,
  title,
  description,
  onStart,
  onPostpone,
  onPress,
}: FocusStepCardProps) {
  const { scale: s } = useResponsive();
  const completed = totalSteps > 0 ? (currentIndex - 1) / totalSteps : 0;
  const current = totalSteps > 0 ? 1 / totalSteps : 0;
  const stepLabel = `Paso ${currentIndex} de ${totalSteps}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Ver detalle de ${title}` : undefined}
      style={({ pressed }) => ({
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        ...sereneShadows.card,
        opacity: pressed ? 0.85 : 1,
        position: 'relative',
      })}
    >
      {/* Barra lateral izquierda de color */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: s(4),
          borderTopLeftRadius: sereneBorderRadius.xl,
          borderBottomLeftRadius: sereneBorderRadius.xl,
          backgroundColor: sereneColors['primary-container'],
        }}
      />

      {/* Top row: pill "Paso X de Y" + duración */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: sereneSpacing['space-md'],
        }}
      >
        <RNText
          style={[
            sereneTypography['label-md'] as TextStyle,
            {
              color: sereneColors['on-primary-fixed'],
              backgroundColor: sereneColors['primary-fixed'],
              paddingHorizontal: s(10),
              paddingVertical: s(3),
              borderRadius: sereneBorderRadius.full,
              fontWeight: '600',
            },
          ]}
        >
          {stepLabel}
        </RNText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5) }}>
          <MaterialCommunityIcons name="clock-outline" size={s(15)} color={sereneColors['on-surface-variant']} />
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {`${minutes} min`}
          </RNText>
        </View>
      </View>

      {/* Título */}
      <RNText
        numberOfLines={2}
        style={[
          sereneTypography['title-md'] as TextStyle,
          { color: sereneColors['on-surface'], fontWeight: '600', marginBottom: sereneSpacing['space-xs'] },
        ]}
      >
        {title}
      </RNText>

      {/* Descripción */}
      {description ? (
        <RNText
          numberOfLines={2}
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], marginBottom: sereneSpacing['space-md'] },
          ]}
        >
          {description}
        </RNText>
      ) : null}

      {/* Barra de progreso lineal (sin etiqueta de porcentaje) */}
      <ProgressTrack completed={completed} current={current} height={s(4)} />

      {/* ⚠️ DESIGN: revisar si sumamos algo acá o cambiamos el icono */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
          marginTop: sereneSpacing['space-lg'],
        }}
      >
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel={`Iniciar paso ${minutes} minutos`}
          style={({ pressed }) => ({
            flex: 1,
            height: s(48),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['primary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            opacity: pressed ? 0.95 : 1,
          })}
        >
          <MaterialCommunityIcons name="play" size={s(18)} color={sereneColors['on-primary']} />
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-primary'], fontWeight: '600' },
            ]}
          >
            Iniciar Paso
          </RNText>
        </Pressable>

        {onPostpone && (
          <Pressable
            onPress={onPostpone}
            accessibilityRole="button"
            accessibilityLabel="Posponer paso"
            style={({ pressed }) => ({
              width: s(44),
              height: s(44),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name="swap-vertical" size={s(20)} color={sereneColors['on-surface-variant']} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
