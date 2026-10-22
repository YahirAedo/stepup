// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text as RNText,
  Pressable,
  TextInput,
  ActivityIndicator,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AiStepsPanel, { type AiStatus } from '../AiStepsPanel';
import AiStateDemoControl from '../AiStateDemoControl';
import AddMicroStepInline from '../AddMicroStepInline';
import MinutesStepper from '../MinutesStepper';
import DraggableStepList from '../DraggableStepList';
import DueDateField from '../DueDateField';
import { mci } from '../mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../../theme/serene';
import { isLongTitle } from '../../../utils/microplan';
import {
  flujoAFormFixtures,
  flujoAFormCreateDefaults,
  flujoAFormEditDefaults,
  type FlujoAFormStep,
} from '../../../screens/designlab/tareasFlujoAFixtures';

export interface TareaAFormProps {
  /** `create` arranca vacío; `edit` precarga los datos de la tarea. */
  mode: 'create' | 'edit';
}

/**
 * Cuerpo compartido del formulario de tarea (Variante A "Enfoque"), reusado por
 * Crear y Editar. La IA va primero: banner anti-fricción, título con contador,
 * notas colapsables y la sección de Pasos con `AiStepsPanel`.
 *
 * Es presentacional sobre fixtures: la pantalla host provee el header, el
 * `ScrollView` y la barra de acción fija.
 */
export default function TareaAForm({ mode }: TareaAFormProps) {
  const { scale: s } = useResponsive();
  const f = flujoAFormFixtures;
  const defaults = mode === 'edit' ? flujoAFormEditDefaults : flujoAFormCreateDefaults;

  const [title, setTitle] = useState(defaults.title);
  const [notes, setNotes] = useState(defaults.notes);
  const [notesOpen, setNotesOpen] = useState(defaults.notes.length > 0);
  const [dueDate, setDueDate] = useState<string | undefined>(defaults.dueDate);
  const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
  const [describeStatus, setDescribeStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [steps, setSteps] = useState<FlujoAFormStep[]>(defaults.steps);
  const [addOpen, setAddOpen] = useState(false);
  const stepSeq = useRef(0);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const describeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
      if (describeTimer.current) clearTimeout(describeTimer.current);
    },
    []
  );

  /**
   * Sincroniza la lista de pasos con el estado de IA: los sugeridos solo viven
   * mientras el estado es `ready`. Los pasos manuales y los precargados de la
   * edición persisten.
   */
  const applyAiStatus = useCallback((next: AiStatus) => {
    setAiStatus(next);
    if (next === 'ready') {
      setSteps((prev) => [
        ...prev.filter((step) => !step.id.startsWith('ai-')),
        ...flujoAFormFixtures.suggestedSteps.map((step) => ({ ...step })),
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

  const updateStepTitle = useCallback((id: string, nextTitle: string) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, name: nextTitle } : step)));
  }, []);

  const removeStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  }, []);

  const updateStepMinutes = useCallback((id: string, minutes: number) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, minutes } : step)));
  }, []);

  const canDescribe = title.trim().length > 0;

  /**
   * Ayuda de descripción: `AIService.describeHelp(taskName)` usa SOLO el nombre.
   * Acá se simula la llamada con un timer para poder ver el estado (Design Lab).
   */
  const handleDescribe = useCallback(() => {
    if (!canDescribe) return;
    if (describeTimer.current) clearTimeout(describeTimer.current);
    setNotesOpen(true);
    setDescribeStatus('loading');
    describeTimer.current = setTimeout(() => {
      setNotes(f.ai.describeSuggested);
      setDescribeStatus('ready');
      describeTimer.current = null;
    }, 900);
  }, [canDescribe, f.ai.describeSuggested]);

  const handleAddManual = useCallback(
    (stepTitle: string) => {
      stepSeq.current += 1;
      setSteps((prev) => [
        ...prev,
        {
          id: `manual-${stepSeq.current}`,
          name: stepTitle,
          minutes: flujoAFormFixtures.addInline.suggestedMinutes,
        },
      ]);
      setAddOpen(false);
    },
    []
  );

  const showLongTitle = isLongTitle(title);

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
          <>
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

            {/* Ayuda de descripción con IA (usa SOLO el nombre de la tarea). */}
            <View style={{ gap: sereneSpacing['space-xs'] }}>
              <Pressable
                onPress={handleDescribe}
                disabled={!canDescribe || describeStatus === 'loading'}
                accessibilityRole="button"
                accessibilityLabel={f.ai.describeCta}
                accessibilityState={{ disabled: !canDescribe }}
                style={({ pressed }) => ({
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  minHeight: s(44),
                  paddingHorizontal: sereneSpacing['space-md'],
                  paddingVertical: sereneSpacing['space-sm'],
                  borderRadius: sereneBorderRadius.full,
                  backgroundColor: sereneColors['primary-container'],
                  opacity: !canDescribe ? 0.5 : describeStatus === 'loading' ? 0.8 : pressed ? 0.9 : 1,
                })}
              >
                {describeStatus === 'loading' ? (
                  <ActivityIndicator size="small" color={sereneColors['on-primary']} />
                ) : (
                  <MaterialCommunityIcons name={mci('auto_awesome')} size={s(18)} color={sereneColors['on-primary']} />
                )}
                <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-primary'] }]}>
                  {describeStatus === 'loading' ? f.ai.describeLoading : f.ai.describeCta}
                </RNText>
              </Pressable>

              {describeStatus === 'ready' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(6) }}>
                  <MaterialCommunityIcons name={mci('check_circle')} size={s(16)} color={sereneColors.primary} />
                  <RNText
                    style={[
                      sereneTypography['body-sm'] as TextStyle,
                      { color: sereneColors['on-surface-variant'], flexShrink: 1 },
                    ]}
                  >
                    {f.ai.describeReady}
                  </RNText>
                </View>
              ) : (
                <RNText
                  style={[
                    sereneTypography['body-sm'] as TextStyle,
                    { color: sereneColors['on-surface-variant'], flexShrink: 1 },
                  ]}
                >
                  {f.ai.describeHint}
                </RNText>
              )}
            </View>
          </>
        )}
      </View>

      {/* Vencimiento (dato neutro y opcional) */}
      <DueDateField
        value={dueDate}
        onChange={setDueDate}
        label={f.dueLabel}
        noneLabel={f.dueNone}
        clearLabel={f.dueClear}
        a11yLabel={f.dueA11y}
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
          <DraggableStepList
            data={steps}
            keyExtractor={(step) => step.id}
            onReorder={(next) => setSteps(next)}
            gap={sereneSpacing['space-sm']}
            renderItem={({ item: step, drag, isActive }) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: sereneSpacing['space-sm'],
                  padding: sereneSpacing['space-sm'] + 2,
                  borderRadius: sereneBorderRadius.xl,
                  backgroundColor: sereneColors['surface-container-lowest'],
                  opacity: isActive ? 0.9 : 1,
                }}
              >
                <Pressable
                  onLongPress={drag}
                  disabled={isActive}
                  delayLongPress={180}
                  hitSlop={s(8)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reordenar ${step.name}`}
                  style={({ pressed }) => ({
                    width: s(32),
                    height: s(32),
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name={mci('drag_indicator')}
                    size={s(20)}
                    color={sereneColors.outline}
                  />
                </Pressable>

                <TextInput
                  value={step.name}
                  onChangeText={(next) => updateStepTitle(step.id, next)}
                  maxLength={80}
                  accessibilityLabel={`Título del paso ${step.name}`}
                  style={[
                    sereneTypography['body-md'] as TextStyle,
                    { flex: 1, minWidth: 0, color: sereneColors['on-surface'], padding: 0 },
                  ]}
                />
                <MinutesStepper
                  value={step.minutes}
                  onChange={(minutes) => updateStepMinutes(step.id, minutes)}
                  size="compact"
                />
                <Pressable
                  onPress={() => removeStep(step.id)}
                  hitSlop={s(8)}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar paso ${step.name}`}
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
            )}
          />
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
    </View>
  );
}
