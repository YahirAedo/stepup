import React, { useEffect, useRef } from 'react';
import { View, Text as RNText, Pressable, Animated, type TextStyle } from 'react-native';
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

export interface ZenSanctuaryCardProps {
  headline: string;
  body: string;
  /** CTA primario (verde), ej. "Crear tarea". */
  primaryCta: string;
  /** CTA secundario (salvia), ej. "Ver historial". */
  secondaryCta: string;
  /** Activa el loop de respiración del anillo botánico. */
  breathing: boolean;
  onPrimary: () => void;
  onSecondary: () => void;
}

const BREATH_DURATION = 3500;

/**
 * Card ancla del estado vacío "Focus — Sin tareas". Reúne los glows
 * ambientales, el anillo botánico con respiración y los dos CTA. El toggle
 * "Inspirar/Exhalar" vive en la pantalla y baja el estado vía `breathing`.
 * Design Lab — no es la pantalla final.
 */
export default function ZenSanctuaryCard({
  headline,
  body,
  primaryCta,
  secondaryCta,
  breathing,
  onPrimary,
  onSecondary,
}: ZenSanctuaryCardProps) {
  const { scale: s } = useResponsive();
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!breathing) {
      ringScale.stopAnimation();
      ringScale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 0.8, duration: BREATH_DURATION, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: BREATH_DURATION, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathing, ringScale]);

  const outer = s(96);
  const inner = s(64);

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        alignItems: 'center',
        overflow: 'hidden',
        ...sereneShadows.card,
      }}
    >
      {/* Glows ambientales */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -s(64),
          right: -s(64),
          width: s(176),
          height: s(176),
          borderRadius: s(88),
          backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -s(64),
          left: -s(64),
          width: s(160),
          height: s(160),
          borderRadius: s(80),
          backgroundColor: withAlpha(sereneColors['secondary-fixed'], 0.4),
        }}
      />

      {/* Anillo botánico con respiración */}
      <View style={{ marginTop: s(8), marginBottom: s(16), alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: ringScale }],
          }}
        >
          <View
            style={{
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: sereneColors['secondary-fixed'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="sprout" size={s(34)} color={sereneColors['on-secondary-fixed']} />
          </View>
        </Animated.View>
      </View>

      <RNText
        style={[
          sereneTypography['headline-lg-mobile'] as TextStyle,
          { color: sereneColors.primary, textAlign: 'center' },
        ]}
      >
        {headline}
      </RNText>
      <RNText
        style={[
          sereneTypography['body-md'] as TextStyle,
          {
            color: sereneColors['on-surface-variant'],
            textAlign: 'center',
            marginTop: sereneSpacing['space-sm'],
            maxWidth: s(280),
          },
        ]}
      >
        {body}
      </RNText>

      <View
        style={{
          width: s(40),
          height: s(2),
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['surface-container-highest'],
          marginVertical: s(20),
        }}
      />

      <View style={{ width: '100%', gap: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={onPrimary}
          accessibilityRole="button"
          accessibilityLabel={primaryCta}
          style={({ pressed }) => ({
            width: '100%',
            height: s(44),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['primary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            opacity: pressed ? 0.95 : 1,
          })}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={s(19)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {primaryCta}
          </RNText>
        </Pressable>

        <Pressable
          onPress={onSecondary}
          accessibilityRole="button"
          accessibilityLabel={secondaryCta}
          style={({ pressed }) => ({
            width: '100%',
            height: s(44),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['secondary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name="history" size={s(19)} color={sereneColors['on-secondary-container']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-secondary-container'] }]}>
            {secondaryCta}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
