import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TasksStackParamList, MainTabParamList } from '../types/navigation';
import { TaskService } from '../services/TaskService';
import { StepService } from '../services/StepService';
import { AIService, aiErrorMessage } from '../services/AIService';
import { hasSession } from '../services/session';
import { Task, Step, DraftStep } from '../types';
import { colors, typography, spacing, borderRadius, shadows, useBottomLayout } from '../theme';
import { useIsOnline } from '../hooks/useIsOnline';
import { parseDraftSteps } from '../utils/draftSteps';
import ProgressBar from '../components/ProgressBar';
import StepItem from '../components/StepItem';
import Button from '../components/Button';
import SuggestedStepsDraft from '../components/SuggestedStepsDraft';

type Props = CompositeScreenProps<
  NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { contentPaddingBottom } = useBottomLayout();
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  const isOnline = useIsOnline();
  const aiVisible = isOnline && hasSession();
  const [suggesting, setSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftStep[] | null>(null);
  const [confirming, setConfirming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function loadData() {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        TaskService.getById(taskId),
        StepService.getByTask(taskId),
      ]);
      setTask(t);
      setSteps(s);
      navigation.setOptions({ title: t?.name ?? 'Detalle' });
    } catch (err) {
      console.warn('TaskDetail load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteStep(step: Step) {
    Alert.alert('Eliminar paso', `¿Eliminar "${step.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await StepService.delete(step.id);
          loadData();
        },
      },
    ]);
  }

  async function handleToggleStep(step: Step) {
    if (step.status === 'completed') {
      await StepService.uncomplete(step.id);
    } else {
      await StepService.complete(step.id);
    }
    loadData();
  }

  // IA — generar pasos con la descripción guardada (issue #157). "Otra propuesta"
  // re-usa esta misma función reemplazando el borrador completo.
  async function handleGenerateSteps() {
    if (!task || !task.description) return;
    setSuggesting(true);
    setAiError(null);
    setDraft(null);
    try {
      const steps = await AIService.suggestSteps(task.name, task.description);
      setDraft(
        steps.map((step, index) => ({
          key: `ai-${index}`,
          name: step.name,
          durationMin: String(step.duration_min),
        })),
      );
    } catch (err) {
      setAiError(aiErrorMessage(err));
    } finally {
      setSuggesting(false);
    }
  }

  async function handleConfirmSteps() {
    if (!task || !draft || draft.length === 0) return;
    const result = parseDraftSteps(draft);
    if (!result.ok) {
      Alert.alert('Borrador inválido', result.message);
      return;
    }
    setConfirming(true);
    try {
      await StepService.addMany(task.id, result.steps);
      setDraft(null);
      await loadData();
    } catch {
      Alert.alert('Error', 'No se pudieron agregar los pasos. Intentá de nuevo.');
    } finally {
      setConfirming(false);
    }
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const nextIndex = steps.findIndex((s) => s.status === 'pending');
  const totalEstMinutes = steps.reduce((sum, s) => sum + (s.duration_min ?? 0), 0);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.surface,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <ActivityIndicator size="large" color={colors['primary-container']} />
      </View>
    );
  }

  if (!task) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.surface,
        }}
      >
        <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
          No se encontró la tarea.
        </Text>
      </View>
    );
  }

  const formatHours = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0) return `${h}h ${m}m estim.`;
    return `${m}m estim.`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <FlatList
        data={steps}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: contentPaddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={{ gap: spacing['section-gap'] }}>
            {/* Hero section */}
            <View style={{ gap: spacing['stack-gap'] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={[
                    typography['label-sm'],
                    { color: colors.secondary, textTransform: 'uppercase', letterSpacing: 2 },
                  ]}
                >
                  Alta Prioridad
                </Text>
              </View>

              <Text style={[typography['headline-lg-mobile'], { color: colors['on-surface'] }]}>
                {task.name}
              </Text>

              {task.description ? (
                <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
                  {task.description}
                </Text>
              ) : null}

              {/*
                IA — generar pasos con la descripción guardada (issue #157). El gate
                es el mismo de DT-32 (sesión activa + conexión): offline o sin sesión
                no aparece nada y el flujo manual de "+ Agregar paso" queda intacto.
              */}
              {aiVisible && task.description && (
                <View style={{ gap: spacing['stack-gap'] - 4 }}>
                  <Button
                    title="Generar pasos con IA"
                    onPress={handleGenerateSteps}
                    variant="tertiary"
                    disabled={suggesting || confirming}
                    icon={
                      <MaterialCommunityIcons
                        name="creation-outline"
                        size={20}
                        color={colors['on-tertiary']}
                      />
                    }
                  />

                  {(suggesting || !!aiError || !!draft) && (
                    <SuggestedStepsDraft
                      draft={draft}
                      onChangeDraft={setDraft}
                      onRegenerate={handleGenerateSteps}
                      suggesting={suggesting}
                      error={aiError}
                    />
                  )}

                  {draft && draft.length > 0 && (
                    <Button
                      title={
                        confirming
                          ? 'Agregando pasos...'
                          : `Agregar ${draft.length} paso${draft.length === 1 ? '' : 's'} a la tarea`
                      }
                      onPress={handleConfirmSteps}
                      variant="primary"
                      disabled={suggesting || confirming}
                    />
                  )}
                </View>
              )}

              {aiVisible && !task.description && (
                <Button
                  title="Escribí una descripción para usar la IA"
                  onPress={() => navigation.navigate('TaskForm', { task })}
                  variant="secondary"
                  icon={
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color={colors['on-surface-variant']}
                    />
                  }
                />
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16, color: colors['on-surface-variant'] }}>📅</Text>
                  <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Sin fecha'}
                  </Text>
                </View>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors['outline-variant'],
                  }}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16, color: colors['on-surface-variant'] }}>⏱</Text>
                  <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
                    {formatHours(totalEstMinutes)}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={[typography['body-md'], { color: colors['on-surface-variant'] }]}>
                    Progreso general
                  </Text>
                  <Text style={[typography['headline-md'], { color: colors.secondary }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar progress={progress} height={6} color={colors.secondary} />
              </View>
            </View>

            {/* Steps header */}
            <Text
              style={[
                typography['headline-md'],
                { color: colors['on-surface'], marginBottom: spacing['stack-gap'] },
              ]}
            >
              Pasos a seguir
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text
              style={[
                typography['body-md'],
                { color: colors['on-surface-variant'], textAlign: 'center' },
              ]}
            >
              Esta tarea no tiene pasos todavía. Tocá "+" para agregar uno.
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.unit * 3 }} />}
        renderItem={({ item, index }) => (
          <StepItem
            step={item}
            isNext={index === nextIndex}
            onToggle={() => handleToggleStep(item)}
            onPress={() => navigation.navigate('StepForm', { taskId: task.id, stepId: item.id })}
            onLongPress={() => handleDeleteStep(item)}
          />
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            onPress={() => navigation.navigate('StepForm', { taskId: task.id })}
            activeOpacity={0.7}
            style={{
              marginTop: spacing['stack-gap'],
              padding: 14,
              borderRadius: borderRadius.lg,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.secondary,
              alignItems: 'center',
              opacity: 0.6,
            }}
          >
            <Text style={[typography['label-md'], { color: colors.secondary }]}>
              + Agregar paso
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Floating bottom bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: 32,
          paddingTop: 16,
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Focus')}
          activeOpacity={0.9}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingVertical: 16,
            borderRadius: borderRadius.full,
            backgroundColor: colors['tertiary'],
            ...shadows.fab,
          }}
        >
          <Text style={{ fontSize: 20, color: colors['on-tertiary'] }}>▶</Text>
          <Text style={[typography['label-md'], { color: colors['on-tertiary'] }]}>
            Comenzar ahora
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
