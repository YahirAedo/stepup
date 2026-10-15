import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

export interface BottomSheetProps {
  /** Controla la entrada/salida del sheet. */
  visible: boolean;
  /** Cierra el sheet (scrim o boton de cierre). */
  onClose: () => void;
  /** Etiqueta accesible del scrim/cierre. */
  closeLabel?: string;
  children: React.ReactNode;
}

/**
 * Sheet inferior del Design Lab. Sin dependencias nuevas: overlay absoluto con
 * scrim, card anclada abajo y `KeyboardAvoidingView` para el teclado abierto.
 * Reusa el patron de `TimerExpiredOverlay` (fade + slide con `Animated`).
 *
 * No es un Modal de RN a proposito: el sheet se monta dentro del arbol de la
 * preview para que en web/Expo Go respete el mismo layout de la pantalla.
 */
export default function BottomSheet({
  visible,
  onClose,
  closeLabel = 'Cerrar',
  children,
}: BottomSheetProps) {
  const { scale: s } = useResponsive();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);

  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : s(40))).current;

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
      Animated.timing(translateY, { toValue: s(40), duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, opacity, translateY, s]);

  if (!mounted) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }}
    >
      <Animated.View style={{ flex: 1, opacity }}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={{ flex: 1, backgroundColor: withAlpha(sereneColors['inverse-surface'], 0.35) }}
        />

        <Animated.View
          style={{
            backgroundColor: sereneColors['surface-container-lowest'],
            borderTopLeftRadius: sereneBorderRadius.xl * 2,
            borderTopRightRadius: sereneBorderRadius.xl * 2,
            paddingTop: s(12),
            paddingHorizontal: sereneSpacing.margin,
            paddingBottom: insets.bottom + sereneSpacing['space-md'],
            transform: [{ translateY }],
            ...sereneShadows.sheet,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: s(40),
              height: s(4),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['outline-variant'],
              marginBottom: s(12),
            }}
          />
          {children}
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
