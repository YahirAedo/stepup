import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  Vibration,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import { mci } from '../designlab/mciIconMap';
import { focusCopy } from '../../features/focus/logic/focusCopy';
import FocusCountdownRing from './FocusCountdownRing';
import FocusTimerExpiredOverlay from './FocusTimerExpiredOverlay';

export interface FocusRunningViewProps {
  taskName: string;
  stepTitle: string;
  stepIndex: number;
  totalSteps: number;
  timer: { display: string; seconds: number; totalSeconds: number; started: boolean; running: boolean; finished: boolean };
  completing: boolean;
  onToggle: () => void;
  onExtend: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function FocusRunningView({
  taskName,
  stepTitle,
  stepIndex,
  totalSteps,
  timer,
  completing,
  onToggle,
  onExtend,
  onComplete,
  onBack,
}: FocusRunningViewProps) {
  const { scale: s } = useResponsive();
  const finishedRef = useRef(false);

  useEffect(() => {
    if (timer.finished && !finishedRef.current) {
      Vibration.vibrate(500);
      finishedRef.current = true;
    }
    if (!timer.finished) {
      finishedRef.current = false;
    }
  }, [timer.finished]);

  const running = focusCopy.running;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-lg'],
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <RNText
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'], textAlign: 'center' }]}
        >
          {taskName}
        </RNText>

        <RNText
          style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.secondary, textAlign: 'center' }]}
        >
          {`Paso ${stepIndex} de ${totalSteps}`}
        </RNText>

        <RNText
          style={[
            sereneTypography['headline-lg-mobile'] as TextStyle,
            { color: sereneColors['on-surface'], textAlign: 'center', maxWidth: s(280) },
          ]}
        >
          {stepTitle}
        </RNText>

        <FocusCountdownRing
          display={timer.display}
          seconds={timer.seconds}
          totalSeconds={timer.totalSeconds}
          paused={!timer.running && !timer.finished}
        />

        <View
          style={{
            flexDirection: 'row',
            gap: sereneSpacing['space-sm'],
            width: '100%',
          }}
        >
          <Pressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={timer.running ? running.pause : running.resume}
            accessibilityState={{ selected: timer.running }}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sereneSpacing['space-sm'],
              paddingVertical: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['primary-container'],
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={mci(timer.running ? 'pause_circle' : 'play_arrow')}
              size={s(20)}
              color={sereneColors['on-primary']}
            />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
              {timer.running ? running.pause : running.resume}
            </RNText>
          </Pressable>

          <Pressable
            onPress={onExtend}
            accessibilityRole="button"
            accessibilityLabel={running.extend}
            disabled={timer.finished}
            accessibilityState={{ disabled: timer.finished }}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sereneSpacing['space-sm'],
              paddingVertical: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['surface-container-high'],
              opacity: pressed || timer.finished ? 0.9 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('timer')} size={s(20)} color={sereneColors.primary} />
            <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors.primary }]}>
              {running.extend}
            </RNText>
          </Pressable>
        </View>

        <Pressable
          onPress={onComplete}
          accessibilityRole="button"
          accessibilityLabel={running.markDone}
          disabled={completing}
          accessibilityState={{ disabled: completing, busy: completing }}
          style={({ pressed }) => ({
            width: '100%',
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors.primary,
            opacity: pressed || completing ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('done')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {running.markDone}
          </RNText>
        </Pressable>

        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={running.back}
          disabled={completing}
          accessibilityState={{ disabled: completing }}
          style={({ pressed }) => ({
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            opacity: pressed || completing ? 0.6 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('arrow_back')} size={s(20)} color={sereneColors.secondary} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors.secondary }]}>
            {running.back}
          </RNText>
        </Pressable>
      </ScrollView>

      <FocusTimerExpiredOverlay
        visible={timer.finished}
        headline={focusCopy.running.expired.headline}
        subtitle={focusCopy.running.expired.subtitle}
        primaryCta={focusCopy.running.expired.primaryCta}
        secondaryCta={focusCopy.running.expired.secondaryCta}
        onMarkDone={onComplete}
        onExtend={onExtend}
        disabled={completing}
      />
    </View>
  );
}
