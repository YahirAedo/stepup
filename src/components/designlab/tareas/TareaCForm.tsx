// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  TextInput,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AiStepsPanel, { type AiStatus } from '../AiStepsPanel';
import AiStateDemoControl from '../AiStateDemoControl';
import AddMicroStepInline from '../AddMicroStepInline';
import TemplatePicker from './TemplatePicker';
import TimelineStep from './TimelineStep';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';
import { clockLabel, computeTotalMinutes, isLongTitle, stepCountLabel, stepStartMinutes } from '../../../utils/microplan';
import {
  flujoCFormFixtures,
  flujoCFormCreateDefaults,
  flujoCFormEditDefaults,
  flujoCTemplateFixtures,
  type FlujoCFormStep,
} from '../../../screens/designlab/tareasFlujoCFixtures';

export interface TareaCFormProps {
  /** `create` arranca vacío; `edit` precarga los datos de la tarea. */
  mode: 'create' | 'edit';
}

/**
 * Cuerpo compartido del formulario de tarea (Variante C "Sendero"), reusado
 * por Crear y Editar. Mismo esqueleto que `TareaAForm` (banner anti-fricción,
 * título con contador, notas colapsables y Pasos con `AiStepsPanel`) más la
 * identidad de C: `TemplatePicker` arriba (una plantilla llena los pasos) y un
 * mini timeline con `TimelineStep` de los pasos actuales.
 *
 * Es presentacional sobre fixtures: la pantalla host provee el header, el
 * `ScrollView` y la barra de acción fija.
 */
export default function TareaCForm({ mode }: TareaCFormProps) {
  const { scale: s } = useResponsive();
  const f = flujoCFormFixtures;
  const defaults = mode === 'edit' ? flujoCFormEditDefaults : flujoCFormCreateDefaults;

  const [title, setTitle] = useState(defaults.title);
  const [notes, setNotes] = useState(defaults.notes);
  const [notesOpen, setNotesOpen] = useState(defaults.notes.length > 0);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [steps, setSteps] = useState<FlujoCFormStep[]>(defaults.steps);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
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
   * mientras el estado es `ready`. Los pasos manuales, de plantilla y los
   * precargados de la edición persisten.
   */
  const applyAiStatus = useCallback((next: AiStatus) => {
    setAiStatus(next);
    if (next === 'ready') {
      setSteps((prev) => [
        ...prev.filter((step) => !step.id.startsWith('ai-')),
        ...flujoCFormFixtures.suggestedSteps.map((step) => ({ ...step })),
      ]);
    } else {
      setSteps((prev) => prev.filter((step) => !step.id.startsWith('ai-')));
    }
  }, []);

  const handleSuggest = useCallback(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    applyAiStatus('loading');
    suggestTimer.current = setTimeout(() => {
      applyAiStatus('ready');
      suggestTimer.current = null;
    }, 1100);
  }, [applyAiStatus]);

  // REQUIERE MIGRACIÓN: aplicar una plantilla reutilizable no existe en el modelo (Task/Step).
  const handleSelectTemplate = useCallback((templateId: string) => {
    const template = flujoCTemplateFixtures.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplateId(templateId);
    stepSeq.current += 1;
    const batch = stepSeq.current;
    setSteps(
      template.steps.map((step, index) => ({
        id: `tpl-${batch}-${index}`,
        title: step.title,
        minutes: step.minutes,
      }))
    );
  }, []);

  const updateStepTitle = useCallback((id: string, nextTitle: string) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, title: nextTitle } : step)));
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  }, []);

  const handleAddManual = useCallback((stepTitle: string) => {
    stepSeq.current += 1;
    setSteps((prev) => [
      ...prev,
      {
        id: `manual-${stepSeq.current}`,
        title: stepTitle,
        minutes: flujoCFormFixtures.addInline.suggestedMinutes,
      },
    ]);
    setAddOpen(false);
  }, []);

  const showLongTitle = isLongTitle(title);
  const timelineStarts = stepStartMinutes(steps.map((step) => ({ duration_min: step.minutes })));
  const timelineTotal = computeTotalMinutes(steps.map((step) => ({ duration_min: step.minutes })));

  return (
    <View style={{ gap: sereneSpacing['space-lg'] }}>
      {/* Banner anti-fricción (1 línea) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: sereneSpacing['space-sm'],
          padding: sereneSpacing['space-sm'],
          borderRadius: sereneBorderRadius.xl,
          backgroundColor: withAlpha(sereneColors['secondary-container'], 0.4),
        }}
      >
        <MaterialCommunityIcons name={mci('bolt')} size={s(16)} color={sereneColors.primary} />
        <RNText
          style={[
            sereneTypography['body-sm'] as TextStyle,
            { color: sereneColors['on-secondary-container'], flexShrink: 1 },
          ]}
        >
          {f.frictionBanner}
        </RNText>
      </View>

      {/* Título */}
      <View style={{ gap: sereneSpacing['space-xs'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sereneSpacing['space-sm'] }}>
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}
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
              minHeight: s(56),
              textAlignVertical: 'top',
            },
          ]}
        />

        {showLongTitle && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
            <MaterialCommunityIcons name={mci('lightbulb')} size={s(16)} color={sereneColors.primary} />
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], flexShrink: 1 },
              ]}
            >
              {f.longTitleMicrocopy}
            </RNText>
          </View>
        )}
      </View>

      {/* Notas colapsables (secundario) */}
      <View style={{ gap: sereneSpacing['space-xs'] }}>
        <Pressable
          onPress={() => setNotesOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: notesOpen }}
          accessibilityLabel={f.notesLabel}
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
          <RNText
            style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
          >
            {f.notesLabel}
          </RNText>
          <MaterialCommunityIcons
            name={notesOpen ? mci('expand_less') : mci('expand_more')}
            size={s(20)}
            color={sereneColors['on-surface-variant']}
          />
        </Pressable>

        {notesOpen && (
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={f.notesPlaceholder}
            placeholderTextColor={sereneColors['on-surface-variant']}
            multiline
            maxLength={200}
            accessibilityLabel={f.notesLabel}
            style={[
              sereneTypography['body-md'] as TextStyle,
              {
                backgroundColor: sereneColors['surface-container-high'],
                borderRadius: sereneBorderRadius.lg,
                padding: sereneSpacing['space-md'],
                color: sereneColors['on-surface'],
                minHeight: s(72),
                textAlignVertical: 'top',
              },
            ]}
          />
        )}
      </View>

      {/* Plantillas reutilizables (identidad de C) */}
      <TemplatePicker
        title={f.templatesTitle}
        templates={flujoCTemplateFixtures}
        selectedId={selectedTemplateId}
        onSelect={handleSelectTemplate}
      />

      {/* Pasos: IA primero */}
      <View style={{ gap: sereneSpacing['space-sm'] }}>
        <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
          {f.stepsTitle}
        </RNText>

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

        {steps.length > 0 && (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {steps.map((step) => (
              <View
                key={step.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  padding: sereneSpacing['space-sm'] + 2,
                  borderRadius: sereneBorderRadius.xl,
                  backgroundColor: sereneColors['surface-container-lowest'],
                }}
              >
                <TextInput
                  value={step.title}
                  onChangeText={(next) => updateStepTitle(step.id, next)}
                  maxLength={80}
                  accessibilityLabel={`Título del paso ${step.title}`}
                  style={[
                    sereneTypography['body-md'] as TextStyle,
                    { flex: 1, minWidth: 0, color: sereneColors['on-surface'], padding: 0 },
                  ]}
                />
                <RNText
                  style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
                >
                  {`~${step.minutes} min`}
                </RNText>
                <Pressable
                  onPress={() => removeStep(step.id)}
                  hitSlop={s(8)}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar paso ${step.title}`}
                  style={({ pressed }) => ({
                    width: s(32),
                    height: s(32),
                    borderRadius: sereneBorderRadius.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="close" size={s(16)} color={sereneColors['on-surface-variant']} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

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
            <MaterialCommunityIcons name={mci('add')} size={s(18)} color={sereneColors['on-surface']} />
            <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>
              {f.addManualLabel}
            </RNText>
          </Pressable>
        ) : (
          <AddMicroStepInline
            visible={addOpen}
            suggestedMinutes={f.addInline.suggestedMinutes}
            maxMinutes={f.addInline.maxMinutes}
            heading={f.addInline.heading}
            placeholder={f.addInline.placeholder}
            onClose={() => setAddOpen(false)}
            onSave={handleAddManual}
          />
        )}
      </View>

      {/* Mini timeline de los pasos actuales (minutos acumulados) */}
      {steps.length > 0 && (
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sereneSpacing['space-sm'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
              <MaterialCommunityIcons name={mci('timelapse')} size={s(18)} color={sereneColors.primary} />
              <RNText
                style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
              >
                {f.timelineTitle}
              </RNText>
            </View>
            <RNText
              style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
            >
              {`${stepCountLabel(steps.length)} · ${clockLabel(timelineTotal)} acumulados`}
            </RNText>
          </View>

          <View style={{ gap: s(2) }}>
            {steps.map((step, index) => (
              <TimelineStep
                key={step.id}
                title={step.title}
                durationMin={step.minutes}
                variant="pending"
                startMinutes={timelineStarts[index]}
                isLast={index === steps.length - 1}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
