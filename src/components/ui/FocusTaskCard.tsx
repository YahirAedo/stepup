import React, { useState } from 'react';
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
import TaskProgressBar from './TaskProgressBar';
import type { ProgressBarResult } from '../../features/tasks/logic/getProgressBar';

export interface FocusTaskStep {
  done: boolean;
  current: boolean;
  title: string;
}

export interface FocusTaskCardProps {
  badge: string;
  minutesLabel?: string;
  title: string;
  stepTitle: string;
  primaryCta: string;
  toggleOpen: string;
  toggleClose: string;
  steps: ReadonlyArray<FocusTaskStep>;
  progress: ProgressBarResult;
  taskId?: number;
  onOpenTask?: (taskId: number) => void;
  dueLabel?: string;
  onResume?: () => void;
}

export default function FocusTaskCard({
  badge,
  minutesLabel,
  title,
  stepTitle,
  primaryCta,
  toggleOpen,
  toggleClose,
  steps,
  progress,
  taskId,
  onOpenTask,
  dueLabel,
  onResume,
}: FocusTaskCardProps) {
  const { scale: s } = useResponsive();
  const [stepsOpen, setStepsOpen] = useState(false);
  const hasSteps = steps.length > 0;

  return (
    <View
      style={{
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
        padding: sereneSpacing['space-md'],
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: s(6),
          backgroundColor: sereneColors['primary-container'],
          borderTopRightRadius: sereneBorderRadius.xl,
          borderBottomRightRadius: sereneBorderRadius.xl,
        }}
      />

      <View style={{ paddingLeft: s(4), gap: s(14) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: s(8),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(6),
              paddingHorizontal: s(10),
              paddingVertical: s(2),
              borderRadius: sereneBorderRadius.full,
              backgroundColor: withAlpha(sereneColors['secondary-container'], 0.7),
            }}
          >
            <View
              style={{
                width: s(6),
                height: s(6),
                borderRadius: sereneBorderRadius.full,
                backgroundColor: sereneColors['primary-container'],
              }}
            />
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                {
                  color: sereneColors['primary-container'],
                  textTransform: 'uppercase',
                  fontWeight: '600',
                },
              ]}
            >
              {badge}
            </RNText>
          </View>

          {minutesLabel ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
              <MaterialCommunityIcons
                name={mci('schedule')}
                size={s(15)}
                color={sereneColors['primary-container']}
              />
              <RNText
                style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {minutesLabel}
              </RNText>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={() => {
            if (taskId !== undefined && onOpenTask) {
              onOpenTask(taskId);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalles de ${title}`}
          style={({ pressed }) => ({
            gap: s(4),
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <RNText
            numberOfLines={2}
            style={[sereneTypography['headline-sm'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {title}
          </RNText>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
            <MaterialCommunityIcons
              name={mci('subdirectory_arrow_right')}
              size={s(16)}
              color={sereneColors['primary-container']}
            />
            <RNText
              numberOfLines={2}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], fontWeight: '500', flex: 1 },
              ]}
            >
              {stepTitle}
            </RNText>
          </View>

          {dueLabel !== undefined && dueLabel !== '' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
              <MaterialCommunityIcons
                name={mci('calendar_today')}
                size={s(15)}
                color={sereneColors['on-surface-variant']}
              />
              <RNText
                style={[
                  sereneTypography['label-sm'] as TextStyle,
                  { color: sereneColors['on-surface-variant'] },
                ]}
              >
                {dueLabel}
              </RNText>
            </View>
          )}
        </Pressable>

        <TaskProgressBar progress={progress} />

        <View style={{ gap: s(8) }}>
          <Pressable
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel={primaryCta}
            style={({ pressed }) => ({
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(8),
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['primary-container'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons name={mci('play_arrow')} size={s(18)} color={sereneColors['on-primary']} />
            <RNText
              style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}
            >
              {primaryCta}
            </RNText>
          </Pressable>

          <Pressable
            onPress={() => setStepsOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: stepsOpen }}
            style={({ pressed }) => ({
              minHeight: s(48),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: s(4),
              opacity: pressed ? 0.7 : 1,
              marginTop: s(2),
            })}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors['primary-container'], textDecorationLine: 'underline' },
              ]}
            >
              {stepsOpen ? toggleClose : toggleOpen}
            </RNText>
            <MaterialCommunityIcons
              name={stepsOpen ? mci('expand_less') : mci('arrow_forward')}
              size={s(14)}
              color={sereneColors['primary-container']}
            />
          </Pressable>

          {hasSteps && stepsOpen && (
            <View
              style={{
                padding: s(12),
                borderRadius: sereneBorderRadius.lg,
                backgroundColor: sereneColors['surface-container-low'],
                gap: s(8),
              }}
            >
              {steps.map((step, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: s(8) }}>
                  <View
                    style={{
                      width: s(16),
                      height: s(16),
                      borderRadius: sereneBorderRadius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: step.done
                        ? sereneColors['primary-container']
                        : step.current
                          ? sereneColors['secondary-container']
                          : sereneColors['surface-container-high'],
                    }}
                  >
                    {step.done ? (
                      <MaterialCommunityIcons
                        name={mci('check')}
                        size={s(12)}
                        color={sereneColors['on-primary']}
                      />
                    ) : (
                      <RNText
                        style={[
                          sereneTypography['label-sm'] as TextStyle,
                          {
                            color: step.current
                              ? sereneColors['primary-container']
                              : sereneColors['on-surface-variant'],
                            fontWeight: step.current ? '600' : '400',
                          },
                        ]}
                      >
                        {idx + 1}
                      </RNText>
                    )}
                  </View>
                  <RNText
                    numberOfLines={1}
                    style={[
                      sereneTypography['body-sm'] as TextStyle,
                      {
                        flex: 1,
                        color: step.done || !step.current ? sereneColors['on-surface-variant'] : sereneColors['on-surface'],
                        textDecorationLine: 'none',
                        opacity: step.current ? 1 : 0.6,
                        fontWeight: step.current ? '500' : '400',
                      },
                    ]}
                  >
                    {step.title}
                  </RNText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
