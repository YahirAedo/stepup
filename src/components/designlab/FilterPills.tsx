import React from 'react';
import { Text as RNText, Pressable, ScrollView, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';

export interface FilterPillOption<T extends string> {
  key: T;
  label: string;
  count?: number;
}

export interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  activeKey: T;
  onChange: (key: T) => void;
}

/**
 * Pill tabs del mockup Tareas — Listado (filtro Activas / En pausa / Completadas).
 *
 * El JS del HTML solo conmuta la clase visual de la pill activa; NO filtra la
 * lista. Aca se replica esa micro-interaccion (cambio de estado visual) y el
 * filtrado real queda deliberadamente como decision del consumidor: la preview
 * es presentacional y los fixtures no se filtrar.
 */
export default function FilterPills<T extends string>({
  options,
  activeKey,
  onChange,
}: FilterPillsProps<T>) {
  const { scale: s } = useResponsive();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: sereneSpacing['space-sm'], paddingVertical: s(2) }}
      accessibilityRole="tablist"
      accessibilityLabel="Filtros de tareas"
    >
      {options.map((opt) => {
        const active = opt.key === activeKey;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${opt.label}${opt.count !== undefined ? ` (${opt.count})` : ''}`}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(12),
              paddingVertical: s(6),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: active
                ? sereneColors['primary-container']
                : sereneColors['surface-container'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                {
                  color: active ? sereneColors['on-primary'] : sereneColors['on-surface-variant'],
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