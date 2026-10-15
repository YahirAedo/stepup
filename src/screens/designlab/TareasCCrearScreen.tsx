// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import TareaCForm from '../../components/designlab/tareas/TareaCForm';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoCCrearFixtures } from './tareasFlujoCFixtures';

/**
 * Variante C "Sendero" — Tareas / Crear.
 *
 * Shell del formulario: header sin avatar, `TareaCForm` en modo `create` y una
 * barra de acción fija (en flujo, sin `position: absolute`) con un único CTA
 * primario "Crear y ver el sendero" y el secundario "Volver al listado".
 */
export default function TareasCCrearScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasCCrear'>>();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = flujoCCrearFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TareaCForm mode="create" />
      </ScrollView>

      {/* Barra de acción fija (en flujo del layout, no absolute) */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
          gap: sereneSpacing['space-sm'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          onPress={() => navigation.navigate('TareasCDetalle')}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('alt_route')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.primary}
          </RNText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.secondary}
          onPress={() => navigation.navigate('TareasCListado')}
          style={({ pressed }) => ({
            minHeight: s(44),
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: pressed ? sereneColors['surface-container-high'] : 'transparent',
          })}
        >
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {f.secondary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
