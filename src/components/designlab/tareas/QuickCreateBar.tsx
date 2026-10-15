// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React from 'react';
import { View, Text as RNText, Pressable, TextInput, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../../theme/layout';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';

export interface QuickCreateBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ctaLabel: string;
  onSubmit: () => void;
}

/**
 * Barra de creación rápida del Listado (Variante B): input de una línea +
 * el único CTA principal de la pantalla. Va como `<View>` DESPUÉS del
 * `ScrollView` (en el flujo, nunca `position: 'absolute'`).
 *
 * El padding inferior usa `contentPaddingBottom` para que el input y el botón
 * queden sobre la zona del GlassTabBar flotante cuando el shell la muestra.
 */
export default function QuickCreateBar({
  value,
  onChange,
  placeholder,
  ctaLabel,
  onSubmit,
}: QuickCreateBarProps) {
  const { scale: s } = useResponsive();
  const { contentPaddingBottom } = useBottomLayout();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: sereneSpacing['space-sm'],
        paddingHorizontal: sereneSpacing.margin,
        paddingTop: sereneSpacing['space-sm'],
        paddingBottom: contentPaddingBottom,
        backgroundColor: sereneColors.surface,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={sereneColors['on-surface-variant']}
        numberOfLines={1}
        maxLength={80}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        accessibilityLabel={placeholder}
        style={[
          sereneTypography['body-md'] as TextStyle,
          {
            flex: 1,
            minWidth: 0,
            minHeight: s(44),
            paddingHorizontal: sereneSpacing['space-md'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-high'],
            color: sereneColors['on-surface'],
          },
        ]}
      />

      <Pressable
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        style={({ pressed }) => ({
          minHeight: s(44),
          flexDirection: 'row',
          alignItems: 'center',
          gap: s(6),
          paddingHorizontal: sereneSpacing['space-md'],
          paddingVertical: sereneSpacing['space-sm'],
          borderRadius: sereneBorderRadius.lg,
          backgroundColor: sereneColors.primary,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <MaterialCommunityIcons name={mci('add')} size={s(18)} color={sereneColors['on-primary']} />
        <RNText
          style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
        >
          {ctaLabel}
        </RNText>
      </Pressable>
    </View>
  );
}
