import React from 'react';
import { View, Text, TextInput, type TextInputProps, type TextStyle } from 'react-native';
import { colors, typography } from '../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function TextField({
  label,
  hint,
  style,
  leftIcon,
  rightElement,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={[
          typography['label-sm'],
          { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 },
        ]}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 2,
          borderBottomColor: `${colors['surface-variant']}80`,
        }}
      >
        {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={`${colors['surface-dim']}CC`}
          style={[
            {
              flex: 1,
              backgroundColor: 'transparent',
              fontSize: 24,
              fontFamily: 'Manrope_800ExtraBold',
              lineHeight: 30,
              color: colors['on-surface'],
              paddingVertical: 12,
            } as TextStyle,
            style,
          ]}
          {...inputProps}
        />
        {rightElement && <View style={{ marginLeft: 8 }}>{rightElement}</View>}
      </View>
      {hint && (
        <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
          {hint}
        </Text>
      )}
    </View>
  );
}
