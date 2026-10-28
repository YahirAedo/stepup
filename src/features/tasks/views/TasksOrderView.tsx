import React from 'react';
import {
  View,
  ScrollView,
  Text as RNText,
  Pressable,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '../../../theme/serene';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
} from '../../../theme/serene';
import { mci } from '../../../components/designlab/mciIconMap';
import StepRow from '../../../components/ui/StepRow';
import type { Step } from '../../../types';

export interface TasksOrderViewProps {
  steps: ReadonlyArray<Step>;
  pendingDeleteIds: ReadonlyArray<number>;
  selectedStepId: number | null;
  previousOrder: ReadonlyArray<number> | null;
  onSelectStep: (stepId: number) => void;
  onUndoReorder: () => Promise<void>;
  onClose: () => void;
}

export default function TasksOrderView({
  steps,
  pendingDeleteIds,
  selectedStepId,
  previousOrder,
  onSelectStep,
  onUndoReorder,
  onClose,
}: TasksOrderViewProps) {
  const { scale: s } = useResponsive();

  const isDeleted = (stepId: number) => pendingDeleteIds.includes(stepId);
  const pendingNotDeleted = steps.filter(
    (step) => step.status === 'pending' && !isDeleted(step.id),
  );
  const completed = steps.filter((step) => step.status === 'completed');
  const isSelected = (stepId: number) => selectedStepId === stepId;

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: sereneSpacing.margin,
          paddingTop: sereneSpacing['space-sm'],
          gap: sereneSpacing['space-sm'],
        }}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar ordenar"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: s(48),
            paddingHorizontal: sereneSpacing['space-sm'],
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('arrow_back')} size={s(20)} color={sereneColors.primary} />
          <RNText
            style={[sereneTypography['label-lg'] as TextStyle, { color: sereneColors.primary }]}
          >
            Cerrar
          </RNText>
        </Pressable>
        <RNText
          style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
        >
          Ordenar pasos
        </RNText>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: sereneSpacing['space-lg'],
          gap: sereneSpacing['space-sm'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <RNText
          style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          Tocá un paso para seleccionarlo, luego tocá otro para moverlo ahí.
        </RNText>

        {previousOrder && (
          <Pressable
            onPress={onUndoReorder}
            accessibilityRole="button"
            accessibilityLabel="Deshacer ordenar"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s(6),
              minHeight: s(48),
              marginTop: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.lg,
              backgroundColor: sereneColors['surface-container-high'],
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: sereneSpacing['space-sm'],
            })}
          >
            <MaterialCommunityIcons name={mci('undo')} size={s(18)} color={sereneColors.primary} />
            <RNText
              style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}
            >
              Deshacer ordenar
            </RNText>
          </Pressable>
        )}

        {completed.length > 0 && (
          <View style={{ marginTop: sereneSpacing['space-sm'] }}>
            <RNText
              style={[sereneTypography['caption'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              Completados (anclados)
            </RNText>
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              {completed.map((step) => (
                <StepRow
                  key={step.id}
                  name={step.name}
                  durationMin={step.duration_min ?? null}
                  completed
                  pendingDelete={false}
                />
              ))}
            </View>
          </View>
        )}

        <RNText
          style={[sereneTypography['caption'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
        >
          Pendientes
        </RNText>
        <View style={{ gap: sereneSpacing['space-xs'] }}>
          {pendingNotDeleted.map((step) => (
            <StepRow
              key={step.id}
              name={step.name}
              durationMin={step.duration_min ?? null}
              completed={false}
              pendingDelete={isDeleted(step.id)}
              selected={isSelected(step.id)}
              onPress={() => onSelectStep(step.id)}
            />
          ))}
          {pendingNotDeleted.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: sereneSpacing['space-sm'] }}>
              <RNText
                style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                No hay pasos pendientes para ordenar.
              </RNText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
