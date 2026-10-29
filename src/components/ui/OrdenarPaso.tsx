import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text as RNText,
  View,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { moveToPosition } from '../../utils/designlab/stepOrder';
import { mci } from '../designlab/mciIconMap';

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

export default function OrdenarPaso({
  visible,
  steps,
  lockedIds,
  onClose,
  onDone,
}: OrdenarPasoProps) {
  const { scale: s } = useResponsive();
  const insets = useSafeAreaInsets();
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
        setSelectedId(null);
        setOrder(result.order);
        return;
      }

      if (result.selectedId === id && selectedId === null) {
        setSelectedId(id);
        setOrder(result.order);
        return;
      }

      if (result.selectedId === selectedId && selectedId !== null) {
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

  const stepsKey = steps.map((step) => step.id).join('|');

  useEffect(() => {
    if (visible) {
      setOrder(steps.map((step) => step.id));
      setSelectedId(null);
    }
  }, [visible, stepsKey]);

  const handleDone = useCallback(() => {
    const pendingOrdered = order.filter((id) => !lockedSet.has(id));
    onDone(pendingOrdered);
  }, [order, lockedSet, onDone]);

  const pendingSteps = steps.filter((step) => !lockedSet.has(step.id));
  const hasPending = pendingSteps.length > 0;

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        backgroundColor: 'transparent',
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar ordenar"
        style={{ flex: 1, backgroundColor: withAlpha(sereneColors['inverse-surface'], 0.45) }}
      />
      <View
        style={{
          maxHeight: '85%',
          backgroundColor: sereneColors['surface-container-lowest'],
          borderTopLeftRadius: sereneBorderRadius.xl * 2,
          borderTopRightRadius: sereneBorderRadius.xl * 2,
          paddingTop: sereneSpacing['space-md'],
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
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

        <ScrollView style={{ flexShrink: 1 }}>
          {order.map((id) => {
            const step = stepById.get(id);
            if (!step) return null;
            const isLocked = lockedSet.has(id);
            const isSelected = selectedId === id;
            const pendingIndex = pendingSteps.findIndex((s) => s.id === id);

            return (
              <Pressable
                key={id}
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
            );
          })}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}