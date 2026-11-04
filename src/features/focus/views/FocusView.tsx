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
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  useResponsive,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import { focusCopy } from '../logic/focusCopy';
import { buildFocusViewModel } from '../logic/buildFocusViewModel';
import { buildStepProgress } from '../logic/buildStepProgress';
import FocusStepCard from '../../../components/ui/FocusStepCard';
import FocusQueue from '../../../components/ui/FocusQueue';
import FocusTaskSwitcher from '../../../components/ui/FocusTaskSwitcher';

export interface FocusViewProps {
  status: 'loading' | 'ready' | 'empty' | 'error';
  viewModel: ReturnType<typeof buildFocusViewModel> | null;
  errorMessage: string | null;
  onRetry: () => void;
  onCreateTask: () => void;
  onOpenCompleted: () => void;
  onStart: () => void;
  onPostpone: () => void;
  onAddStep: () => void;
  onSelectTask: (taskId: number) => void;
}

export default function FocusView({
  status,
  viewModel,
  errorMessage,
  onRetry,
  onCreateTask,
  onOpenCompleted,
  onStart,
  onPostpone,
  onAddStep,
  onSelectTask,
}: FocusViewProps) {
  const { scale: s } = useResponsive();

  if (status === 'loading') {
    return (
      <View
        accessible
        accessibilityLabel={focusCopy.loading}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sereneColors.surface,
        }}
      >
        <ActivityIndicator
          color={sereneColors.primary}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
        <RNText
          style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'], marginTop: sereneSpacing['space-sm'] }]}
        >
          {focusCopy.loading}
        </RNText>
      </View>
    );
  }

  if (status === 'error') {
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
          {errorMessage ?? focusCopy.loadError}
        </RNText>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={focusCopy.retry}
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
            {focusCopy.retry}
          </RNText>
        </Pressable>
      </View>
    );
  }

  if (status === 'empty' || !viewModel) {
    return (
      <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: sereneSpacing.margin,
            paddingBottom: sereneSpacing['space-lg'],
            gap: sereneSpacing['space-lg'],
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: sereneColors['surface-container-lowest'],
              borderRadius: sereneBorderRadius.xl,
              padding: sereneSpacing['space-lg'],
              gap: sereneSpacing['space-sm'],
              ...sereneShadows.card,
            }}
          >
            <RNText style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors.primary }]}>
              {focusCopy.empty.headline}
            </RNText>
            <RNText style={[sereneTypography['body-md'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>
              {focusCopy.empty.body}
            </RNText>

            <View style={{ width: '100%', gap: sereneSpacing['space-sm'], marginTop: sereneSpacing['space-xs'] }}>
              <Pressable
                onPress={onCreateTask}
                accessibilityRole="button"
                accessibilityLabel={focusCopy.empty.primaryCta}
                style={({ pressed }) => ({
                  minHeight: s(48),
                  width: '100%',
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['primary-container'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: s(8),
                  opacity: pressed ? 0.95 : 1,
                })}
              >
                <MaterialCommunityIcons name={mci('add')} size={s(19)} color={sereneColors['on-primary']} />
                <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
                  {focusCopy.empty.primaryCta}
                </RNText>
              </Pressable>

              <Pressable
                onPress={onOpenCompleted}
                accessibilityRole="button"
                accessibilityLabel={focusCopy.empty.secondaryCta}
                style={({ pressed }) => ({
                  minHeight: s(48),
                  width: '100%',
                  borderRadius: sereneBorderRadius.lg,
                  backgroundColor: sereneColors['secondary-container'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: s(8),
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <MaterialCommunityIcons name={mci('history_edu')} size={s(19)} color={sereneColors['on-secondary-container']} />
                <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-secondary-container'] }]}>
                  {focusCopy.empty.secondaryCta}
                </RNText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const step = viewModel.step;
  const switcher = viewModel.switcher;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {switcher.show ? (
          <FocusTaskSwitcher
            active={switcher.active!}
            alternatives={switcher.alternatives}
            pendingCount={switcher.pendingCount}
            onSelect={onSelectTask}
          />
        ) : null}

        <FocusStepCard
          stepIndex={step.stepIndex}
          totalSteps={step.totalSteps}
          minutes={step.minutes}
          title={step.title}
          progress={buildStepProgress(step.stepIndex, step.totalSteps)}
          onStart={onStart}
          onPostpone={viewModel.canPostpone ? onPostpone : undefined}
        />

        <FocusQueue items={viewModel.queue} onAdd={onAddStep} />
      </ScrollView>
    </View>
  );
}
