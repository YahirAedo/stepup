import React from 'react';
import { View, Text as RNText, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  useResponsive,
} from '../../theme/serene';
import { focusCopy } from '../../features/focus/logic/focusCopy';
import type { FocusEmptyState } from '../../features/focus/logic/buildFocusEmptyState';
import ActionButton from './ActionButton';

export interface FocusEmptyViewProps {
  emptyState: FocusEmptyState;
  onPrimary: () => void;
  onSecondary?: () => void;
}

const iconFor = (state: FocusEmptyState): string => {
  switch (state.kind) {
    case 'no-tasks':
      return 'clipboard-text-outline';
    case 'needs-steps':
      return 'format-list-checks';
    case 'all-done':
      return 'check-circle-outline';
  }
};

const copyFor = (state: FocusEmptyState) => {
  switch (state.kind) {
    case 'no-tasks':
      return focusCopy.empty['no-tasks'];
    case 'needs-steps':
      return state.taskIds.length === 1
        ? focusCopy.empty['needs-steps'].one
        : focusCopy.empty['needs-steps'].many;
    case 'all-done':
      return focusCopy.empty['all-done'];
  }
};

export default function FocusEmptyView({ emptyState, onPrimary, onSecondary }: FocusEmptyViewProps) {
  const { scale: s } = useResponsive();
  const copy = copyFor(emptyState) as {
    headline: string;
    body: string;
    primaryCta: string;
    secondaryCta?: string;
  };
  const iconName = iconFor(emptyState);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sereneSpacing.margin,
        paddingBottom: sereneSpacing['space-lg'],
        backgroundColor: sereneColors.surface,
        gap: sereneSpacing['space-lg'],
      }}
    >
      <MaterialCommunityIcons
        name={iconName as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={s(72)}
        color={sereneColors['on-surface-variant']}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      <View style={{ width: '100%', maxWidth: s(360), alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <RNText
          accessibilityRole="header"
          style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors.primary, textAlign: 'center' }]}
        >
          {copy.headline}
        </RNText>
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}
        >
          {copy.body}
        </RNText>
      </View>

      <View style={{ width: '100%', maxWidth: s(360), gap: sereneSpacing['space-sm'] }}>
        <ActionButton variant="primary" label={copy.primaryCta} onPress={onPrimary} />

        {copy.secondaryCta && onSecondary ? (
          <ActionButton variant="secondary" label={copy.secondaryCta} onPress={onSecondary} />
        ) : null}
      </View>
    </View>
  );
}