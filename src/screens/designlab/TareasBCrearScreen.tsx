// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback } from 'react';
import { View, ScrollView, Pressable, Text as RNText, type TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import TareaBForm from '../../components/designlab/tareas/TareaBForm';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import { flujoBCrearFixtures } from './tareasFlujoBFixtures';

type TareasBCrearNav = NativeStackNavigationProp<ProfileStackParamList, 'TareasBCrear'>;

/**
 * Preview "Tareas Variante B — Crear" (Ritmo): manual rápido.
 * Reusa `TareaBForm mode="create"`; la barra de acción fija va después del
 * `ScrollView` (sin `position: 'absolute'`), con un único botón primario.
 */
export default function TareasBCrearScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const navigation = useNavigation<TareasBCrearNav>();
  const f = flujoBCrearFixtures;

  const handlePrimary = useCallback(() => {
    console.log('[DesignLab] Activar y empezar');
    navigation.navigate('TareasBDetalle');
  }, [navigation]);

  const handleSecondary = useCallback(() => {
    console.log('[DesignLab] Guardar en cola');
    navigation.navigate('TareasBListado');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TareaBForm mode="create" />
      </ScrollView>

      {/* Barra de acción fija: <View> después del ScrollView, en el flujo. */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-sm'],
          backgroundColor: sereneColors['surface-container-low'],
        }}
      >
        <Pressable
          onPress={handlePrimary}
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          style={({ pressed }) => ({
            minHeight: s(48),
            paddingHorizontal: sereneSpacing['space-md'],
            paddingVertical: s(12),
            borderRadius: sereneBorderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
          >
            {f.primary}
          </RNText>
        </Pressable>

        <Pressable
          onPress={handleSecondary}
          accessibilityRole="button"
          accessibilityLabel={f.secondary}
          style={({ pressed }) => ({
            minHeight: s(44),
            paddingHorizontal: sereneSpacing['space-md'],
            paddingVertical: s(10),
            borderRadius: sereneBorderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: sereneColors['surface-container-high'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText
            style={[
              sereneTypography['label-md'] as TextStyle,
              { color: sereneColors['on-surface'], textAlign: 'center', flexShrink: 1 },
            ]}
          >
            {f.secondary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
