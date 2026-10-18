import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Animated,
  Text as RNText,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomLayout } from '../../theme/layout';
import { useFocusCountdown } from '../../hooks/useFocusCountdown';
import CircularCountdown from './CircularCountdown';
import DesignLabHeader from './DesignLabHeader';
import TimerExpiredOverlay from './TimerExpiredOverlay';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';

export interface FocusRunningViewProps {
  /** Segundos iniciales */
  initialSeconds: number;
  /** Segundos máximos (objetivo) */
  maxSeconds: number;
  /** Fixtures de textos y acciones */
  fixtures: typeof import('../../screens/designlab/focusFixtures').corriendoFixtures;
  /** Título del header */
  headerTitle?: string;
  /** Callback cuando se completa el paso (opcional, para navegar de vuelta) */
  onComplete?: () => void;
}

const TOAST_DURATION_MS = 2800;

/**
 * Vista compartida del estado "corriendo" del Focus.
 * Usada por `CronometroLimpioScreen` y `EnfoqueFocusScreen`.
 *
 * Recibe `initialSeconds` y `maxSeconds` como props para permitir
 * que el selector de duración del estado previo los determine.
 */
export default function FocusRunningView({
  initialSeconds,
  maxSeconds,
  fixtures,
  headerTitle = 'Cronómetro',
  onComplete,
}: FocusRunningViewProps) {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();

  const countdown = useFocusCountdown({
    initialSeconds,
    maxSeconds,
  });

  const { isPaused, toggle, addSeconds, remaining, total, isFinished } = countdown;

  const [completed, setCompleted] = useState(false);
  const toastTranslateY = useRef(new Animated.Value(s(120))).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(toastTranslateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastTranslateY, { toValue: s(120), duration: 300, useNativeDriver: true }),
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      toastTimeoutRef.current = null;
    }, TOAST_DURATION_MS);
  }, [s, toastOpacity, toastTranslateY]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      };
    }, [])
  );

  const handleComplete = useCallback(() => {
    if (completed) return;
    setCompleted(true);
    showToast();
    // NO escribe en base de datos — preview autonoma con datos mock.
    if (onComplete) {
      // Dar tiempo a que se vea el toast antes de navegar/volver
      setTimeout(onComplete, TOAST_DURATION_MS + 100);
    }
  }, [completed, showToast, onComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={headerTitle} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: contentPaddingBottom,
          alignItems: 'center',
        }}
      >
        <CircularCountdown state={{ remaining, total }} isPaused={isPaused} />

        {/* Micro-controls */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            marginTop: sereneSpacing['space-md'],
            width: '100%',
            maxWidth: s(320),
          }}
        >
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? fixtures.actions.resume : fixtures.actions.pause}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container'],
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={isPaused ? 'play' : 'pause'}
              size={s(17)}
              color={sereneColors.secondary}
            />
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {isPaused ? fixtures.actions.resume : fixtures.actions.pause}
            </RNText>
          </Pressable>

          <Pressable
            onPress={() => addSeconds(120)}
            accessibilityRole="button"
            accessibilityLabel="Agregar 2 minutos"
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container'],
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons name="timer-plus" size={s(17)} color={sereneColors.secondary} />
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {fixtures.actions.addTwoMinutes}
            </RNText>
          </Pressable>
        </View>

        {/* Priority section */}
        <View
          style={{
            marginTop: sereneSpacing['space-lg'],
            alignItems: 'center',
            paddingHorizontal: 8,
          }}
        >
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              {
                color: sereneColors.secondary,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: 6,
              },
            ]}
          >
            {fixtures.step.eyebrow}
          </RNText>

          <RNText
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              {
                color: sereneColors['on-surface'],
                lineHeight: s(34),
                textAlign: 'center',
                maxWidth: s(280),
              },
            ]}
          >
            {fixtures.step.name}
          </RNText>

          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <MaterialCommunityIcons name="spa" size={s(18)} color={sereneColors.secondary} />
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {fixtures.step.subtitle}
            </RNText>
          </View>
        </View>

        {/* Bottom action */}
        <View style={{ marginTop: sereneSpacing['space-lg'], width: '100%' }}>
          <Pressable
            onPress={handleComplete}
            disabled={completed}
            accessibilityRole="button"
            accessibilityLabel="Marcar paso hecho"
            style={({ pressed }) => ({
              width: '100%',
              height: s(56),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: completed ? sereneColors.secondary : sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: pressed && !completed ? 0.98 : 1,
              ...sereneShadows.card,
            })}
          >
            <MaterialCommunityIcons
              name={completed ? 'check-circle' : 'check'}
              size={s(22)}
              color={sereneColors['on-primary']}
            />
            <RNText
              style={[
                sereneTypography['label-lg'] as TextStyle,
                { color: sereneColors['on-primary'], textTransform: 'uppercase', letterSpacing: 0.4 },
              ]}
            >
              {completed ? fixtures.actions.completed : fixtures.actions.markDone}
            </RNText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Toast */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: [{ translateY: toastTranslateY }],
          opacity: toastOpacity,
        }}
      >
        <View
          style={{
            bottom: s(24),
            backgroundColor: withAlpha(sereneColors['surface-container-highest'], 0.95),
            borderRadius: sereneBorderRadius.lg,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginHorizontal: sereneSpacing.gutter,
            ...sereneShadows.sheet,
          }}
        >
          <View
            style={{
              width: s(40),
              height: s(40),
              borderRadius: s(20),
              backgroundColor: sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="check-all" size={s(20)} color={sereneColors['on-primary']} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <RNText
              style={[
                sereneTypography['title-md'] as TextStyle,
                { color: sereneColors['on-surface'], flexShrink: 1 },
              ]}
              numberOfLines={1}
            >
              {fixtures.toast.title}
            </RNText>
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors.secondary, flexShrink: 1 },
              ]}
              numberOfLines={1}
            >
              {fixtures.toast.subtitle}
            </RNText>
          </View>
        </View>
      </Animated.View>

      {/* Overlay de tiempo cumplido: fuerza decision al llegar a 0:00 */}
      <TimerExpiredOverlay
        visible={isFinished && !completed}
        headline={fixtures.expired.headline}
        subtitle={fixtures.expired.subtitle}
        primaryCta={fixtures.expired.primaryCta}
        secondaryCta={fixtures.expired.secondaryCta}
        onMarkDone={handleComplete}
        onExtend={() => addSeconds(120)}
      />
    </View>
  );
}