import React from 'react';
import { View, type DimensionValue } from 'react-native';
import {
  sereneColors,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import type { ProgressBarResult } from '../../features/tasks/logic/getProgressBar';
import { getFillWidthPercent } from '../../features/tasks/logic/getProgressBar';

export type TaskProgressBarProps = {
  progress: ProgressBarResult;
  height?: number;
};

export default function TaskProgressBar({
  progress,
  height,
}: TaskProgressBarProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(8);

  let statuses: ReadonlyArray<'done' | 'current' | 'pending'> = [];

  if (progress.kind === 'segments') {
    statuses = progress.statuses;
  }

  const segmentColor = (status: 'done' | 'current' | 'pending') => {
    switch (status) {
      case 'done':
        return sereneColors['primary-container'];
      case 'current':
        return sereneColors['secondary-container'];
      default:
        return sereneColors['surface-container-high'];
    }
  };

  const fillWidth =
    progress.kind === 'continuous'
      ? `${getFillWidthPercent(progress)}%`
      : '100%';

  return (
    <View style={{ paddingHorizontal: s(1) }}>
      <View
        style={{
          height: h,
          flexDirection: 'row',
          gap: progress.kind === 'segments' ? s(2) : 0,
          padding: progress.kind === 'segments' ? s(1) : 0,
          borderRadius: sereneBorderRadius.full,
          backgroundColor: sereneColors['surface-container-high'],
          overflow: 'hidden',
        }}
      >
        {progress.kind === 'continuous' ? (
          <View
            style={{
              width: fillWidth as DimensionValue,
              height: '100%',
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['primary-container'],
            }}
          />
        ) : (
          statuses.map((status, idx) => (
            <View
              key={idx}
              style={{
                flex: 1,
                height: '100%' as DimensionValue,
                borderRadius: sereneBorderRadius.full,
                backgroundColor: segmentColor(status),
                overflow: 'hidden',
              }}
            />
          ))
        )}
      </View>
    </View>
  );
}
