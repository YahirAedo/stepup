import React, { useCallback, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text as RNText,
  View,
  type TextStyle,
} from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { moveToPosition } from '../../utils/designlab/stepOrder';
import { mci } from './mciIconMap';

export interface OrdenarPasoStep {
  id: string;
  name: string;
  completed: boolean;
  pendingDelete: boolean;
}

export interface OrdenarPasoProps {
  visible: boolean;
  steps: OrdenarPasoStep[];
  lockedIds: string[];
  onClose: () => void;
  /** Devuelve los ids de pasos pendientes en el nuevo orden (excluye locked). */
  onDone: (orderedIds: string[]) => void;
}

/**
 * Modal a pantalla completa para ordenar pasos. Compartido por Crear, Editar y Detalle.
 *
 * Cada paso muestra solo número y nombre. Tocar elige (resto se atenúa, sigue
 * tocable; elegido resaltado). Tocar otro pendiente mueve el elegido a la
 * posición exacta del tocado, los demás se corren (no intercambio), con animación.
 * Tocar el mismo elegido lo suelta.
 *
 * Los pasos bloqueados (completados / pendingDelete) están atenuados, no se
 * pueden elegir ni tocar como destino, y quedan anclados.
 *
 * Sin textos explicativos. Solo un ícono de deshacer.
 */
export default function OrdenarPaso({
  visible,
  steps,
  lockedIds,
  onClose,
  onDone,
}: OrdenarPasoProps) {
  const { scale: s } = useResponsive();
  const lockedSet = useMemo(() => new Set(lockedIds), [lockedIds.join(',')]);

  const [order, setOrder] = useState<string[]>(steps.map((step) => step.id));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animValue] = useState(() => new Animated.Value(0));

  const stepById = useMemo(
    () => new Map(steps.map((step) => [step.id, step])),
    [steps],
  );

  const handleStepPress = useCallback(
    (id: string) => {
      if (lockedSet.has(id)) return;

      const result = moveToPosition(order, selectedId, id, lockedIds);

      if (result.selectedId === null && selectedId === id) {
        // Se soltó el mismo paso
        setSelectedId(null);
        setOrder(result.order);
        return;
      }

      if (result.selectedId === id && selectedId === null) {
        // Se seleccionó por primera vez
        setSelectedId(id);
        setOrder(result.order);
        return;
      }

      if (result.selectedId === selectedId && selectedId !== null) {
        // Se movió el elegido a otra posición
        setOrder(result.order);
        Animated.timing(animValue, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          animValue.setValue(0);
        });
        return;
      }

      setOrder(result.order);
      setSelectedId(result.selectedId);
    },
    [order, selectedId, lockedIds, lockedSet, animValue],
  );

  const handleUndo = useCallback(() => {
    setSelectedId(null);
    setOrder(steps.map((step) => step.id));
  }, [steps]);

  const handleDone = useCallback(() => {
    const pendingOrdered = order.filter((id) => !lockedSet.has(id));
    onDone(pendingOrdered);
  }, [order, lockedSet, onDone]);

  const pendingSteps = steps.filter((step) => !lockedSet.has(step.id));
  const hasPending = pendingSteps.length > 0;

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        backgroundColor: sereneColors.surface,
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar ordenar"
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          gap: sereneSpacing['space-sm'],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: sereneSpacing['space-sm'],
          }}
        >
          <RNText
            style={[
              sereneTypography['headline-sm'] as TextStyle,
              { color: sereneColors['on-surface'] },
            ]}
          >
            Ordenar pasos
          </RNText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
            <Pressable
              onPress={handleUndo}
              disabled={!hasPending}
              accessibilityRole="button"
              accessibilityLabel="Deshacer ordenar"
              style={({ pressed }) => ({
                minHeight: s(44),
                minWidth: s(44),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-high'],
                opacity: !hasPending ? 0.4 : pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons
                name="undo"
                size={s(18)}
                color={sereneColors['on-surface-variant']}
              />
            </Pressable>
            <Pressable
              onPress={handleDone}
              accessibilityRole="button"
              accessibilityLabel="Guardar orden"
              style={({ pressed }) => ({
                minHeight: s(44),
                minWidth: s(44),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['primary-container'],
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons
                name={mci('check')}
                size={s(18)}
                color={sereneColors['on-primary']}
              />
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {order.map((id) => {
            const step = stepById.get(id);
            if (!step) return null;
            const isLocked = lockedSet.has(id);
            const isSelected = selectedId === id;
            const pendingIndex = pendingSteps.findIndex((s) => s.id === id);

            return (
              <Animated.View
                key={id}
                style={{
                  transform: [
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, s(-16)],
                      }),
                    },
                  ],
                }}
              >
                <Pressable
                  onPress={() => handleStepPress(id)}
                  disabled={isLocked}
                  accessibilityRole="button"
                  accessibilityLabel={`Paso ${step.name}`}
                  accessibilityState={{
                    selected: isSelected,
                    disabled: isLocked,
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: sereneSpacing['space-sm'],
                    paddingHorizontal: sereneSpacing['space-sm'],
                    paddingVertical: sereneSpacing['space-md'],
                    borderRadius: sereneBorderRadius.lg,
                    backgroundColor: isLocked
                      ? sereneColors['surface-container-low']
                      : isSelected
                        ? sereneColors['primary-container']
                        : sereneColors['surface-container-lowest'],
                    opacity: isLocked
                      ? 0.5
                      : isSelected
                        ? 1
                        : pressed
                          ? 0.92
                          : 1,
                  })}
                >
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: s(24),
                    }}
                  >
                    <RNText
                      style={[
                        sereneTypography['label-md'] as TextStyle,
                        {
                          color: isLocked
                            ? sereneColors['on-surface-variant']
                            : isSelected
                              ? sereneColors['on-primary-container']
                              : sereneColors['on-surface-variant'],
                        },
                      ]}
                    >
                      {pendingIndex >= 0 ? pendingIndex + 1 : ''}
                    </RNText>
                  </View>
                  <RNText
                    numberOfLines={1}
                    style={[
                      sereneTypography['body-md'] as TextStyle,
                      {
                        color: isLocked
                          ? sereneColors['on-surface-variant']
                          : isSelected
                            ? sereneColors['on-primary-container']
                            : sereneColors['on-surface'],
                        flex: 1,
                        minWidth: 0,
                        textDecorationLine: isLocked ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {step.name}
                  </RNText>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
