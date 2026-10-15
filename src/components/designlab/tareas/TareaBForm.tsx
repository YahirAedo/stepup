// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, TextInput, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AiStepsPanel, { type AiStatus } from '../AiStepsPanel';
import AiStateDemoControl from '../AiStateDemoControl';
import AddMicroStepInline from '../AddMicroStepInline';
import DurationChips from '../DurationChips';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  useResponsive,
} from '../../../theme/serene';
import { computeTotalMinutes, stepCountLabel, totalMinutesLabel } from '../../../utils/microplan';
import {
  flujoBFormFixtures,
  flujoBFormCreateDefaults,
  flujoBFormEditDefaults,
  type FlujoBFormStep,
} from '../../../screens/designlab/tareasFlujoBFixtures';

export interface TareaBFormProps {
  /** `create` arranca vacío; `edit` precarga los datos de la tarea. */
  mode: 'create' | 'edit';
}

/**
 * Cuerpo compartido del formulario de tarea (Variante B "Ritmo"), reusado por
 * Crear y Editar: título con contador, sección de pasos densa, chips de
 * duración para el próximo paso, alta manual inline e IA opcional colapsada
 * bajo un toggle. Sin banners decorativos.
 *
 * Es presentacional sobre fixtures: la pantalla host provee el header, el
 * `ScrollView` y la barra de acción fija.
 */
export default function TareaBForm({ mode }: TareaBFormProps) {
  const { scale: s } = useResponsive();
  const f = flujoBFormFixtures;
  const defaults = mode === 'edit' ? flujoBFormEditDefaults : flujoBFormCreateDefaults;

  const [title, setTitle] = useState(defaults.title);
  const [steps, setSteps] = useState<FlujoBFormStep[]>(defaults.steps);
  const [duration, setDuration] = useState(f.defaultDuration);
  const [addOpen, setAddOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const stepSeq = useRef(0);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    },
    []
  );

  /**
   * Sincroniza la lista de pasos con el estado de IA: los sugeridos solo viven
   * mientras el estado es `ready`. Los pasos manuales y los precargados de la
   * edición persisten.
   */
  const applyAiStatus = useCallback(
    (next: AiStatus) => {
      setAiStatus(next);
      if (next === 'ready') {
        setSteps((prev) => [
          ...prev.filter((step) => !step.id.startsWith('ai-')),
          ...f.suggestedSteps.map((step) => ({ ...step })),
        ]);
      } else {
        setSteps((prev) => prev.filter((step) => !step.id.startsWith('ai-')));
      }
    },
    [f.suggestedSteps]
  );

  const handleSuggest = useCallback(() => {
    console.log('[DesignLab] Sugerir pasos con IA');
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    setAiStatus('loading');
    suggestTimer.current = setTimeout(() => {
      applyAiStatus('ready');
      suggestTimer.current = null;
    }, 1100);
  }, [applyAiStatus]);

  const handleAddManual = useCallback(
    (stepTitle: string) => {
      stepSeq.current += 1;
      setSteps((prev) => [
        ...prev,
        { id: `manual-${stepSeq.current}`, title: stepTitle, minutes: duration },
      ]);
      setAddOpen(false);
    },
    [duration]
  );

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  }, []);

  const stepsMeta = `${stepCountLabel(steps.length)} · ${totalMinutesLabel(
    computeTotalMinutes(steps.map((step) => ({ duration_min: step.minutes })))
  )}`;

  return (
    <View style={{ gap: sereneSpacing['space-lg'] }}>
      {/* Título + contador */}
      <View style={{ gap: sereneSpacing['space-xs'] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
            flexWrap: 'wrap',
          }}
        >
          <RNText
            style={[
              sereneTypography['label-md'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {f.titleLabel}
          </RNText>
          <RNText
            style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
          >
            {`${title.length}/${f.titleMaxLength}`}
          </RNText>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={f.titlePlaceholder}
          placeholderTextColor={sereneColors['on-surface-variant']}
          multiline
          maxLength={f.titleMaxLength}
          accessibilityLabel={f.titleLabel}
          style={[
            sereneTypography['body-md'] as TextStyle,
            {
              backgroundColor: sereneColors['surface-container-high'],
              borderRadius: sereneBorderRadius.lg,
              padding: sereneSpacing['space-md'],
              color: sereneColors['on-surface'],
              minHeight: s(52),
              textAlignVertical: 'top',
            },
          ]}
        />
      </View>

      {/* Pasos */}
      <View style={{ gap: sereneSpacing['space-sm'] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: s(6),
          }}
        >
          <RNText
            style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {f.stepsTitle}
          </RNText>
          <RNText
            style={[
              sereneTypography['label-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            {stepsMeta}
          </RNText>
        </View>

        {steps.length === 0 ? (
          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'] },
            ]}
          >
            {f.emptyStepsHint}
          </RNText>
        ) : (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {steps.map((step) => (
              <View
                key={step.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  paddingVertical: s(6),
                  paddingHorizontal: sereneSpacing['space-sm'],
                  borderRadius: sereneBorderRadius.xl,
                  backgroundColor: sereneColors['surface-container-lowest'],
                }}
              >
                <RNText
                  style={[
                    sereneTypography['body-md'] as TextStyle,
                    {
                      color: sereneColors['on-surface'],
                      flex: 1,
                      minWidth: 0,
                      flexWrap: 'wrap',
                    },
                  ]}
                >
                  {step.title}
                </RNText>
                <RNText
                  style={[
                    sereneTypography['label-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'] },
                  ]}
                >
                  {`~${step.minutes} min`}
                </RNText>
                <Pressable
                  onPress={() => removeStep(step.id)}
                  hitSlop={s(8)}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar paso ${step.title}`}
                  style={({ pressed }) => ({
                    width: s(44),
                    height: s(44),
                    borderRadius: sereneBorderRadius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={s(16)}
                    color={sereneColors['on-surface-variant']}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <DurationChips
          value={duration}
          options={f.durationOptions}
          onChange={setDuration}
          label={f.durationLabel}
        />

        {!addOpen ? (
          <Pressable
            onPress={() => setAddOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={f.addManualLabel}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: sereneSpacing['space-sm'],
              minHeight: s(44),
              paddingHorizontal: sereneSpacing['space-md'],
              paddingVertical: sereneSpacing['space-sm'],
              borderRadius: sereneBorderRadius.full,
              backgroundColor: sereneColors['surface-container-high'],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={mci('add')}
              size={s(18)}
              color={sereneColors['on-surface']}
            />
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface'] },
              ]}
            >
              {f.addManualLabel}
            </RNText>
          </Pressable>
        ) : (
          <AddMicroStepInline
            visible={addOpen}
            suggestedMinutes={duration}
            maxMinutes={f.addInline.maxMinutes}
            heading={f.addInline.heading}
            placeholder={f.addInline.placeholder}
            onClose={() => setAddOpen(false)}
            onSave={handleAddManual}
          />
        )}
      </View>

      {/* IA opcional: colapsada bajo un toggle. La IA nunca se dispara sola. */}
      <View style={{ gap: sereneSpacing['space-sm'] }}>
        <Pressable
          onPress={() => setAiOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: aiOpen }}
          accessibilityLabel={f.ai.title}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: sereneSpacing['space-sm'],
            minHeight: s(44),
            paddingHorizontal: sereneSpacing['space-md'],
            paddingVertical: sereneSpacing['space-sm'],
            borderRadius: sereneBorderRadius.lg,
            backgroundColor: sereneColors['surface-container-low'],
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(8), flexShrink: 1, flexWrap: 'wrap' }}>
            <MaterialCommunityIcons
              name="auto-fix"
              size={s(18)}
              color={aiOpen ? sereneColors.primary : sereneColors['on-surface-variant']}
            />
            <RNText
              style={[
                sereneTypography['label-md'] as TextStyle,
                { color: sereneColors['on-surface'], flexShrink: 1 },
              ]}
            >
              {'Sugerir con IA'}
            </RNText>
          </View>
          <MaterialCommunityIcons
            name={aiOpen ? mci('expand_less') : mci('expand_more')}
            size={s(20)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>

        {aiOpen && (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            <AiStepsPanel
              status={aiStatus}
              onSuggest={handleSuggest}
              onRetry={handleSuggest}
              title={f.ai.title}
              cta={f.ai.cta}
              hint={f.ai.hint}
              loadingMessage={f.ai.loadingMessage}
              readyMessage={f.ai.readyMessage}
              errorMessage={f.ai.errorMessage}
              offlineMessage={f.ai.offlineMessage}
            />

            {/* SOLO DESIGN LAB: fuerza los estados de la IA sin red real. */}
            <AiStateDemoControl status={aiStatus} onChange={applyAiStatus} />
          </View>
        )}
      </View>
    </View>
  );
}
