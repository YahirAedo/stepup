import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  Text as RNText,
  View,
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
import { mci } from '../designlab/mciIconMap';

export interface FocusTimerExpiredOverlayProps {
  visible: boolean;
  headline: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  onMarkDone: () => void;
  onExtend: () => void;
  disabled?: boolean;
}

export default function FocusTimerExpiredOverlay({
  visible,
  headline,
  subtitle,
  primaryCta,
  secondaryCta,
  onMarkDone,
  onExtend,
  disabled = false,
}: FocusTimerExpiredOverlayProps) {
  const { scale: s } = useResponsive();
  const [mounted, setMounted] = useState(visible);

  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : s(8))).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: s(8), duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, opacity, translateY, s]);

  if (!mounted) return null;

  const scrimColor = withAlpha(sereneColors['on-surface'], 0.5);
  const buttonHeight = s(52);

  return (
    <Animated.View
      accessibilityViewIsModal={visible}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        opacity,
        alignItems: 'center',
        justifyContent: 'center',
        padding: sereneSpacing.gutter,
        backgroundColor: scrimColor,
      }}
    >
      <Animated.View
        style={{
          width: '100%',
          maxWidth: s(380),
          backgroundColor: sereneColors['surface-container-lowest'],
          borderRadius: sereneBorderRadius.xl,
          padding: sereneSpacing['space-lg'],
          alignItems: 'center',
          borderWidth: 1,
          borderColor: withAlpha(sereneColors['outline-variant'], 0.6),
          transform: [{ translateY }],
          ...sereneShadows.sheet,
        }}
      >
        <RNText
          style={[
            sereneTypography['headline-sm'] as TextStyle,
            {
              color: sereneColors['on-surface'],
              textAlign: 'center',
              maxWidth: s(300),
            },
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
              maxWidth: s(300),
            },
          ]}
        >
          {subtitle}
        </RNText>

        <View style={{ width: '100%', marginTop: sereneSpacing['space-lg'] }}>
          <Pressable
            onPress={onMarkDone}
            accessibilityRole="button"
            accessibilityLabel={primaryCta}
            disabled={disabled}
            accessibilityState={{ disabled }}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: s(48),
              height: buttonHeight,
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['primary-container'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              opacity: pressed || disabled ? 0.9 : 1,
              ...sereneShadows.card,
            })}
          >
            <MaterialCommunityIcons name={mci('done')} size={s(20)} color={sereneColors['on-primary-container']} />
            <RNText
              style={[
                sereneTypography['label-lg'] as TextStyle,
                {
                  color: sereneColors['on-primary-container'],
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                },
              ]}
            >
              {primaryCta}
            </RNText>
          </Pressable>

          <Pressable
            onPress={onExtend}
            accessibilityRole="button"
            accessibilityLabel={secondaryCta}
            disabled={disabled}
            accessibilityState={{ disabled }}
            style={({ pressed }) => ({
              width: '100%',
              minHeight: s(48),
              height: buttonHeight,
              marginTop: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-high'],
              borderWidth: 1,
              borderColor: sereneColors['outline-variant'],
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              opacity: pressed || disabled ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('timer')} size={s(20)} color={sereneColors.primary} />
            <RNText
              style={[
                sereneTypography['label-lg'] as TextStyle,
                {
                  color: sereneColors.primary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                },
              ]}
            >
              {secondaryCta}
            </RNText>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
