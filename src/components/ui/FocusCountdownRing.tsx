import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  sereneColors,
  sereneTypography,
  useResponsive,
} from '../../theme/serene';
import { ringRemaining, ringDashOffset } from '../../features/focus/logic/ringProgress';

const RADIUS = 84;

export interface FocusCountdownRingProps {
  display: string;
  seconds: number;
  totalSeconds: number;
  paused: boolean;
}

export default function FocusCountdownRing({
  display,
  seconds,
  totalSeconds,
  paused,
}: FocusCountdownRingProps) {
  const { scale: s } = useResponsive();
  const size = s(224);
  const circumference = 2 * Math.PI * RADIUS;
  const remaining = ringRemaining(seconds, totalSeconds);
  const offset = ringDashOffset(remaining, RADIUS);

  return (
    <View
      accessible
      accessibilityLabel={`Tiempo restante ${display}${paused ? ', pausado' : ''}`}
      accessibilityValue={{ text: display }}
      style={{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        accessible={false}
        importantForAccessibility="no"
      >
        <Svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          style={{ transform: [{ rotate: '-90deg' }] }}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={sereneColors['surface-container']}
            strokeWidth={7}
          />
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

        <View
          style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}
          accessible={false}
          importantForAccessibility="no"
        >
          <RNText
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              { color: sereneColors['on-surface'], textAlign: 'center' },
            ]}
            accessible={false}
            importantForAccessibility="no"
          >
            {display}
          </RNText>
          {paused ? (
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], marginTop: 2 },
              ]}
              accessible={false}
              importantForAccessibility="no"
            >
              Pausado
            </RNText>
          ) : null}
        </View>
      </View>
    </View>
  );
}
