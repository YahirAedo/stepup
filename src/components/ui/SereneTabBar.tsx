import React from 'react';
import { Pressable, Text as RNText, View, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  useResponsive,
} from '../../theme/serene';

type MciName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type SereneTabKey = 'foco' | 'tareas' | 'perfil';

export interface SereneTabItem {
  key: SereneTabKey;
  label: string;
  icon: MciName;
}

export interface SereneTabBarPreviewProps {
  active: SereneTabKey;
  onSelect: (key: SereneTabKey) => void;
  items?: SereneTabItem[];
}

const DEFAULT_ITEMS: SereneTabItem[] = [
  { key: 'foco', label: 'Foco', icon: 'timer-outline' },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox-marked-outline' },
  { key: 'perfil', label: 'Perfil', icon: 'account-outline' },
];

/**
 * Barra de 3 tabs del rediseno, DENTRO del layout (no `position: absolute`).
 * Etiquetas SIEMPRE visibles. Existe para previsualizar Foco/Tareas/Perfil con
 * la barra puesta y detectar botones tapados. No toca `GlassTabBar` real.
 */
export default function SereneTabBarPreview({
  active,
  onSelect,
  items = DEFAULT_ITEMS,
}: SereneTabBarPreviewProps) {
  const insets = useSafeAreaInsets();
  const { scale: s } = useResponsive();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: sereneColors['surface-container-lowest'],
        borderTopWidth: 1,
        borderTopColor: sereneColors['outline-variant'],
        paddingTop: sereneSpacing['space-sm'],
        paddingBottom: insets.bottom + sereneSpacing['space-sm'],
      }}
    >
      {items.map((item) => {
        const selected = item.key === active;
        const color = selected ? sereneColors.primary : sereneColors['on-surface-variant'];
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: s(48),
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(2),
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialCommunityIcons name={item.icon} size={s(24)} color={color} />
            <RNText
              numberOfLines={1}
              style={[sereneTypography['label-sm'] as TextStyle, { color }]}
            >
              {item.label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
