import React from 'react';
import { View, type DimensionValue } from 'react-native';
import {
  sereneColors,
  sereneBorderRadius,
  useResponsive,
} from '../../theme/serene';
import type { ProgressBarResult } from '../../features/tasks/logic/getProgressBar';
import { getFillWidthPercent } from '../../features/tasks/logic/getProgressBar';
import { getProgressBarPalette } from '../../features/tasks/logic/getProgressBarPalette';

export type TaskProgressBarProps = {
  progress: ProgressBarResult;
  height?: number;
  tone?: 'default' | 'onDark';
};

export default function TaskProgressBar({
  progress,
  height,
  tone = 'default',
}: TaskProgressBarProps) {
  const { scale: s } = useResponsive();
  const h = height ?? s(8);
  const palette = getProgressBarPalette(tone);

  let statuses: ReadonlyArray<'done' | 'current' | 'pending'> = [];

  if (progress.kind === 'segments') {
    statuses = progress.statuses;
  }

  const segmentColor = (status: 'done' | 'current' | 'pending') => {
    switch (status) {
      case 'done':
        return sereneColors[palette.done as keyof typeof sereneColors];
      case 'current':
        return sereneColors[palette.current as keyof typeof sereneColors];
      default:
        return sereneColors[palette.pending as keyof typeof sereneColors];
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
          backgroundColor: sereneColors[palette.track as keyof typeof sereneColors],
          overflow: 'hidden',
        }}
      >
        {progress.kind === 'continuous' ? (
          <View
            style={{
              width: fillWidth as DimensionValue,
              height: '100%',
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors[palette.fill as keyof typeof sereneColors],
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
