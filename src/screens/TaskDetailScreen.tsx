import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../services/TaskService';
import { StepService } from '../services/StepService';
import { Task, Step } from '../types';

type Props = {
  navigation: any;
  route: any;
};

export default function TaskDetailScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);
    const [t, s] = await Promise.all([
      TaskService.getById(taskId),
      StepService.getByTask(taskId),
    ]);
    setTask(t);
    setSteps(s);
    navigation.setOptions({ title: t?.name ?? 'Detalle' });
    setLoading(false);
  }

  async function handleDeleteStep(step: Step) {
    Alert.alert(
      'Eliminar paso',
      `¿Eliminar "${step.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await StepService.delete(step.id);
            loadData();
          },
        },
      ]
    );
  }

  async function handleCompleteTask() {
    if (!task) return;
    const pending = steps.filter(s => s.status === 'pending');
    if (pending.length > 0) {
      Alert.alert(
        'Pasos pendientes',
        `Todavía quedan ${pending.length} paso(s) sin completar. Completalos desde la Vista Foco.`
      );
      return;
    }
    const ok = await TaskService.complete(task.id);
    if (ok) {
      Alert.alert('¡Tarea completada!', 'La tarea se movió al historial.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }

  function getStepIcon(step: Step, index: number): string {
    if (step.status === 'completed') return '✅';
    const isNext = steps.findIndex(s => s.status === 'pending') === index;
    return isNext ? '▶' : '○';
  }

  function getStepColor(step: Step, index: number): string {
    if (step.status === 'completed') return '#94A3B8';
    const isNext = steps.findIndex(s => s.status === 'pending') === index;
    return isNext ? '#2563EB' : '#1A3A5C';
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se encontró la tarea.</Text>
      </View>
    );
  }

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={steps}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View>
            {/* Info de la tarea */}
            <View style={styles.taskCard}>
              <Text style={styles.taskName}>{task.name}</Text>
              {task.due_date && (
                <Text style={styles.dueDate}>
                  📅 Vence el {new Date(task.due_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                </Text>
              )}
              {/* Barra de progreso */}
              {totalCount > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{completedCount}/{totalCount} pasos</Text>
                </View>
              )}
            </View>

            {/* Botones de acción */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => navigation.navigate('TaskForm', { task })}
              >
                <Text style={styles.btnEditText}>✏️ Editar tarea</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnComplete}
                onPress={handleCompleteTask}
              >
                <Text style={styles.btnCompleteText}>✅ Completar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>
              {totalCount === 0 ? 'Sin pasos todavía' : `Pasos (${totalCount})`}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptySteps}>
            <Text style={styles.emptyText}>
              Esta tarea no tiene pasos todavía. Tocá "+ Agregar paso" para dividirla.
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.stepCard,
              item.status === 'completed' && styles.stepCardDone,
              steps.findIndex(s => s.status === 'pending') === index && styles.stepCardNext,
            ]}
            onPress={() => navigation.navigate('StepForm', { taskId: task.id, stepId: item.id })}
            onLongPress={() => handleDeleteStep(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.stepIcon}>{getStepIcon(item, index)}</Text>
            <View style={styles.stepInfo}>
              <Text style={[
                styles.stepName,
                item.status === 'completed' && styles.stepNameDone,
                { color: getStepColor(item, index) }
              ]}>
                {item.name}
              </Text>
              {item.duration_min && (
                <Text style={styles.stepDur}>⏱ {item.duration_min} min</Text>
              )}
            </View>
            {steps.findIndex(s => s.status === 'pending') === index && (
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>ahora</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.btnAddStep}
            onPress={() => navigation.navigate('StepForm', { taskId: task.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.btnAddStepText}>+ Agregar paso</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#64748B', fontSize: 14 },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  taskName: { fontSize: 17, fontWeight: '700', color: '#1A3A5C', marginBottom: 6 },
  dueDate: { fontSize: 13, color: '#64748B', marginBottom: 10 },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: {
    flex: 1, height: 6, backgroundColor: '#E2E8F0',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#64748B', minWidth: 60 },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btnEdit: {
    flex: 1, padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF', alignItems: 'center',
  },
  btnEditText: { fontSize: 13, color: '#64748B' },
  btnComplete: {
    flex: 1, padding: 10, borderRadius: 8,
    backgroundColor: '#DCFCE7', alignItems: 'center',
  },
  btnCompleteText: { fontSize: 13, color: '#166534', fontWeight: '600' },
  sectionTitle: {
    fontSize: 12, color: '#94A3B8', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  emptySteps: { padding: 16 },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  stepCard: {
    backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 0.5, borderColor: '#E2E8F0', elevation: 1,
  },
  stepCardDone: { backgroundColor: '#F8FAFF', borderColor: '#E2E8F0' },
  stepCardNext: { borderColor: '#2563EB', borderWidth: 1.5, backgroundColor: '#EFF6FF' },
  stepIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  stepInfo: { flex: 1 },
  stepName: { fontSize: 14, fontWeight: '500' },
  stepNameDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  stepDur: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  nextBadge: {
    backgroundColor: '#2563EB', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  nextBadgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  btnAddStep: {
    marginTop: 12, padding: 14, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#2563EB',
    borderStyle: 'dashed', alignItems: 'center',
  },
  btnAddStepText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
});