import React, { useEffect, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, TextInput, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';

export interface QuickStepPromptProps {
  visible: boolean;
  heading: string;
  placeholder: string;
  /** Label del CTA, ej. "Comenzar 3 min". */
  ctaLabel: string;
  /** Label durante el arranque, ej. "Preparando...". */
  loadingLabel: string;
  onClose: () => void;
  onStart: (title: string) => void;
}

const START_DELAY = 600;

/**
 * Drawer "Paso exprés (3 min)" (estado vacío del flujo Focus).
 * Dispara `onStart` tras un breve estado "Preparando..." como en el mockup.
 * Design Lab — no es la pantalla final.
 */
export default function QuickStepPrompt({
  visible,
  heading,
  placeholder,
  ctaLabel,
  loadingLabel,
  onClose,
  onStart,
}: QuickStepPromptProps) {
  const { scale: s } = useResponsive();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setValue('');
      setLoading(false);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!visible) return null;

  const canStart = value.trim() !== '' && !loading;

  const handleStart = () => {
    if (!canStart) return;
    const title = value.trim();
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setValue('');
      onStart(title);
    }, START_DELAY);
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-md'],
        ...sereneShadows.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: sereneSpacing['space-sm'],
        }}
      >
        <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {heading}
        </RNText>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          hitSlop={s(8)}
          style={({ pressed }) => ({
            width: s(28),
            height: s(28),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="close" size={s(18)} color={sereneColors['on-surface-variant']} />
        </Pressable>
      </View>

      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={sereneColors['on-surface-variant']}
        maxLength={140}
        editable={!loading}
        style={[
          sereneTypography['body-md'] as TextStyle,
          {
            height: s(44),
            paddingHorizontal: s(12),
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-low'],
            color: sereneColors['on-surface'],
          },
        ]}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={handleStart}
          disabled={!canStart}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={({ pressed }) => ({
            height: s(36),
            paddingHorizontal: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['primary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(6),
            opacity: canStart ? (pressed ? 0.9 : 1) : 0.4,
          })}
        >
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {loading ? loadingLabel : ctaLabel}
          </RNText>
          <MaterialCommunityIcons
            name={loading ? 'progress-clock' : 'play'}
            size={s(16)}
            color={sereneColors['on-primary']}
          />
        </Pressable>
      </View>
    </View>
  );
}
