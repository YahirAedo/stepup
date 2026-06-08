import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Vibration
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../services/TaskService';
import { StepService } from '../services/StepService';
import { ProgressService } from '../services/ProgressService';
import { TimerService } from '../services/TimerService';
import { Task, Step } from '../types';

type Props = { navigation: any };

export default function FocusScreen({ navigation }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [nextStep, setNextStep] = useState<Step | null>(null);
  const [stepsToday, setStepsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Timer
  const [timerDisplay, setTimerDisplay] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFocus();
      return () => TimerService.stop(); // limpiar timer al salir
    }, [])
  );

  async function loadFocus() {
    setLoading(true);
    TimerService.stop();
    setTimerRunning(false);
    setTimerFinished(false);
    setTimerDisplay('');

    const tasks = await TaskService.getAll();
    const today = await ProgressService.getToday();
    setStepsToday(today);

    if (tasks.length === 0) {
      setActiveTask(null);
      setNextStep(null);
      setLoading(false);
      return;
    }

    // Buscar la primera tarea con pasos pendientes
    for (const task of tasks) {
      const step = await StepService.getNextPending(task.id);
      if (step) {
        setActiveTask(task);
        setNextStep(step);
        // Inicializar display del timer sin arrancarlo
        if (step.duration_min) {
          setTimerDisplay(TimerService.format(step.duration_min * 60));
        } else {
          setTimerDisplay('00:00');
        }
        setLoading(false);
        return;
      }
    }

    // No hay pasos pendientes en ninguna tarea
    setActiveTask(null);
    setNextStep(null);
    setLoading(false);
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
        (state) => {
          setTimerDisplay(TimerService.format(state.seconds));
          setTimerRunning(state.running);
          setTimerFinished(state.finished);
        },
        () => {
          // Timer terminó
          Vibration.vibrate(500);
          Alert.alert('⏰ ¡Tiempo!', '¿Completaste el paso?', [
            { text: 'Todavía no', style: 'cancel' },
            { text: 'Sí, completar', onPress: () => handleComplete() },
          ]);
        }
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
          [{ text: '¡Genial!', onPress: () => loadFocus() }]
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

  // ── Estados de la pantalla ────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Sin tareas
  if (!activeTask) {
    return (
      <View style={styles.container}>
        <View style={styles.counterRow}>
          <View style={styles.counterCard}>
            <Text style={styles.counterNum}>{stepsToday}</Text>
            <Text style={styles.counterLabel}>pasos hoy</Text>
          </View>
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No hay pasos pendientes</Text>
          <Text style={styles.emptyText}>
            Creá una tarea y dividila en pasos para empezar.
          </Text>
          <TouchableOpacity
            style={styles.btnGoTasks}
            onPress={() => navigation.navigate('Tasks')}
          >
            <Text style={styles.btnGoTasksText}>Ir a Tareas</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Contador diario */}
      <View style={styles.counterRow}>
        <View style={styles.counterCard}>
          <Text style={styles.counterNum}>{stepsToday}</Text>
          <Text style={styles.counterLabel}>pasos hoy</Text>
        </View>
        <TouchableOpacity
          style={styles.counterCard}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Text style={styles.counterNumSmall}>{activeTask.name}</Text>
          <Text style={styles.counterLabel}>tarea activa</Text>
        </TouchableOpacity>
      </View>

      {/* Caja del próximo paso */}
      <View style={styles.focusBox}>
        <Text style={styles.focusLabel}>PRÓXIMO PASO</Text>
        <Text style={styles.focusStep}>{nextStep?.name}</Text>
        {nextStep?.duration_min && (
          <Text style={styles.focusDur}>⏱ {nextStep.duration_min} min estimados</Text>
        )}

        {/* Timer */}
        <Text style={[
          styles.timerDisplay,
          timerFinished && styles.timerFinished
        ]}>
          {timerDisplay || '—'}
        </Text>

        <TouchableOpacity
          style={[styles.btnTimer, timerRunning && styles.btnTimerActive]}
          onPress={handleToggleTimer}
          disabled={timerFinished}
          activeOpacity={0.8}
        >
          <Text style={styles.btnTimerText}>
            {timerFinished ? '⏰ Tiempo terminado' :
             timerRunning ? '⏸ Pausar timer' : '▶ Iniciar timer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botón completar */}
      <TouchableOpacity
        style={[styles.btnComplete, completing && styles.btnDisabled]}
        onPress={handleComplete}
        disabled={completing}
        activeOpacity={0.85}
      >
        <Text style={styles.btnCompleteText}>
          {completing ? 'Guardando...' : '✓  Completé este paso'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSkip}
        onPress={() => navigation.navigate('Tasks')}
      >
        <Text style={styles.btnSkipText}>Ver todas mis tareas</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  counterRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  counterCard: {
    flex: 1, backgroundColor: '#1A3A5C', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  counterNum: { fontSize: 28, fontWeight: '700', color: '#93C5FD' },
  counterNumSmall: {
    fontSize: 12, fontWeight: '600', color: '#93C5FD',
    textAlign: 'center', numberOfLines: 1,
  } as any,
  counterLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  focusBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 24, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#E2E8F0',
    elevation: 3, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  focusLabel: {
    fontSize: 11, color: '#94A3B8', fontWeight: '600',
    letterSpacing: 1, marginBottom: 12,
  },
  focusStep: {
    fontSize: 20, fontWeight: '600', color: '#1A3A5C',
    textAlign: 'center', lineHeight: 28, marginBottom: 8,
  },
  focusDur: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  timerDisplay: {
    fontSize: 42, fontWeight: '300', color: '#2563EB',
    marginVertical: 12, letterSpacing: 2,
  },
  timerFinished: { color: '#F59E0B' },
  btnTimer: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFF',
  },
  btnTimerActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  btnTimerText: { fontSize: 13, color: '#64748B' },

  btnComplete: {
    backgroundColor: '#2563EB', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnCompleteText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  btnSkip: {
    padding: 14, alignItems: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  btnSkipText: { fontSize: 14, color: '#64748B' },

  emptyBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18, fontWeight: '600', color: '#1A3A5C',
    marginBottom: 8, textAlign: 'center',
  },
  emptyText: {
    fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  btnGoTasks: {
    backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 28, paddingVertical: 12,
  },
  btnGoTasksText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});