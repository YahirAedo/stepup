import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { colors, typography } from '../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export default function TextField({ label, hint, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[typography['label-sm'] , { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 }]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={`${colors['surface-dim']}CC`}
        style={[
          {
            backgroundColor: 'transparent',
            borderBottomWidth: 2,
            borderBottomColor: `${colors['surface-variant']}80`,
            fontSize: 24,
            fontFamily: 'Manrope_800ExtraBold',
            lineHeight: 30,
            color: colors['on-surface'],
            paddingBottom: 12,
            outlineStyle: 'none',
          } as any,
          style,
        ]}
        {...inputProps}
      />
      {hint && (
        <Text style={[typography['label-md'] , { color: colors['on-surface-variant'] }]}>
          {hint}
        </Text>
      )}
    </View>
  );
}
