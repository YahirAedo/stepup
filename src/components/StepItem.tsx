import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, typography, borderRadius } from '../theme';
import { Step } from '../types';
import { StepService } from '../services/StepService';

interface StepItemProps {
  step: Step;
  isNext: boolean;
  onToggle: () => void;
  onPress: () => void;
  onLongPress: () => void;
}

export default function StepItem({ step, isNext, onToggle, onPress, onLongPress }: StepItemProps) {
  const completed = step.status === 'completed';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        padding: 16,
        borderRadius: borderRadius.lg,
        backgroundColor: completed
          ? colors['surface-container-low']
          : isNext
          ? colors['surface-container-lowest']
          : colors['surface-container-low'],
        borderWidth: 1,
        borderColor: isNext ? `${colors.secondary}33` : 'transparent',
      }}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          width: 24,
          height: 24,
          marginTop: 2,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: completed ? colors.outline : isNext ? colors.secondary : colors.outline,
          backgroundColor: completed ? colors['secondary-fixed-dim'] : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {completed && (
          <Text style={{ fontSize: 14, color: colors['on-secondary-fixed'] }}>✓</Text>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={[
            typography['body-md'] ,
            {
              color: completed ? colors['on-surface-variant'] : colors['on-surface'],
              textDecorationLine: completed ? 'line-through' : 'none',
              opacity: completed ? 0.6 : 1,
            },
          ]}
        >
          {step.name}
        </Text>
        {completed && (
          <Text style={[typography['label-sm'] , { color: colors.outline, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            ✓ Completado
          </Text>
        )}
        {isNext && !completed && (
          <Text style={[typography['label-sm'] , { color: colors.secondary, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            ○ En progreso
          </Text>
        )}
      </View>

      {/* Duration */}
      {step.duration_min && (
        <Text style={[typography['label-md'] , { color: completed ? colors.outline : colors['on-surface-variant'] }]}>
          {step.duration_min}m
        </Text>
      )}
    </TouchableOpacity>
  );
}
