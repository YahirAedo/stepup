import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
} from '../../theme/serene';

export interface FocusTaskHeaderProps {
  taskName: string;
  stepIndex: number;
  totalSteps: number;
  align?: 'left' | 'center';
}

export default function FocusTaskHeader({
  taskName,
  stepIndex,
  totalSteps,
  align = 'left',
}: FocusTaskHeaderProps) {
  const textAlign = align === 'center' ? 'center' : 'left';

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${taskName}. Paso ${stepIndex} de ${totalSteps}`}
      style={{ width: '100%' }}
    >
      <RNText
        numberOfLines={2}
        ellipsizeMode="tail"
        style={[
          sereneTypography['headline-sm'] as TextStyle,
          { color: sereneColors['on-surface'], textAlign },
        ]}
      >
        {taskName}
      </RNText>
      <RNText
        style={[
          sereneTypography['label-md'] as TextStyle,
          {
            color: sereneColors.secondary,
            textAlign,
            marginTop: sereneSpacing['space-xs'],
          },
        ]}
      >
        {`Paso ${stepIndex} de ${totalSteps}`}
      </RNText>
    </View>
  );
}