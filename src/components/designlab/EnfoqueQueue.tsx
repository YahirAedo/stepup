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

export interface EnfoqueQueueItem {
  id: string;
  name: string;
  minutes: number;
}

export interface EnfoqueQueueProps {
  items: EnfoqueQueueItem[];
  /** Texto de respaldo cuando la cola está vacía. */
  subtitle?: string;
  /** Callback al subir un item a foco. */
  onPromote?: (id: string) => void;
  /** Callback al presionar el botón "+". */
  onAdd?: () => void;
  /** Estado inicial del acordeón. */
  expandedByDefault?: boolean;
}

/**
 * Próximos pasos en acordeón colapsado (Variante E — Enfoque).
 * Header full-width con badge de conteo, "Siguiente: …" y chevron rotatorio;
 * el cuerpo expande las filas. Design Lab — no es la pantalla final.
 */
export default function EnfoqueQueue({
  items,
  subtitle,
  onPromote,
  onAdd,
  expandedByDefault = false,
}: EnfoqueQueueProps) {
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

  // La línea del header muestra el siguiente paso; `subtitle` es respaldo vacío.
  const nextLine = items.length > 0 ? `Siguiente: ${items[0].name}` : subtitle ?? '';

  return (
    <View>
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel="Expandir próximos pasos"
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
        {/* Badge redondo con el conteo */}
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

        {/* Título + línea "Siguiente" */}
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

        {/* Añadir (no debe togglear el acordeón) */}
        {onAdd ? (
          <Pressable
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              onAdd();
            }}
            accessibilityRole="button"
            accessibilityLabel="Añadir micro-paso"
            hitSlop={s(8)}
            style={({ pressed }) => ({
              width: s(32),
              height: s(32),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name="plus" size={s(18)} color={sereneColors.primary} />
          </Pressable>
        ) : null}

        {/* Chevron rotatorio */}
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <MaterialCommunityIcons name="chevron-down" size={s(20)} color={sereneColors.secondary} />
        </Animated.View>
      </Pressable>

      {/* Cuerpo expandido: filas de la cola */}
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
                {`${item.minutes} min`}
              </RNText>

              {onPromote ? (
                <Pressable
                  onPress={() => onPromote(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Promover ${item.name}`}
                  hitSlop={s(8)}
                  style={({ pressed }) => ({
                    width: s(28),
                    height: s(28),
                    borderRadius: sereneBorderRadius.full,
                    backgroundColor: sereneColors['surface-container-low'],
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name="arrow-up-bold"
                    size={s(15)}
                    color={sereneColors.secondary}
                  />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
