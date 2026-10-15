import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';
import { mci } from './mciIconMap';

export type QueueTaskStatus = 'ready' | 'draft';

export interface QueueTaskItem {
  id: string;
  name: string;
  stepCount: number;
  totalMinutes: number;
  status: QueueTaskStatus;
  statusLabel: string;
}

export interface QueueTaskRowProps {
  item: QueueTaskItem;
  onToggleComplete?: () => void;
  onPress?: () => void;
}

/**
 * Fila de la "Cola de espera" (bloque F del Listado).
 *
 * Checkbox de completar (visual; la preview no persiste), nombre truncado,
 * meta "X pasos (~Y min total)" + badge de estado (Lista para iniciar =
 * secondary-container; Borrador = surface-container) y chevron de navegacion.
 */
export default function QueueTaskRow({ item, onToggleComplete, onPress }: QueueTaskRowProps) {
  const { scale: s } = useResponsive();
  const isReady = item.status === 'ready';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalles de ${item.name}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: sereneSpacing['space-md'],
        padding: s(14),
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: sereneSpacing['space-md'], flex: 1, minWidth: 0 }}>
        {/* Checkbox */}
        <Pressable
          onPress={onToggleComplete}
          hitSlop={s(8)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: false }}
          accessibilityLabel={`Completar ${item.name}`}
          style={({ pressed }) => ({
            marginTop: s(2),
            width: s(20),
            height: s(20),
            borderRadius: s(6),
            backgroundColor: sereneColors['surface-container'],
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('check')} size={s(14)} color={sereneColors['primary-container']} />
        </Pressable>

        <View style={{ minWidth: 0, gap: s(4), flex: 1 }}>
          <RNText
            numberOfLines={1}
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {item.name}
          </RNText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: s(8) }}>
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {item.stepCount} pasos (~{item.totalMinutes} min total)
            </RNText>
            <View
              style={{
                width: s(4),
                height: s(4),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['outline-variant'],
              }}
            />
            <View
              style={{
                paddingHorizontal: s(6),
                paddingVertical: s(2),
                borderRadius: sereneBorderRadius.DEFAULT,
                backgroundColor: isReady
                  ? sereneColors['secondary-container']
                  : sereneColors['surface-container'],
              }}
            >
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  {
                    color: isReady
                      ? sereneColors['on-secondary-container']
                      : sereneColors['on-surface-variant'],
                  },
                ]}
              >
                {item.statusLabel}
              </RNText>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        hitSlop={s(8)}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de ${item.name}`}
        style={({ pressed }) => ({
          padding: s(6),
          borderRadius: sereneBorderRadius.lg,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <MaterialCommunityIcons name={mci('arrow_forward_ios')} size={s(20)} color={sereneColors['on-surface-variant']} />
      </Pressable>
    </Pressable>
  );
}