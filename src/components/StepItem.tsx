import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, typography, borderRadius } from '../theme';
import { Step } from '../types';

interface StepItemProps {
  step: Step;
  isNext: boolean;
  onToggle: () => void;
  onPress: () => void;
  onLongPress: () => void;
}

export default function StepItem({ step, isNext, onToggle, onPress, onLongPress }: StepItemProps) {
  const completed = step.status === 'completed';
  const checkboxLabel = `${step.name}, ${completed ? 'completado' : 'pendiente'}`;
  const itemLabel = `Paso: ${step.name}${completed ? ', completado' : ''}${isNext && !completed ? ', en progreso' : ''}`;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={itemLabel}
      accessibilityHint="Mantener para eliminar el paso"
      style={({ pressed }) => ({
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
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {/* Checkbox */}
      <Pressable
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={checkboxLabel}
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
        {completed && <Text style={{ fontSize: 14, color: colors['on-secondary-fixed'] }}>✓</Text>}
      </Pressable>

      {/* Content */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={[
            typography['body-md'],
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
          <Text
            style={[
              typography['label-sm'],
              { color: colors.outline, flexDirection: 'row', alignItems: 'center', gap: 4 },
            ]}
          >
            ✓ Completado
          </Text>
        )}
        {isNext && !completed && (
          <Text
            style={[
              typography['label-sm'],
              { color: colors.secondary, flexDirection: 'row', alignItems: 'center', gap: 4 },
            ]}
          >
            ○ En progreso
          </Text>
        )}
      </View>

      {/* Duration */}
      {step.duration_min && (
        <Text
          style={[
            typography['label-md'],
            { color: completed ? colors.outline : colors['on-surface-variant'] },
          ]}
        >
          {step.duration_min}m
        </Text>
      )}
    </Pressable>
  );
}
