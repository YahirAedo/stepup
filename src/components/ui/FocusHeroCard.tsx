import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  sereneShadows,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import { mci } from '../designlab/mciIconMap';
import { formatStepMinutes } from '../../features/focus/logic/formatStepMinutes';
import TaskProgressBar from './TaskProgressBar';
import type { ProgressBarResult } from '../../features/tasks/logic/getProgressBar';

export interface FocusHeroCardProps {
  taskName: string;
  stepIndex: number;
  totalSteps: number;
  minutes: number | null;
  title: string;
  progress: ProgressBarResult;
  onStart: () => void;
  onPostpone?: () => void;
}

export default function FocusHeroCard({
  taskName,
  stepIndex,
  totalSteps,
  minutes,
  title,
  progress,
  onStart,
  onPostpone,
}: FocusHeroCardProps) {
  const { scale: s } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: sereneColors['primary-container'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        ...sereneShadows.card,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        <View
          style={{
            position: 'absolute',
            top: -s(120),
            left: '50%',
            marginLeft: -s(120),
            width: s(240),
            height: s(240),
            borderRadius: s(120),
            backgroundColor: withAlpha(sereneColors['on-primary'], 0.06),
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sereneSpacing['space-sm'] }}>
        <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}>
          {`Paso ${stepIndex} de ${totalSteps}`}
        </RNText>
        <View style={{ width: s(88) }}>
          <TaskProgressBar progress={progress} height={s(4)} tone="onDark" />
        </View>
      </View>

      <View style={{ paddingVertical: sereneSpacing['space-lg'], alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
        <RNText
          numberOfLines={2}
          ellipsizeMode="tail"
          accessibilityRole="header"
          style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-primary'], textAlign: 'center' }]}
        >
          {taskName}
        </RNText>
        <RNText
          numberOfLines={3}
          ellipsizeMode="tail"
          style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-primary'], textAlign: 'center' }]}
        >
          {title}
        </RNText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(5),
            backgroundColor: sereneColors['on-secondary-container'],
            paddingHorizontal: s(10),
            paddingVertical: s(4),
            borderRadius: sereneBorderRadius.full,
          }}
        >
          <MaterialCommunityIcons name={mci('timer')} size={s(14)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {formatStepMinutes(minutes)}
          </RNText>
        </View>
      </View>

      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={minutes !== null ? `Iniciar paso, ${minutes} minutos` : 'Iniciar paso'}
        style={({ pressed }) => ({
          width: '100%',
          minHeight: s(48),
          height: s(64),
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['on-primary'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s(8),
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <MaterialCommunityIcons name={mci('play_arrow')} size={s(20)} color={sereneColors.primary} />
        <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors.primary, fontWeight: '600' }]}>
          Iniciar paso
        </RNText>
      </Pressable>

      {onPostpone ? (
        <Pressable
          onPress={onPostpone}
          accessibilityRole="button"
          accessibilityLabel="Posponer paso"
          style={({ pressed }) => ({
            width: '100%',
            minHeight: s(48),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['on-secondary-container'],
            borderWidth: 1,
            borderColor: withAlpha(sereneColors['on-primary'], 0.4),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            opacity: pressed ? 0.85 : 1,
            marginTop: sereneSpacing['space-sm'],
          })}
        >
          <MaterialCommunityIcons name="send-clock" size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            Posponer
          </RNText>
        </Pressable>
      ) : null}
    </View>
  );
}