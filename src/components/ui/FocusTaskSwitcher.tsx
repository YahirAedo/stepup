import React, { useRef, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  Animated,
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
import { formatStepMinutes } from '../../features/focus/logic/formatStepMinutes';

export interface SwitcherTask {
  id: number;
  name: string;
  stepName: string;
  minutes: number | null;
  stepIndex: number;
  totalSteps: number;
}

export interface FocusTaskSwitcherProps {
  active: SwitcherTask;
  alternatives: SwitcherTask[];
  onSelect: (taskId: number) => void;
  expandedByDefault?: boolean;
}

export default function FocusTaskSwitcher({
  active,
  alternatives,
  onSelect,
  expandedByDefault = false,
}: FocusTaskSwitcherProps) {
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
      ]),
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
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Cambiar de tarea, ${alternatives.length} para elegir`}
        style={({ pressed }) => ({
          width: '100%',
          minHeight: s(48) + sereneSpacing['space-sm'] * 2,
          backgroundColor: sereneColors['surface-container-lowest'],
          borderRadius: sereneBorderRadius.xl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-md'],
          paddingHorizontal: sereneSpacing['space-md'],
          paddingVertical: sereneSpacing['space-sm'],
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
          <MaterialCommunityIcons name={mci('swap_vert')} size={s(18)} color={sereneColors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-surface'] },
            ]}
          >
            Cambiar de tarea
          </RNText>
        </View>
        <View
          style={{
            minWidth: s(28),
            height: s(28),
            paddingHorizontal: s(6),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['secondary-fixed'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.primary, fontWeight: '700' }]}>
            {alternatives.length}
          </RNText>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <MaterialCommunityIcons name={mci('expand_more')} size={s(20)} color={sereneColors.secondary} />
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
              {active.name}
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
              onPress={() => {
                onSelect(task.id);
                setOpen(false);
                rotation.setValue(0);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Elegir ${task.name}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: sereneSpacing['space-sm'],
                width: '100%',
                minHeight: s(48),
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
                {formatStepMinutes(task.minutes)}
              </RNText>
              <MaterialCommunityIcons name={mci('arrow_forward_ios')} size={s(16)} color={sereneColors.secondary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
