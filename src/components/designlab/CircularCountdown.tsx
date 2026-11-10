import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import {
  circleCircumference,
  computeProgress,
  formatCountdown,
  progressDashOffset,
  toMinutesLabel,
  type CountdownState,
} from '../../utils/countdown';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

export interface CircularCountdownProps {
  state: CountdownState;
  isPaused: boolean;
}

const RADIUS = 84;

/**
 * Anillo SVG de cuenta regresiva para el Design Lab.
 *
 * Traduce exactamente el HTML del mockup: viewBox 200x200, r=84, strokeWidth=7,
 * strokeLinecap="round", background track `surface-container` y trazo
 * `primary-container`. El offset se calcula con `progressDashOffset()` (logica
 * pura) para preservar la exactitud: 0 segundos restantes = arco completo, 0
 * restante en relacion al objetivo = 0 offset.
 *
 * Usa `duration-1000 ease-linear` en el HTML; en RN no hay CSS transition,
 * pero con un tick cada 1000ms y `strokeDashoffset` aplicado directamente, el
 * salto es lineal y coincide con la referencia.
 */
export default function CircularCountdown({ state, isPaused }: CircularCountdownProps) {
  const { scale: s } = useResponsive();
  const size = s(224);
  const circumference = circleCircumference(RADIUS);
  const progress = computeProgress(state);
  const offset = progressDashOffset(progress, RADIUS);
  const minutesLabel = toMinutesLabel(state.total);

  return (
    <View
      style={{
        width: '100%',
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow ambiente */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
          opacity: 0.5,
        }}
        pointerEvents="none"
      />

      <View
        style={{
          position: 'relative',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track */}
          <Circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={sereneColors['surface-container']}
            strokeWidth={7}
          />
          {/* Progreso */}
          <Circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={sereneColors['primary-container']}
            strokeWidth={7}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>

        {/* Centro */}
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginBottom: 2,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: sereneColors.primary,
                opacity: isPaused ? 0.5 : 1,
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                {
                  color: isPaused ? sereneColors['on-surface-variant'] : sereneColors.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                },
              ]}
            >
              {isPaused ? 'En Pausa' : 'En Curso'}
            </RNText>
          </View>

          <RNText
            style={[
              sereneTypography['display-lg-mobile'] as TextStyle,
              {
                color: sereneColors['on-surface'],
                textAlign: 'center',
                marginVertical: 2,
              },
            ]}
          >
            {formatCountdown(state.remaining)}
          </RNText>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <MaterialCommunityIcons
              name="timer-sand"
              size={s(15)}
              color={sereneColors.secondary}
            />
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              Meta: {minutesLabel} min
            </RNText>
          </View>
        </View>
      </View>
    </View>
  );
}
