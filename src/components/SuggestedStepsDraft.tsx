import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { DraftStep } from '../types';
import { colors, typography, spacing, borderRadius } from '../theme';
import Button from './Button';

interface SuggestedStepsDraftProps {
  draft: DraftStep[] | null;
  onChangeDraft: (next: DraftStep[]) => void;
  onRegenerate: () => void;
  suggesting?: boolean;
  error?: string | null;
}

// Borrador editable de pasos sugeridos por IA (issues #155/#157). El usuario edita,
// borra o agrega pasos antes de confirmar: la IA propone, él decide. La CTA de
// confirmación depende de cada pantalla (crear tarea vs. agregar a tarea existente).
export default function SuggestedStepsDraft({
  draft,
  onChangeDraft,
  onRegenerate,
  suggesting = false,
  error = null,
}: SuggestedStepsDraftProps) {
  const nextDraftKey = useRef(0);

  function updateDraftName(index: number, value: string) {
    if (draft === null) return;
    onChangeDraft(draft.map((step, i) => (i === index ? { ...step, name: value } : step)));
  }

  function updateDraftDuration(index: number, value: string) {
    if (draft === null) return;
    onChangeDraft(draft.map((step, i) => (i === index ? { ...step, durationMin: value } : step)));
  }

  function removeDraftStep(index: number) {
    if (draft === null) return;
    onChangeDraft(draft.filter((_, i) => i !== index));
  }

  function addManualStep() {
    const key = `manual-${nextDraftKey.current}`;
    nextDraftKey.current += 1;
    onChangeDraft([...(draft ?? []), { key, name: '', durationMin: '' }]);
  }

  const labelSmUppercase: TextStyle[] = [
    typography['label-sm'],
    { color: colors.secondary, textTransform: 'uppercase' },
  ];

  return (
    <View style={{ gap: spacing['stack-gap'] }}>
      {suggesting && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing['stack-gap'] - 4,
          }}
        >
          <ActivityIndicator size="small" color={colors['primary-container']} />
          <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
            Pensando una propuesta de pasos...
          </Text>
        </View>
      )}

      {!suggesting && error && (
        <Text style={[typography['body-md'], { color: colors.error }]}>{error}</Text>
      )}

      {draft !== null && (
        <View style={{ gap: spacing['stack-gap'] }}>
          <View style={{ gap: spacing.unit * 2 }}>
            <Text style={labelSmUppercase}>Borrador de pasos</Text>
            {draft.map((step, index) => (
              <View
                key={step.key}
                style={{
                  backgroundColor: colors['surface-container-low'],
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: colors['outline-variant'],
                  padding: spacing['stack-gap'] - 4,
                  gap: spacing.unit * 2,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.unit }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors['primary-fixed'],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={[typography['label-sm'], { color: colors['on-primary-fixed'] }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography['label-sm'],
                        { color: colors['on-surface-variant'], textTransform: 'uppercase' },
                      ]}
                    >
                      PASO {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeDraftStep(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar paso ${index + 1}`}
                    hitSlop={8}
                    style={{
                      minWidth: 48,
                      minHeight: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={22}
                      color={colors['on-surface-variant']}
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={step.name}
                  onChangeText={(value) => updateDraftName(index, value)}
                  placeholder="Nombre del paso..."
                  placeholderTextColor={`${colors['surface-dim']}CC`}
                  maxLength={200}
                  multiline
                  accessibilityLabel={`Nombre del paso ${index + 1}`}
                  style={[
                    typography['body-md'] as TextStyle,
                    {
                      color: colors['on-surface'],
                      borderBottomWidth: 2,
                      borderBottomColor: colors['outline-variant'],
                      paddingVertical: 8,
                    },
                  ]}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.unit * 2,
                  }}
                >
                  <TextInput
                    value={step.durationMin}
                    onChangeText={(value) => updateDraftDuration(index, value)}
                    placeholder="min"
                    placeholderTextColor={`${colors['surface-dim']}CC`}
                    keyboardType="number-pad"
                    maxLength={3}
                    accessibilityLabel={`Duración en minutos del paso ${index + 1}`}
                    style={[
                      typography['body-md'] as TextStyle,
                      {
                        color: colors['on-surface'],
                        borderBottomWidth: 2,
                        borderBottomColor: colors['outline-variant'],
                        paddingVertical: 8,
                        width: 72,
                        textAlign: 'center',
                      },
                    ]}
                  />
                  <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
                    minutos
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
            Podés editar cada paso, borrarlo o agregar los tuyos antes de confirmar. La IA propone,
            vos decidís.
          </Text>

          <Button title="+ Agregar paso" onPress={addManualStep} variant="secondary" />
          <Button
            title="Otra propuesta"
            onPress={onRegenerate}
            variant="tertiary"
            disabled={suggesting}
          />
        </View>
      )}
    </View>
  );
}
