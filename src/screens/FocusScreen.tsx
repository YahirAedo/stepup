import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Vibration,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../services/TaskService';
import { StepService } from '../services/StepService';
import { ProgressService } from '../services/ProgressService';
import { TimerService } from '../services/TimerService';
import { Task, Step } from '../types';
import { colors, typography, spacing, scale } from '../theme';
import Button from '../components/Button';
import Card from '../components/Card';
import TimerWidget from '../components/TimerWidget';
import EmptyState from '../components/EmptyState';

type Props = { navigation: any };

export default function FocusScreen({ navigation }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [nextStep, setNextStep] = useState<Step | null>(null);
  const [stepsToday, setStepsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const [timerDisplay, setTimerDisplay] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFocus();
      return () => TimerService.stop();
    }, []),
  );

  async function loadFocus() {
    setLoading(true);
    TimerService.stop();
    setTimerRunning(false);
    setTimerFinished(false);
    setTimerDisplay('');

    try {
      const tasks = await TaskService.getAll();
      const today = await ProgressService.getToday();
      setStepsToday(today);

      if (tasks.length === 0) {
        setActiveTask(null);
        setNextStep(null);
        setLoading(false);
        return;
      }

      for (const task of tasks) {
        const step = await StepService.getNextPending(task.id);
        if (step) {
          setActiveTask(task);
          setNextStep(step);
          if (step.duration_min) {
            setTimerDisplay(TimerService.format(step.duration_min * 60));
          } else {
            setTimerDisplay('00:00');
          }
          setLoading(false);
          return;
        }
      }

      setActiveTask(null);
      setNextStep(null);
    } catch (err) {
      console.warn('Focus load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleTimer() {
    if (!nextStep) return;
    if (timerFinished) return;

    if (timerRunning) {
      TimerService.pause();
      setTimerRunning(false);
    } else {
      TimerService.start(
        nextStep.duration_min,
        (s) => {
          setTimerDisplay(TimerService.format(s.seconds));
          setTimerRunning(s.running);
          setTimerFinished(s.finished);
        },
        () => {
          Vibration.vibrate(500);
          Alert.alert('⏰ ¡Tiempo!', '¿Completaste el paso?', [
            { text: 'Todavía no', style: 'cancel' },
            { text: 'Sí, completar', onPress: () => handleComplete() },
          ]);
        },
      );
      setTimerRunning(true);
    }
  }

  async function handleComplete() {
    if (!nextStep || completing) return;
    setCompleting(true);
    TimerService.stop();
    setTimerRunning(false);

    try {
      const { nextStep: next, taskCompleted } = await StepService.complete(nextStep.id);
      const today = await ProgressService.getToday();
      setStepsToday(today);

      if (taskCompleted) {
        Alert.alert(
          '🎉 ¡Tarea completada!',
          `Terminaste "${activeTask?.name}". Pasó al historial.`,
          [{ text: '¡Genial!', onPress: () => loadFocus() }],
        );
      } else if (next) {
        setNextStep(next);
        setTimerFinished(false);
        setTimerRunning(false);
        if (next.duration_min) {
          setTimerDisplay(TimerService.format(next.duration_min * 60));
        } else {
          setTimerDisplay('00:00');
        }
      } else {
        loadFocus();
      }
    } finally {
      setCompleting(false);
    }
  }

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

  if (!activeTask) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            padding: spacing['container-padding'],
            paddingBottom: 0,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors['primary-container'],
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: '700', color: colors['on-primary-container'] }}
            >
              {stepsToday}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors['on-primary-container'],
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              pasos hoy
            </Text>
          </View>
        </View>
        <EmptyState
          headline="Mente clara, espacio libre"
          subtext="No tienes tareas pendientes para ahora. ¿Quieres planear algo nuevo?"
          cta="Crear Tarea"
          onCtaPress={() => navigation.navigate('Tasks', { screen: 'TaskForm' })}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      {/* Ambient gradient blurs */}
      <View style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <View
          style={{
            position: 'absolute',
            top: scale(-80),
            left: scale(-80),
            width: scale(320),
            height: scale(320),
            borderRadius: scale(320) / 2,
            backgroundColor: `${colors['tertiary-fixed-dim']}33`,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: scale(160),
            right: scale(-80),
            width: scale(384),
            height: scale(384),
            borderRadius: scale(384) / 2,
            backgroundColor: `${colors['tertiary-container']}1A`,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing['container-padding'],
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Counter row */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: spacing['section-gap'],
            marginTop: 16,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors['primary-container'],
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: '700', color: colors['on-primary-container'] }}
            >
              {stepsToday}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors['on-primary-container'],
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              pasos hoy
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors['secondary-container'],
              borderRadius: 12,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors['on-secondary-container'],
                textAlign: 'center',
              }}
            >
              {activeTask.name}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors['on-secondary-container'],
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              tarea activa
            </Text>
          </View>
        </View>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing['section-gap'] }}>
          <Text
            style={[
              typography['headline-lg-mobile'],
              { color: colors['on-surface'], marginBottom: spacing.unit * 2 },
            ]}
          >
            Un paso a la vez
          </Text>
          <Text
            style={[typography['body-md'], { color: colors['on-surface-variant'], opacity: 0.7 }]}
          >
            Focus • Azul
          </Text>
        </View>

        {/* Timer widget */}
        <View style={{ alignItems: 'center', marginBottom: spacing['section-gap'] }}>
          <TimerWidget display={timerDisplay || '—'} finished={timerFinished} />
        </View>

        {/* Current task card */}
        <Card style={{ marginBottom: spacing['stack-gap'] }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${colors.tertiary}1A`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20, color: colors.tertiary }}>📄</Text>
              </View>
              <View>
                <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
                  Tarea actual
                </Text>
                <Text
                  style={[
                    typography['body-lg'],
                    { fontWeight: '700', color: colors['on-surface'], marginTop: 2 },
                  ]}
                >
                  {nextStep?.name}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action buttons */}
        <View style={{ marginTop: 'auto', gap: spacing['stack-gap'] }}>
          <Button
            title={
              timerFinished
                ? '⏰ Tiempo terminado'
                : timerRunning
                  ? '⏸ Pausar Sesión'
                  : '▶ Iniciar Cronómetro'
            }
            onPress={handleToggleTimer}
            variant={timerRunning ? 'tertiary' : 'primary'}
            disabled={timerFinished}
          />

          <Button
            title={completing ? 'Guardando...' : '✓ Completé este paso'}
            onPress={handleComplete}
            variant="secondary"
            disabled={completing}
          />

          <Text
            style={[
              typography['label-sm'],
              { color: colors['on-surface-variant'], textAlign: 'center', opacity: 0.6 },
            ]}
          >
            Toque para comenzar su sesión de calma
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
