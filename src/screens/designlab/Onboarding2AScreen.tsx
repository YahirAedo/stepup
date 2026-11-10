// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import OnboardingProgress from '../../components/designlab/OnboardingProgress';
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
import { onboardingASolucionFixtures } from './onboardingAFixtures';

/**
 * Los mockups de onboarding piden 16px en las listas; Serene no tiene token en
 * 16 (body-lg = 18, body-md = 15), así que se parte de body-lg y se ajusta.
 */
const listText = {
  ...sereneTypography['body-lg'],
  fontSize: 16,
  lineHeight: 24,
} as TextStyle;

/**
 * Onboarding 2 — "La solución".
 *
 * Tres pasos del método (dividir, enfocar, marcar) y el aviso de dónde viven
 * las tareas. El CTA cierra el onboarding.
 */
export default function Onboarding2AScreen() {
  const navigation = useNavigation();
  const { insets } = useBottomLayout();
  const { scale: s } = useResponsive();
  const f = onboardingASolucionFixtures;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader title={f.headerTitle} showAvatar={false} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-md'],
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-md'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress step={2} label={f.progressLabel} />

        <RNText style={[sereneTypography['headline-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {f.headline}
        </RNText>

        {f.points.map((point) => (
          <View
            key={point.text}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: sereneSpacing['space-md'],
              padding: sereneSpacing['space-md'],
              borderRadius: sereneBorderRadius.xl,
              backgroundColor: sereneColors['surface-container-lowest'],
              ...sereneShadows.card,
            }}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{
                width: s(40),
                height: s(40),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-low'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name={mci(point.icon)} size={s(20)} color={sereneColors.primary} />
            </View>
            <RNText style={[listText, { color: sereneColors['on-surface'], flex: 1, minWidth: 0 }]}>
              {point.text}
            </RNText>
          </View>
        ))}
      </ScrollView>

      {/* Pie: aviso de datos locales + CTA */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: insets.bottom + sereneSpacing['space-md'],
          gap: sereneSpacing['space-md'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-surface-variant'], textAlign: 'center' },
          ]}
        >
          {f.footnote}
        </RNText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.primary}
          // REQUIERE MIGRACIÓN: hoy el flujo real va a NotificationPermission;
          // el permiso se pide al activar el recordatorio, así que debe navegar directo a Login.
          onPress={() => navigation.navigate('LoginA' as never)}
          style={({ pressed }) => ({
            minHeight: s(48),
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.xl,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {f.primary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
