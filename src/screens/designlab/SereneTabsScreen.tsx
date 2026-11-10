import React, { useState } from 'react';
import { Pressable, ScrollView, Text as RNText, View, type TextStyle } from 'react-native';
import ScreenHeader from '../../components/designlab/ScreenHeader';
import SereneTabBar, {
  type SereneTabKey,
} from '../../components/ui/SereneTabBar';
import { sereneTabsFixtures, sereneTabsNote } from './sereneTabsFixtures';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';

/**
 * "Marco con tabs" del Design Lab: muestra Foco / Tareas / Perfil con la barra
 * de 3 tabs puesta, dentro del layout. Sirve para comprobar que la barra no
 * tape el botón principal de cada pantalla. No toca navegación real.
 */
export default function SereneTabsScreen() {
  const { scale: s } = useResponsive();
  const [active, setActive] = useState<SereneTabKey>('foco');
  const copy = sereneTabsFixtures.find((tab) => tab.key === active) ?? sereneTabsFixtures[0];

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScreenHeader title={copy.title} subtitle={copy.subtitle} />

      <RNText
        style={[
          sereneTypography['label-sm'] as TextStyle,
          {
            color: sereneColors['on-surface-variant'],
            paddingHorizontal: sereneSpacing.gutter,
            paddingBottom: sereneSpacing['space-sm'],
          },
        ]}
      >
        {sereneTabsNote}
      </RNText>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingBottom: sereneSpacing['space-md'],
          gap: sereneSpacing['space-sm'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {copy.rows.map((row) => (
          <View
            key={row}
            style={{
              backgroundColor: sereneColors['surface-container-low'],
              borderRadius: sereneBorderRadius.lg,
              padding: sereneSpacing['space-md'],
              ...sereneShadows.card,
            }}
          >
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {row}
            </RNText>
          </View>
        ))}
      </ScrollView>

      {/* Acción principal en flujo, justo encima de la barra */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingVertical: sereneSpacing['space-sm'],
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.primaryCta}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-primary'] },
            ]}
          >
            {copy.primaryCta}
          </RNText>
        </Pressable>
      </View>

      <SereneTabBar active={active} onSelect={setActive} />
    </View>
  );
}
