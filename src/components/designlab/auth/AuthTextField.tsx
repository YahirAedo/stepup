import React, { useState } from 'react';
import {
  Pressable,
  TextInput,
  Text as RNText,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mci, type MciSymbolKey } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';

export interface AuthPasswordToggle {
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}

export interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  symbol: MciSymbolKey;
  placeholder?: string;
  /** Borde y fondo en `error`. */
  error?: boolean;
  /** Campo atenuado y no editable (estado cargando). */
  disabled?: boolean;
  /** Solo en contraseña: agrega el ojo de mostrar/ocultar. */
  passwordToggle?: AuthPasswordToggle;
  helper?: string;
  helperError?: boolean;
  /** Props extra del `TextInput` (teclado, autocompletado, returnKeyType). */
  inputProps?: TextInputProps;
}

/**
 * Campo de texto compartido por Login y Registro (Design Lab).
 *
 * Etiqueta arriba, fondo blanco, borde de 1 px `outline-variant`, radio `lg` y
 * alto 48. Foco con borde `primary`; error con borde `error` y fondo
 * `error-container` al 20%. El placeholder usa `on-surface-variant` porque
 * `outline` sobre blanco queda en 4,49:1 y no llega a AA.
 */
export default function AuthTextField({
  label,
  value,
  onChangeText,
  symbol,
  placeholder,
  error = false,
  disabled = false,
  passwordToggle,
  helper,
  helperError = false,
  inputProps,
}: AuthTextFieldProps) {
  const { scale: s } = useResponsive();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? sereneColors.error
    : focused
      ? sereneColors.primary
      : sereneColors['outline-variant'];
  const iconColor = error
    ? sereneColors.error
    : disabled
      ? sereneColors['on-surface-variant']
      : sereneColors.outline;

  return (
    <View style={{ gap: sereneSpacing['space-xs'] }}>
      <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
        {label}
      </RNText>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: s(48),
          borderRadius: sereneBorderRadius.lg,
          borderWidth: 1,
          borderColor,
          paddingLeft: sereneSpacing['space-md'],
          paddingRight: passwordToggle ? 0 : sereneSpacing['space-md'],
          backgroundColor: error
            ? withAlpha(sereneColors['error-container'], 0.2)
            : disabled
              ? sereneColors['surface-container']
              : sereneColors['surface-container-lowest'],
        }}
      >
        <MaterialCommunityIcons name={mci(symbol)} size={s(20)} color={iconColor} />

        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          secureTextEntry={passwordToggle ? !passwordToggle.visible : false}
          placeholder={placeholder}
          placeholderTextColor={sereneColors['on-surface-variant']}
          accessibilityLabel={label}
          style={[
            sereneTypography['body-md'] as TextStyle,
            {
              flex: 1,
              minWidth: 0,
              paddingHorizontal: sereneSpacing['space-sm'],
              paddingVertical: 0,
              color: disabled ? sereneColors['on-surface-variant'] : sereneColors['on-surface'],
            },
          ]}
        />

        {passwordToggle ? (
          <Pressable
            onPress={passwordToggle.onToggle}
            accessibilityRole="button"
            accessibilityLabel={passwordToggle.visible ? passwordToggle.hideLabel : passwordToggle.showLabel}
            style={{ minWidth: s(48), minHeight: s(48), alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons
              name={mci(passwordToggle.visible ? 'visibility_off' : 'visibility')}
              size={s(20)}
              color={iconColor}
            />
          </Pressable>
        ) : null}
      </View>

      {helper ? (
        <RNText
          accessibilityRole={helperError ? 'alert' : undefined}
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: helperError ? sereneColors.error : sereneColors['on-surface-variant'] },
          ]}
        >
          {helper}
        </RNText>
      ) : null}
    </View>
  );
}
