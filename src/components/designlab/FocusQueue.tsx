import React from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sereneColors, sereneTypography, sereneSpacing, sereneBorderRadius, useResponsive } from '../../theme/serene';

export interface QueueItem {
  id: string;
  title: string;
  minutes: number;
}

export interface FocusQueueProps {
  items: QueueItem[];
  /** Callback al presionar el botón "promote" de un item */
  onPromote?: (id: string) => void;
  /** Callback al presionar el botón "+" del header */
  onAdd?: () => void;
  /** Título de la sección */
  title?: string;
  /** Subtítulo de la sección */
  subtitle?: string;
  /** Máximo de items visibles (default 3) */
  maxVisible?: number;
}

export default function FocusQueue({
  items,
  onPromote,
  onAdd,
  title = 'Próximos pasos',
  subtitle,
  maxVisible = 3,
}: FocusQueueProps) {
  const { scale: s } = useResponsive();

  if (!items.length && !onAdd) return null;

  const visible = items.slice(0, maxVisible);
  const hiddenCount = items.length - visible.length;

  return (
    <View>
      {/* Header: título + badge de conteo + botón "+" */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: subtitle ? s(4) : sereneSpacing['space-sm'],
        }}
      >
        <RNText
          style={[
            sereneTypography['title-md'] as TextStyle,
            { color: sereneColors['on-surface'], fontWeight: '600' },
          ]}
        >
          {title}
        </RNText>

        <View
          style={{
            marginLeft: sereneSpacing['space-sm'],
            minWidth: s(20),
            paddingHorizontal: s(6),
            paddingVertical: s(1),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['surface-container-high'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {items.length}
          </RNText>
        </View>

        {onAdd && (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel="Añadir micro-paso"
            hitSlop={s(8)}
            style={({ pressed }) => ({
              marginLeft: 'auto',
              width: s(32),
              height: s(32),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name="plus" size={s(18)} color={sereneColors.primary} />
          </Pressable>
        )}
      </View>

      {subtitle && (
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], marginBottom: sereneSpacing['space-sm'] },
          ]}
        >
          {subtitle}
        </RNText>
      )}

      {/* Items: filas de una sola línea */}
      {visible.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: s(8),
            borderBottomWidth: 1,
            borderBottomColor: sereneColors['surface-container-high'],
          }}
        >
          <RNText
            numberOfLines={1}
            style={[
              sereneTypography['body-md'] as TextStyle,
              { flex: 1, minWidth: 0, color: sereneColors['on-surface'] },
            ]}
          >
            {item.title}
          </RNText>

          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.secondary }]}>
            {`${item.minutes} min`}
          </RNText>

          {onPromote && (
            <Pressable
              onPress={() => onPromote(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Promover ${item.title}`}
              hitSlop={s(8)}
              style={({ pressed }) => ({
                width: s(32),
                height: s(32),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-low'],
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialCommunityIcons name="arrow-up-bold" size={s(16)} color={sereneColors.secondary} />
            </Pressable>
          )}
        </View>
      ))}

      {hiddenCount > 0 && (
        <RNText
          style={[
            sereneTypography['label-md'] as TextStyle,
            { color: sereneColors.secondary, marginTop: sereneSpacing['space-sm'] },
          ]}
        >
          {`+${hiddenCount} más`}
        </RNText>
      )}
    </View>
  );
}
