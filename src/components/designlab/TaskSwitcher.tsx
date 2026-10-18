import React, { useRef, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  Animated,
  type TextStyle,
  type GestureResponderEvent,
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

export interface TaskSwitcherTask {
  id: string;
  name: string;
  minutes: number;
  stepIndex: number;
  totalSteps: number;
  stepName: string;
  description?: string;
}

export interface TaskSwitcherProps {
  activeTask: TaskSwitcherTask;
  alternatives: TaskSwitcherTask[];
  remainingToday: number;
  onSelect: (task: TaskSwitcherTask) => void;
  expandedByDefault?: boolean;
}

/**
 * Switcher de tareas (Variante E – Enfoque).
 */
export default function TaskSwitcher({
  activeTask,
  alternatives,
  remainingToday,
  onSelect,
  expandedByDefault = false,
}: TaskSwitcherProps) {
  const { scale: s } = useResponsive();
  const [open, setOpen] = useState(expandedByDefault);
  const rotation = useRef(new Animated.Value(expandedByDefault ? 1 : 0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

React.useEffect(() => {
    if (!open) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [open, pulseOpacity]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rotation, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  };

  const chevronRotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View>
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel="Cambiar de tarea"
        style={({ pressed }) => ({
          width: '100%',
          backgroundColor: sereneColors['surface-container-lowest'],
          borderRadius: sereneBorderRadius.xl,
          padding: sereneSpacing['space-md'],
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-md'],
          ...sereneShadows.card,
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <View
          style={{
            width: s(32),
            height: s(32),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: withAlpha(sereneColors.primary, 0.08),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={s(18)} color={sereneColors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 0.8 },
            ]}
          >
            Cambiar de tarea
          </RNText>
          <RNText numberOfLines={1} style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {activeTask.name}
          </RNText>
        </View>
        <View
          style={{
            paddingHorizontal: s(10),
            paddingVertical: s(4),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['primary-fixed'],
          }}
        >
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary }]}>
            {`${remainingToday} restantes hoy`}
          </RNText>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <MaterialCommunityIcons name="chevron-down" size={s(20)} color={sereneColors.secondary} />
        </Animated.View>
      </Pressable>

      {open ? (
        <View
          style={{
            marginTop: sereneSpacing['space-sm'],
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: sereneSpacing['space-sm'],
              paddingVertical: s(8),
              paddingHorizontal: sereneSpacing['space-sm'],
              backgroundColor: sereneColors['surface-container-low'],
              borderRadius: sereneBorderRadius.xl,
              marginBottom: sereneSpacing['space-sm'],
            }}
          >
            <Animated.View
              style={{
                width: s(6),
                height: s(6),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors.primary,
                opacity: pulseOpacity,
              }}
            />
            <RNText
              numberOfLines={1}
              style={[
                sereneTypography['body-md'] as TextStyle,
                { flex: 1, minWidth: 0, color: sereneColors['on-surface'], fontWeight: '600' },
              ]}
            >
              {activeTask.name}
            </RNText>
            <View
              style={{
                paddingHorizontal: s(8),
                paddingVertical: s(2),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['secondary-container'],
              }}
            >
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  { color: sereneColors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
                ]}
              >
                En curso
              </RNText>
            </View>
          </View>

          {alternatives.map((task, index) => (
            <Pressable
              key={task.id}
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onSelect(task);
                setOpen(false);
                rotation.setValue(0);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar ${task.name}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: sereneSpacing['space-sm'],
                width: '100%',
                paddingVertical: s(8),
                paddingHorizontal: sereneSpacing['space-sm'],
                borderBottomWidth: index === alternatives.length - 1 ? 0 : 1,
                borderBottomColor: sereneColors['surface-container-high'],
                opacity: pressed ? 0.95 : 1,
              })}
            >
              <View style={{ width: s(6), height: s(6), borderRadius: sereneBorderRadius.full, backgroundColor: sereneColors['outline-variant'] }} />
              <RNText numberOfLines={1} style={[sereneTypography['body-sm'] as TextStyle, { flex: 1, minWidth: 0, color: sereneColors['on-surface'] }]}>
                {task.name}
              </RNText>
              <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
                {`${task.minutes} min`}
              </RNText>
              <MaterialCommunityIcons name="chevron-right" size={s(16)} color={sereneColors.secondary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
