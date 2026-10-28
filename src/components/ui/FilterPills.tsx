import React from 'react';
import { Text as RNText, Pressable, ScrollView, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci } from '../designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { formatTaskCount } from '../../features/tasks/logic/formatTaskCount';

export interface FilterPillOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

export interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  /** Etiqueta accesible del grupo. Default: "Filtros de tareas". */
  accessibilityLabel?: string;
}

/**
 * Pill tabs del mockup Tareas — Listado (filtro En curso / Por empezar / Completadas).
 *
 * Horizontal scroll si no entran las tres. Estado seleccionado NO solo por color:
 * lleva check chico + texto en negrita. Contraste: on-primary sobre primary-container.
 */
export default function FilterPills<T extends string>({
  options,
  activeKey,
  onChange,
  accessibilityLabel = 'Filtros de tareas',
}: FilterPillsProps<T>) {
  const { scale: s } = useResponsive();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: sereneSpacing['space-sm'], paddingVertical: s(2) }}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((opt) => {
        const active = opt.key === activeKey;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${opt.label}, ${formatTaskCount(opt.count ?? 0)}`}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(12),
              minHeight: s(48),
              paddingVertical: s(6),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: active
                ? sereneColors['primary-container']
                : sereneColors['surface-container-high'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {active && (
              <MaterialCommunityIcons
                name={mci('check')}
                size={s(14)}
                color={sereneColors['on-primary']}
              />
            )}
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                {
                  color: active
                    ? sereneColors['on-primary']
                    : sereneColors['on-surface-variant'],
                  fontWeight: active ? '600' : '400',
                },
              ]}
            >
              {opt.label}
              {opt.count !== undefined ? ` (${opt.count})` : ''}
            </RNText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
