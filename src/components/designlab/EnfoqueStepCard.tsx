import React from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import ProgressTrack from './ProgressTrack';

export interface EnfoqueStepCardProps {
  /** Índice 1-based del paso actual */
  currentIndex: number;
  /** Total de pasos */
  totalSteps: number;
  /** Duración en minutos (ya definida, no se elige en esta pantalla) */
  minutes: number;
  /** Título del paso (dominante, dentro del panel inset) */
  title: string;
  /** Descripción / guía (opcional) */
  description?: string;
  /** Callback al iniciar el foco */
  onStart: () => void;
  /** Callback al posponer el paso */
  onPostpone?: () => void;
}

/**
 * Card "Variante E — Enfoque": título dominante dentro de un panel inset,
 * un único indicador de progreso y una acción primaria alta.
 * Design Lab — no es la pantalla final.
 */
export default function EnfoqueStepCard({
  currentIndex,
  totalSteps,
  minutes,
  title,
  description,
  onStart,
  onPostpone,
}: EnfoqueStepCardProps) {
  const { scale: s } = useResponsive();
  const completed = totalSteps > 0 ? (currentIndex - 1) / totalSteps : 0;
  const current = totalSteps > 0 ? 1 / totalSteps : 0;
  const stepLabel = `Paso ${currentIndex} de ${totalSteps}`;

  return (
    <View
      style={{
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        ...sereneShadows.card,
        position: 'relative',
      }}
    >
      {/* Decoración: glow translúcido top-right (sin blur, capas de alfa) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: sereneBorderRadius.xl,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -s(28),
            right: -s(20),
            width: s(120),
            height: s(120),
            borderRadius: s(60),
            backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: s(6),
            right: -s(44),
            width: s(88),
            height: s(88),
            borderRadius: s(44),
            backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
          }}
        />
      </View>

      {/* Top row: pill "Paso X de Y" + pill duración */}
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
            {
              color: sereneColors.primary,
              backgroundColor: sereneColors['primary-fixed'],
              paddingHorizontal: s(10),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              overflow: 'hidden',
            },
          ]}
        >
          {stepLabel}
        </RNText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(5),
            backgroundColor: sereneColors['surface-container-low'],
            paddingHorizontal: s(10),
            paddingVertical: s(4),
            borderRadius: sereneBorderRadius.full,
          }}
        >
          <MaterialCommunityIcons
            name="timer-outline"
            size={s(14)}
            color={sereneColors.secondary}
          />
          <RNText
            style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.secondary }]}
          >
            {`${minutes} min`}
          </RNText>
        </View>
      </View>

      {/* Único indicador de progreso de la card */}
      <View style={{ marginTop: sereneSpacing['space-md'] }}>
        <ProgressTrack completed={completed} current={current} height={s(4)} />
      </View>

      {/* Panel inset con el título dominante */}
      <View
        style={{
          marginTop: sereneSpacing['space-md'],
          backgroundColor: sereneColors['surface-container-low'],
          borderRadius: sereneBorderRadius.xl,
          borderWidth: 1,
          borderColor: withAlpha(sereneColors['secondary-fixed'], 0.5),
          padding: sereneSpacing['space-md'],
        }}
      >
        <RNText
          numberOfLines={3}
          style={[
            sereneTypography['headline-lg-mobile'] as TextStyle,
            { color: sereneColors.primary, fontWeight: '600' },
          ]}
        >
          {title}
        </RNText>

        {description ? (
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                color: sereneColors['on-surface-variant'],
                marginTop: sereneSpacing['space-sm'],
              },
            ]}
          >
            {description}
          </RNText>
        ) : null}
      </View>

      {/* Acciones: CTA primaria alta + posponer icon-only */}
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
            height: s(64),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['primary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            opacity: pressed ? 0.95 : 1,
          })}
        >
          <MaterialCommunityIcons name="play" size={s(20)} color={sereneColors['on-primary']} />
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-primary'], fontWeight: '600' },
            ]}
          >
            Iniciar Paso
          </RNText>
        </Pressable>

        {onPostpone ? (
          <Pressable
            onPress={onPostpone}
            accessibilityRole="button"
            accessibilityLabel="Posponer paso"
            style={({ pressed }) => ({
              width: s(64),
              height: s(64),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name="swap-vertical"
              size={s(22)}
              color={sereneColors.secondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
