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
  useResponsive,
} from '../../theme/serene';
import { mci } from '../designlab/mciIconMap';
import { formatStepMinutes } from '../../features/focus/logic/formatStepMinutes';

export interface FocusQueueItem {
  id: number;
  name: string;
  minutes: number | null;
}

export interface FocusQueueProps {
  items: FocusQueueItem[];
  onEdit?: () => void;
  expandedByDefault?: boolean;
}

export default function FocusQueue({
  items,
  onEdit,
  expandedByDefault = false,
}: FocusQueueProps) {
  const { scale: s } = useResponsive();
  const [open, setOpen] = useState(expandedByDefault);
  const rotation = useRef(new Animated.Value(expandedByDefault ? 1 : 0)).current;

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    Animated.timing(rotation, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const nextLine = items.length > 0 ? `Siguiente: ${items[0].name}` : '';

  return (
    <View>
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="Próximos pasos"
        style={({ pressed }) => ({
          width: '100%',
          minHeight: s(48),
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
            minWidth: s(28),
            height: s(28),
            paddingHorizontal: s(6),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['secondary-fixed'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors.primary, fontWeight: '700' },
            ]}
          >
            {items.length}
          </RNText>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <RNText
            style={[
              sereneTypography['title-md'] as TextStyle,
              { color: sereneColors['on-surface'] },
            ]}
          >
            Próximos pasos
          </RNText>
          {nextLine ? (
            <RNText
              numberOfLines={1}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'] },
              ]}
            >
              {nextLine}
            </RNText>
          ) : null}
        </View>

        {onEdit ? (
          <Pressable
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              onEdit();
            }}
            accessibilityRole="button"
            accessibilityLabel="Editar tarea"
            hitSlop={s(8)}
            style={({ pressed }) => ({
              minWidth: s(48),
              minHeight: s(48),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('edit')} size={s(18)} color={sereneColors.primary} />
          </Pressable>
        ) : null}

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
          {items.map((item, index) => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: sereneSpacing['space-sm'],
                paddingVertical: s(8),
                borderBottomWidth: index === items.length - 1 ? 0 : 1,
                borderBottomColor: sereneColors['surface-container-high'],
              }}
            >
              <View
                style={{
                  width: s(6),
                  height: s(6),
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: sereneColors.secondary,
                }}
              />

              <RNText
                numberOfLines={1}
                style={[
                  sereneTypography['body-sm'] as TextStyle,
                  { flex: 1, minWidth: 0, color: sereneColors['on-surface'] },
                ]}
              >
                {item.name}
              </RNText>

              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {formatStepMinutes(item.minutes)}
              </RNText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
