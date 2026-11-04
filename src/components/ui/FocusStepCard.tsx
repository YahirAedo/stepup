import React from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
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

export interface FocusStepCardProps {
  stepIndex: number;
  totalSteps: number;
  minutes: number | null;
  title: string;
  progress: ProgressBarResult;
  onStart: () => void;
  onPostpone?: () => void;
}

export default function FocusStepCard({
  stepIndex,
  totalSteps,
  minutes,
  title,
  progress,
  onStart,
  onPostpone,
}: FocusStepCardProps) {
  const { scale: s } = useResponsive();
  const stepLabel = `Paso ${stepIndex} de ${totalSteps}`;

  return (
    <View
      style={{
        backgroundColor: sereneColors['surface-container-lowest'],
        borderRadius: sereneBorderRadius.xl,
        padding: sereneSpacing['space-lg'],
        ...sereneShadows.card,
        position: 'relative',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: sereneBorderRadius.xl,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -s(28),
            right: -s(20),
            width: s(120),
            height: s(120),
            borderRadius: s(60),
            backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: s(6),
            right: -s(44),
            width: s(88),
            height: s(88),
            borderRadius: s(44),
            backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2),
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: sereneSpacing['space-sm'],
        }}
      >
        <RNText
          style={[
            sereneTypography['label-sm'] as TextStyle,
            {
              color: sereneColors.primary,
              backgroundColor: sereneColors['primary-fixed'],
              paddingHorizontal: s(10),
              paddingVertical: s(4),
              borderRadius: sereneBorderRadius.full,
              overflow: 'hidden',
            },
          ]}
        >
          {stepLabel}
        </RNText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: s(5),
            backgroundColor: sereneColors['surface-container-low'],
            paddingHorizontal: s(10),
            paddingVertical: s(4),
            borderRadius: sereneBorderRadius.full,
          }}
        >
          <MaterialCommunityIcons
            name={mci('timer')}
            size={s(14)}
            color={sereneColors.secondary}
          />
          <RNText
            style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors.secondary }]}
          >
            {formatStepMinutes(minutes)}
          </RNText>
        </View>
      </View>

      <View style={{ marginTop: sereneSpacing['space-md'] }}>
        <TaskProgressBar progress={progress} height={s(4)} />
      </View>

      <View
        style={{
          marginTop: sereneSpacing['space-md'],
          backgroundColor: sereneColors['surface-container-low'],
          borderRadius: sereneBorderRadius.xl,
          borderWidth: 1,
          borderColor: withAlpha(sereneColors['secondary-fixed'], 0.5),
          padding: sereneSpacing['space-md'],
        }}
      >
        <RNText
          numberOfLines={3}
          style={[
            sereneTypography['headline-lg-mobile'] as TextStyle,
            { color: sereneColors.primary, fontWeight: '600' },
          ]}
        >
          {title}
        </RNText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
          marginTop: sereneSpacing['space-lg'],
        }}
      >
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel={minutes !== null ? `Iniciar paso, ${minutes} minutos` : 'Iniciar paso'}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: s(48),
            height: s(64),
            borderRadius: sereneBorderRadius.full,
            backgroundColor: sereneColors['primary-container'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s(8),
            opacity: pressed ? 0.95 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('play_arrow')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText
            style={[
              sereneTypography['label-lg'] as TextStyle,
              { color: sereneColors['on-primary'], fontWeight: '600' },
            ]}
          >
            Iniciar paso
          </RNText>
        </Pressable>

        {onPostpone ? (
          <Pressable
            onPress={onPostpone}
            accessibilityRole="button"
            accessibilityLabel="Posponer paso"
            style={({ pressed }) => ({
              minWidth: s(48),
              minHeight: s(48),
              width: s(64),
              height: s(64),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-low'],
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={mci('hourglass_empty')}
              size={s(22)}
              color={sereneColors.secondary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
