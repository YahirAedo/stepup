import React from 'react';
import {
  View,
  ScrollView,
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
  useResponsive,
} from '../../theme/serene';
import { mci } from '../designlab/mciIconMap';
import { focusCopy } from '../../features/focus/logic/focusCopy';
import { buildStepCompletedView } from '../../features/focus/logic/buildStepCompletedView';

export interface FocusStepCompleteViewProps {
  stepTitle: string;
  minutes: number | null;
  nextStep: { name: string; minutes: number | null } | null;
  onContinue: () => void;
  onGoTasks: () => void;
}

export default function FocusStepCompleteView({
  stepTitle,
  minutes,
  nextStep,
  onContinue,
  onGoTasks,
}: FocusStepCompleteViewProps) {
  const { scale: s } = useResponsive();
  const data = buildStepCompletedView({ minutes, nextStep });

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
        <View
          style={{
            width: '100%',
            backgroundColor: sereneColors['surface-container-lowest'],
            borderRadius: sereneBorderRadius.xl,
            padding: sereneSpacing['space-lg'],
            alignItems: 'center',
            gap: sereneSpacing['space-md'],
            ...sereneShadows.card,
          }}
        >
          <View
            style={{
              width: s(72),
              height: s(72),
              borderRadius: s(36),
              backgroundColor: sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
            pointerEvents="none"
            importantForAccessibility="no"
          >
            <MaterialCommunityIcons
              name={mci('done')}
              size={s(36)}
              color={sereneColors['on-primary']}
              pointerEvents="none"
              importantForAccessibility="no"
            />
          </View>

          <RNText
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              { color: sereneColors['on-surface'], textAlign: 'center' },
            ]}
          >
            {focusCopy.completed.headline}
          </RNText>

          {data.durationLabel !== null ? (
            <RNText
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface-variant'], textAlign: 'center' },
              ]}
            >
              {`+${data.durationLabel}`}
            </RNText>
          ) : null}

          <View
            style={{
              width: '100%',
              backgroundColor: sereneColors['surface-container-low'],
              borderRadius: sereneBorderRadius.lg,
              padding: sereneSpacing['space-md'],
              gap: sereneSpacing['space-xs'],
            }}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors.secondary },
              ]}
            >
              {focusCopy.completed.recapLabel}
            </RNText>
            <RNText
              numberOfLines={3}
              ellipsizeMode="tail"
              style={[
                sereneTypography['title-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {stepTitle}
            </RNText>
          </View>
        </View>

        {data.nextStepName !== null ? (
          <View
            style={{
              width: '100%',
              backgroundColor: sereneColors['surface-container-low'],
              borderRadius: sereneBorderRadius.lg,
              padding: sereneSpacing['space-md'],
              gap: sereneSpacing['space-xs'],
            }}
          >
            <RNText
              style={[
                sereneTypography['label-sm'] as TextStyle,
                { color: sereneColors.secondary },
              ]}
            >
              {focusCopy.completed.nextLabel}
            </RNText>
            <RNText
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[
                sereneTypography['body-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {data.nextStepName}
            </RNText>
            {data.nextStepMinutesLabel !== null ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: sereneColors['surface-container-high'],
                  borderRadius: sereneBorderRadius.full,
                  paddingVertical: s(4),
                  paddingHorizontal: s(10),
                }}
              >
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors.secondary },
                  ]}
                >
                  {data.nextStepMinutesLabel}
                </RNText>
              </View>
            ) : null}
          </View>
        ) : null}

        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel={focusCopy.completed.continueCta}
          style={({ pressed }) => ({
            width: '100%',
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
          <MaterialCommunityIcons name={mci('play_arrow')} size={s(20)} color={sereneColors['on-primary']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-primary'] }]}>
            {focusCopy.completed.continueCta}
          </RNText>
        </Pressable>

        <Pressable
          onPress={onGoTasks}
          accessibilityRole="button"
          accessibilityLabel={focusCopy.completed.goTasksCta}
          style={({ pressed }) => ({
            width: '100%',
            minHeight: s(48),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-high'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('arrow_forward')} size={s(20)} color={sereneColors['on-surface']} />
          <RNText style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors['on-surface'] }]}>
            {focusCopy.completed.goTasksCta}
          </RNText>
        </Pressable>
      </ScrollView>
    </View>
  );
}
