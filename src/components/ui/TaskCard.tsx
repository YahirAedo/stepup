import React from 'react';
import { View, Text as RNText, Pressable, type TextStyle } from 'react-native';
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
import TaskProgressBar from './TaskProgressBar';
import DefineChip from './DefineChip';
import type { TaskListItem } from '../../features/tasks/logic/buildTasksListModel';
import { formatDateShort } from '../../features/tasks/logic/formatDateShort';
import { getTaskCardAccessibilityLabel } from '../../features/tasks/logic/getTaskCardAccessibilityLabel';

export interface TaskCardProps {
  item: TaskListItem;
  onPress?: (taskId: number) => void;
}

export default function TaskCard({ item, onPress }: TaskCardProps) {
  const { scale: s } = useResponsive();
  const isCompleted = item.category === 'completed';
  const hasSteps = item.stepCount > 0;

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      accessibilityRole="button"
      accessibilityLabel={getTaskCardAccessibilityLabel(item, isCompleted)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: sereneSpacing['space-md'],
        padding: s(14),
        borderRadius: sereneBorderRadius.xl,
        backgroundColor: isCompleted
          ? sereneColors['secondary-container']
          : sereneColors['surface-container-lowest'],
        ...sereneShadows.card,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: sereneSpacing['space-sm'], flex: 1, minWidth: 0 }}>
        {isCompleted ? (
          <View
            style={{
              width: s(28),
              height: s(28),
              borderRadius: s(14),
              backgroundColor: sereneColors['primary-container'],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={mci('check')} size={s(14)} color={sereneColors['on-primary']} />
          </View>
        ) : null}

        <View style={{ minWidth: 0, gap: s(4), flex: 1 }}>
          <RNText
            numberOfLines={1}
            style={[
              sereneTypography['label-lg'] as TextStyle,
              {
                color: isCompleted ? sereneColors['on-surface-variant'] : sereneColors['on-surface'],
                textDecorationLine: 'none',
              },
            ]}
          >
            {item.name}
          </RNText>

          {hasSteps ? (
            <View style={{ marginTop: s(4) }}>
              <TaskProgressBar progress={item.progress} />
            </View>
          ) : (
            <DefineChip />
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6), marginTop: s(4) }}>
            {isCompleted && item.completedAt ? (
              <>
                <MaterialCommunityIcons
                  name={mci('calendar_today')}
                  size={s(14)}
                  color={sereneColors['on-surface-variant']}
                />
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {formatDateShort(item.completedAt) ?? item.completedAt.split('T')[0]}
                </RNText>
              </>
            ) : item.targetDate ? (
              <>
                <MaterialCommunityIcons
                  name={mci('calendar_today')}
                  size={s(14)}
                  color={sereneColors['on-surface-variant']}
                />
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {formatDateShort(item.targetDate) ?? item.targetDate.split('T')[0]}
                </RNText>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name={mci('calendar_today')}
                  size={s(14)}
                  color={sereneColors['on-surface-variant']}
                />
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  +
                </RNText>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={{ padding: s(6), borderRadius: sereneBorderRadius.lg }}>
        <MaterialCommunityIcons
          name={isCompleted ? mci('expand_more') : mci('arrow_forward_ios')}
          size={s(20)}
          color={sereneColors['on-surface-variant']}
        />
      </View>
    </Pressable>
  );
}
