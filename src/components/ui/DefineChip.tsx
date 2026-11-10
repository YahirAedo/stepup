import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { mci } from '../designlab/mciIconMap';

export default function DefineChip() {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6),
        minHeight: s(48),
        paddingHorizontal: sereneSpacing['space-sm'],
        paddingVertical: sereneSpacing['space-xs'],
        borderRadius: sereneBorderRadius.lg,
        backgroundColor: sereneColors['surface-container-high'],
      }}
    >
      <MaterialCommunityIcons name={mci('add_task')} size={s(16)} color={sereneColors['on-surface-variant']} />
      <RNText
        style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
      >
        Definir
      </RNText>
    </View>
  );
}
