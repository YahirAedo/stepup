import React, { useEffect, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  TextInput,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../theme/serene';

export interface AddMicroStepInlineProps {
  visible: boolean;
  suggestedMinutes: number;
  maxMinutes: number;
  heading: string;
  placeholder: string;
  onClose: () => void;
  onSave: (title: string) => void;
}

export default function AddMicroStepInline({
  visible,
  suggestedMinutes,
  heading,
  placeholder,
  onClose,
  onSave,
}: AddMicroStepInlineProps) {
  const { scale: s } = useResponsive();
  const [value, setValue] = useState('');
  const canSave = value.trim() !== '';

  useEffect(() => {
    if (!visible) setValue('');
  }, [visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (!canSave) return;
    onSave(value.trim());
    setValue('');
  };

  return (
    <View
      style={{
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-md'],
        ...sereneShadows.card,
      }}
    >
      {/* Heading + cerrar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: sereneSpacing['space-sm'],
        }}
      >
        <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface'], fontWeight: '600' }]}>
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
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-low'],
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <MaterialCommunityIcons name="close" size={s(16)} color={sereneColors['on-surface-variant']} />
        </Pressable>
      </View>

      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={sereneColors['on-surface-variant']}
        multiline
        maxLength={140}
        style={[
          sereneTypography['body-md'] as TextStyle,
          {
            backgroundColor: sereneColors['surface-container-high'],
            borderRadius: sereneBorderRadius.lg,
            padding: sereneSpacing['space-md'],
            color: sereneColors['on-surface'],
            minHeight: s(52),
            maxHeight: s(84),
            textAlignVertical: 'top',
          },
        ]}
      />

      {/* Hint + Guardar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: sereneSpacing['space-sm'],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(5) }}>
          <MaterialCommunityIcons name="timer-outline" size={s(14)} color={sereneColors['on-surface-variant']} />
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
            {`${suggestedMinutes} min sugeridos`}
          </RNText>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityLabel="Guardar paso"
          style={({ pressed }) => ({
            paddingHorizontal: sereneSpacing['space-lg'],
            paddingVertical: s(8),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['primary-container'],
            opacity: canSave ? (pressed ? 0.9 : 1) : 0.4,
          })}
        >
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-primary'], textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
            ]}
          >
            Guardar
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
