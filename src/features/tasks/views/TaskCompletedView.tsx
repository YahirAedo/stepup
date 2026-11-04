import React from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  ActivityIndicator,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '../../../theme/serene';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import { taskCompletedCopy } from '../logic/taskCompletedCopy';
import { formatCompletedMeta } from '../logic/formatCompletedMeta';
import type { CompletedSummary } from '../logic/buildCompletedSummary';

export interface TaskCompletedViewProps {
  summary: CompletedSummary | null;
  loading: boolean;
  loadError: string | null;
  onPrimaryPress: () => void;
}

export default function TaskCompletedView({
  summary,
  loading,
  loadError,
  onPrimaryPress,
}: TaskCompletedViewProps) {
  const { scale: s } = useResponsive();

  const heroSize = s(84);
  const auraSize = s(120);
  const badgeSize = s(28);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors.surface,
        }}
      >
        <ActivityIndicator color={sereneColors.primary} />
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], marginTop: sereneSpacing['space-sm'] }]}
        >
          {taskCompletedCopy.loading}
        </RNText>
      </View>
    );
  }

  if (loadError || !summary) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          backgroundColor: sereneColors.surface,
          gap: sereneSpacing['space-md'],
        }}
      >
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}
        >
          {loadError ?? taskCompletedCopy.loadError}
        </RNText>
        <Pressable
          onPress={onPrimaryPress}
          accessibilityRole="button"
          accessibilityLabel={taskCompletedCopy.primary}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            paddingHorizontal: sereneSpacing['space-md'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {taskCompletedCopy.primary}
          </RNText>
        </Pressable>
      </View>
    );
  }

  const meta = formatCompletedMeta({ stepsLabel: summary.stepsLabel, totalMinutes: summary.totalMinutes });
  const recapLabel = `${taskCompletedCopy.recapLabel}. ${summary.taskName}. ${meta}`;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.gutter,
          paddingTop: sereneSpacing['space-lg'],
          paddingBottom: sereneSpacing['space-lg'],
          alignItems: 'center',
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero decorativo */}
        <View
          style={{
            width: heroSize,
            height: heroSize,
            marginTop: sereneSpacing['space-md'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessible={false}
          importantForAccessibility="no"
        >
          <View
            style={{
              position: 'absolute',
              width: auraSize,
              height: auraSize,
              borderRadius: auraSize / 2,
              backgroundColor: withAlpha(sereneColors['secondary-fixed'], 0.5),
            }}
            accessible={false}
            importantForAccessibility="no"
          />
          <View
            style={{
              width: heroSize,
              height: heroSize,
              borderRadius: heroSize / 2,
              backgroundColor: sereneColors['secondary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessible={false}
            importantForAccessibility="no"
          >
            <MaterialCommunityIcons
              name={mci('spa')}
              size={s(38)}
              color={sereneColors['on-secondary-container']}
              accessible={false}
              importantForAccessibility="no"
            />
          </View>
          <View
            style={{
              position: 'absolute',
              right: -s(2),
              bottom: s(2),
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: sereneColors['primary-container'],
              borderWidth: 2,
              borderColor: sereneColors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessible={false}
            importantForAccessibility="no"
          >
            <MaterialCommunityIcons
              name={mci('check')}
              size={s(16)}
              color={sereneColors['on-primary']}
              accessible={false}
              importantForAccessibility="no"
            />
          </View>
        </View>

        {/* Headline + subtitulo */}
        <View style={{ gap: sereneSpacing['space-sm'], alignItems: 'center' }}>
          <RNText
            accessibilityRole="header"
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              { color: sereneColors.primary, textAlign: 'center', maxWidth: s(300) },
            ]}
          >
            {taskCompletedCopy.headline}
          </RNText>
          <RNText
            style={[
              sereneTypography['body-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'], textAlign: 'center', maxWidth: s(280) },
            ]}
          >
            {taskCompletedCopy.subtitle}
          </RNText>
        </View>

        {/* Resumen del logro (un solo nodo accesible) */}
        <View
          accessible
          accessibilityLabel={recapLabel}
          style={{
            width: '100%',
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-md'],
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              width: s(40),
              height: s(40),
              borderRadius: s(20),
              backgroundColor: sereneColors['secondary-fixed'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessible={false}
            importantForAccessibility="no"
          >
            <MaterialCommunityIcons
              name={mci('task_alt')}
              size={s(20)}
              color={sereneColors['on-secondary-fixed']}
              accessible={false}
              importantForAccessibility="no"
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }} accessible={false}>
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textTransform: 'uppercase' },
              ]}
              accessible={false}
            >
              {taskCompletedCopy.recapLabel}
            </RNText>
            <RNText
              numberOfLines={2}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface'], fontWeight: '600', marginTop: s(2) },
              ]}
              accessible={false}
            >
              {summary.taskName}
            </RNText>
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], marginTop: s(2) },
              ]}
              accessible={false}
            >
              {meta}
            </RNText>
          </View>
        </View>

        {/* Microcopy */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: sereneSpacing['space-sm'],
            paddingHorizontal: sereneSpacing['space-md'],
          }}
        >
          <MaterialCommunityIcons
            name={mci('eco')}
            size={s(16)}
            color={sereneColors.primary}
            accessible={false}
            importantForAccessibility="no"
          />
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {taskCompletedCopy.microCopy}
          </RNText>
        </View>
      </ScrollView>

      {/* Pie fijo */}
      <View
        style={{
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          paddingBottom: sereneSpacing['space-lg'],
          borderTopWidth: 1,
          borderTopColor: withAlpha(sereneColors.outline, 0.2),
          backgroundColor: sereneColors.surface,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={taskCompletedCopy.primary}
          onPress={onPrimaryPress}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            ...sereneShadows.card,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('arrow_forward')} size={s(20)} color={sereneColors['on-primary']} accessible={false} importantForAccessibility="no" />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {taskCompletedCopy.primary}
          </RNText>
        </Pressable>
      </View>
    </View>
  );
}
