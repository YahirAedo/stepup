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
import DueDateField from '../DueDateField';
import EditarPasoSheet from '../EditarPasoSheet';
import OrdenarPaso from '../OrdenarPaso';
import StepRow from '../StepRow';
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
  /** Abre el modal de Ordenar pasos al montar (llegada desde otro CTA). */
  autoOpenOrdenar?: boolean;
}

/**
 * Cuerpo compartido del formulario de tarea (Variante A "Enfoque"), reusado por
 * Crear y Editar. La IA va primero: banner, título con contador, notas
 * colapsables y la sección de Pasos con `StepRow` (nombre + duración +
 * tacho/deshacer). Tap en una fila abre el sheet de edición.
 *
 * Es presentacional sobre fixtures: la pantalla host provee el header, el
 * `ScrollView` y la barra de acción fija.
 */
export default function TareaAForm({ mode, autoOpenOrdenar }: TareaAFormProps) {
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
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Set<string>>(new Set());
  const [ordenarVisible, setOrdenarVisible] = useState(autoOpenOrdenar === true);
  const [addOpen, setAddOpen] = useState(false);
  const stepSeq = useRef(0);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const describeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
      if (describeTimer.current) clearTimeout(describeTimer.current);
    },
    [],
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

  const canDescribe = title.trim().length > 0;
  const showLongTitle = isLongTitle(title);

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

  const handleAddManual = useCallback((stepTitle: string) => {
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
  }, []);

  const editingStep = steps.find((step) => step.id === editingStepId) ?? null;

  const handleSaveStep = useCallback(
    (values: { title: string; duration: number }) => {
      if (!editingStep) return;
      setSteps((prev) =>
        prev.map((step) =>
          step.id === editingStep.id
            ? { ...step, name: values.title, minutes: values.duration }
            : step,
        ),
      );
      setEditingStepId(null);
    },
    [editingStep],
  );

  const togglePendingDelete = useCallback((id: string) => {
    setPendingDelete((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleOpenOrdenar = useCallback(() => {
    setOrdenarVisible(true);
  }, []);

  const handleOrdenarDone = useCallback(
    (orderedIds: string[]) => {
      const byId = new Map(steps.map((step) => [step.id, step]));
      const nextSteps = orderedIds
        .map((id) => byId.get(id))
        .filter((step): step is FlujoAFormStep => step !== undefined);
      const remaining = steps.filter((step) => !orderedIds.includes(step.id));
      setSteps([...nextSteps, ...remaining]);
      setOrdenarVisible(false);
    },
    [steps],
  );

  const pendingStepsCount = steps.filter((step) => !pendingDelete.has(step.id)).length;
  const canOrder = pendingStepsCount >= 3;

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
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.titleLabel}</RNText>
          <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}>{`${title.length}/${f.titleMaxLength}`}</RNText>
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
            <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.longTitleMicrocopy}</RNText>
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
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}>{f.notesLabel}</RNText>
          <MaterialCommunityIcons name={notesOpen ? mci('expand_less') : mci('expand_more')} size={s(20)} color={sereneColors['on-surface-variant']} />
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
                  <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.ai.describeReady}</RNText>
                </View>
              ) : (
                <RNText style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}>{f.ai.describeHint}</RNText>
              )}
            </View>
          </>
        )}
      </View>

      {/* Fecha meta (dato neutro y opcional) */}
      <DueDateField value={dueDate} onChange={setDueDate} label={f.dueLabel} noneLabel={f.dueNone} clearLabel={f.dueClear} a11yLabel={f.dueA11y} />

      {/* Pasos: IA primero */}
      <View style={{ gap: sereneSpacing['space-sm'] }}>
        <RNText style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>{f.stepsTitle}</RNText>

        <AiStepsPanel status={aiStatus} onSuggest={handleSuggest} onRetry={handleSuggest} title={f.ai.title} cta={f.ai.cta} hint={f.ai.hint} loadingMessage={f.ai.loadingMessage} readyMessage={f.ai.readyMessage} errorMessage={f.ai.errorMessage} offlineMessage={f.ai.offlineMessage} />

        {/* SOLO DESIGN LAB: fuerza los estados de la IA sin red real. */}
        <AiStateDemoControl status={aiStatus} onChange={applyAiStatus} />

        {steps.length > 0 && (
          <View style={{ gap: sereneSpacing['space-sm'] }}>
            {steps.map((step) => (
              <StepRow
                key={step.id}
                name={step.name}
                durationMin={step.minutes}
                completed={false}
                pendingDelete={pendingDelete.has(step.id)}
                onPress={() => setEditingStepId(step.id)}
                onDelete={() => togglePendingDelete(step.id)}
                onUndoDelete={() => togglePendingDelete(step.id)}
              />
            ))}
          </View>
        )}

        {!addOpen ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: sereneSpacing['space-sm'] }}>
            {canOrder && (
              <Pressable
                onPress={handleOpenOrdenar}
                accessibilityRole="button"
                accessibilityLabel="Ordenar pasos"
                style={({ pressed }) => ({
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
                <MaterialCommunityIcons name={mci('swap_vert')} size={s(18)} color={sereneColors['on-surface']} />
                <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>Ordenar</RNText>
              </Pressable>
            )}
            <Pressable
              onPress={() => setAddOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Añadir paso"
              style={({ pressed }) => ({
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
              <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors['on-surface'] }]}>{f.addManualLabel}</RNText>
            </Pressable>
          </View>
        ) : (
          <AddMicroStepInline visible={addOpen} suggestedMinutes={f.addInline.suggestedMinutes} maxMinutes={f.addInline.maxMinutes} heading={f.addInline.heading} placeholder={f.addInline.placeholder} onClose={() => setAddOpen(false)} onSave={handleAddManual} />
        )}
      </View>

      <EditarPasoSheet visible={editingStepId !== null} onClose={() => setEditingStepId(null)} onSave={handleSaveStep} taskTitle={title || 'Tarea'} initialTitle={editingStep?.name ?? ''} initialDuration={editingStep?.minutes ?? 3} position={1} total={steps.length} />

      <OrdenarPaso visible={ordenarVisible} steps={steps.map((step) => ({ id: step.id, name: step.name, completed: false, pendingDelete: pendingDelete.has(step.id) }))} lockedIds={[...pendingDelete]} onClose={() => setOrdenarVisible(false)} onDone={handleOrdenarDone} />
    </View>
  );
}