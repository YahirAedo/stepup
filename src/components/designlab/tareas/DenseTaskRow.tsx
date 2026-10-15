// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  Text as RNText,
  View,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProgressTrack from '../ProgressTrack';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import { stepCountLabel } from '../../../utils/microplan';

export interface DenseTaskRowProps {
  title: string;
  stepCount: number;
  totalMinutes: number;
  /** Avance 0..1 para la barra corta. */
  progress: number;
  onPress: () => void;
  onComplete: () => void;
  onPause: () => void;
}

/**
 * Fila densa del Listado Variante B ("Ritmo"): título, meta compacta
 * ("N pasos · ~N min") y barra de progreso corta.
 *
 * Detrás de la fila viven dos acciones reveladas por un gesto horizontal
 * (`PanResponder` + `Animated.Value` de react-native, sin dependencias):
 *
 * - Arrastrar hacia la derecha descubre "Completar" (lado izquierdo, primario).
 * - Arrastrar hacia la izquierda descubre "Pausar" (lado derecho).
 * - Al soltar con |dx| > 80 escalado se ejecuta la acción y la fila vuelve a 0
 *   con una spring; si no llega al umbral, hace snap a 0.
 *
 * El gesto SOLO se captura cuando `|dx| > |dy| && |dx| > 12`, así el
 * ScrollView vertical sigue mandando para los desplazamientos normales.
 *
 * FALLBACK documentado: si el conflicto con el ScrollView llegara a fallar en
 * algun device, se reemplaza por reveal-on-press — un Pressable sobre la fila
 * que despliega estos mismos 2 botones (mismo layout, mismo copy) y dispara la
 * acción al tocarlos. Mismas props, mismo contrato.
 *
 * // REQUIERE MIGRACIÓN: pausar una tarea necesita un status más allá de
 * active|completed en `Task.status`.
 */
export default function DenseTaskRow({
  title,
  stepCount,
  totalMinutes,
  progress,
  onPress,
  onComplete,
  onPause,
}: DenseTaskRowProps) {
  const { scale: s } = useResponsive();
  const panX = useRef(new Animated.Value(0)).current;
  const [rowWidth, setRowWidth] = useState(0);
  const threshold = s(80);

  // Los callbacks viven en refs para que el PanResponder (creado una vez)
  // siempre ejecute la última versión sin recrearse en cada render.
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const pauseRef = useRef(onPause);
  pauseRef.current = onPause;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 12,
        onPanResponderMove: (_event, gesture) => {
          if (rowWidth <= 0) return;
          panX.setValue(Math.max(-rowWidth, Math.min(rowWidth, gesture.dx)));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dx > threshold) {
            completeRef.current();
          } else if (gesture.dx < -threshold) {
            pauseRef.current();
          }
          Animated.spring(panX, {
            toValue: 0,
            friction: 7,
            tension: 120,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(panX, {
            toValue: 0,
            friction: 7,
            tension: 120,
            useNativeDriver: false,
          }).start();
        },
      }),
    [panX, rowWidth, threshold]
  );

  const meta = `${stepCountLabel(stepCount)} · ~${totalMinutes} min`;

  return (
    <View
      onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
      style={{ borderRadius: sereneBorderRadius.xl, overflow: 'hidden' }}
    >
      {/* Acciones detrás de la fila: se revelan al arrastrar. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
        }}
      >
        <Pressable
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel={`Completar ${title}`}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(6),
            paddingLeft: sereneSpacing['space-md'],
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('done')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
          >
            Completar
          </RNText>
        </Pressable>

        <Pressable
          onPress={onPause}
          accessibilityRole="button"
          accessibilityLabel={`Pausar ${title}`}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: s(6),
            paddingRight: sereneSpacing['space-md'],
            backgroundColor: sereneColors['secondary-container'],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-secondary-container'] },
            ]}
          >
            Pausar
          </RNText>
          <MaterialCommunityIcons
            name="pause"
            size={s(20)}
            color={sereneColors['on-secondary-container']}
          />
        </Pressable>
      </View>

      {/* Fila visible: se desplaza con el gesto y corta el toque al navegar. */}
      <Animated.View
        style={{
          transform: [{ translateX: panX }],
          backgroundColor: sereneColors['surface-container-lowest'],
        }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${meta}`}
          accessibilityHint="Deslizá a la derecha para completar o a la izquierda para pausar"
          style={({ pressed }) => ({
            paddingVertical: s(10),
            paddingHorizontal: sereneSpacing['space-md'],
            gap: s(6),
            backgroundColor: pressed
              ? sereneColors['surface-container-low']
              : sereneColors['surface-container-lowest'],
          })}
        >
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                color: sereneColors['on-surface'],
                flexShrink: 1,
                flexWrap: 'wrap',
              },
            ]}
          >
            {title}
          </RNText>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {meta}
          </RNText>
          <ProgressTrack progress={progress} height={s(4)} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
