import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';

export interface ToastProps {
  visible: boolean;
  message: string;
  /** Accion opcional (p. ej. "Deshacer"). */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  /** Auto-descarte. Default 4000 ms. */
  durationMs?: number;
  /** Separacion extra desde abajo (alto de la barra fija). */
  bottomOffset?: number;
}

/**
 * Toast con auto-descarte y accion "Deshacer". Sin dependencias: `Animated`
 * nativo (mismo patron que `BottomSheet`). El auto-descarte lo controla el
 * padre via `visible` + `onDismiss`.
 */
export default function Toast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4000,
  bottomOffset = 0,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : s(24))).current;

  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      timer = setTimeout(() => onDismissRef.current(), durationMs);
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: s(24), duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, durationMs, opacity, translateY, s]);

  if (!mounted) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + bottomOffset + sereneSpacing['space-md'],
        alignItems: 'center',
        paddingHorizontal: sereneSpacing.gutter,
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        accessibilityRole="alert"
        accessibilityLabel={message}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-md'],
          maxWidth: '100%',
          backgroundColor: sereneColors['inverse-surface'],
          borderRadius: sereneBorderRadius.lg,
          paddingLeft: sereneSpacing['space-md'],
          paddingRight: sereneSpacing['space-sm'],
          paddingVertical: sereneSpacing['space-sm'],
          ...sereneShadows.sheet,
        }}
      >
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['inverse-on-surface'], flexShrink: 1 },
          ]}
        >
          {message}
        </RNText>
        {actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={({ pressed }) => ({
              minHeight: s(36),
              paddingHorizontal: sereneSpacing['space-sm'],
              justifyContent: 'center',
              borderRadius: sereneBorderRadius.lg,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['inverse-primary'] },
              ]}
            >
              {actionLabel}
            </RNText>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
