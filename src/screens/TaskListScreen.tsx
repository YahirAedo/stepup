import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskService } from '../services/TaskService';
import { Task } from '../types';

// Tipos de navegación — los vamos a expandir cuando agreguemos más pantallas
export type RootStackParamList = {
  MainTabs: undefined;
  TaskForm: { task?: Task };
  TaskDetail: { taskId: number };
  StepForm: { taskId: number; stepId?: number };
};

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function TaskListScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Se ejecuta cada vez que la pantalla toma foco (al volver de TaskForm, etc.)
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  async function loadTasks() {
    setLoading(true);
    const data = await TaskService.getAll();
    setTasks(data);
    setLoading(false);
  }

  async function handleDelete(task: Task) {
    Alert.alert(
      'Eliminar tarea',
      `¿Seguro que querés eliminar "${task.name}"? Se van a eliminar también todos sus pasos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await TaskService.delete(task.id);
            loadTasks();
          },
        },
      ]
    );
  }

  function formatDueDate(due_date: string | null): string {
    if (!due_date) return '';
    const date = new Date(due_date);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  }

  function isDueSoon(due_date: string | null): boolean {
    if (!due_date) return false;
    const diff = new Date(due_date).getTime() - Date.now();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000; // 3 días
  }

  function isOverdue(due_date: string | null): boolean {
    if (!due_date) return false;
    return new Date(due_date).getTime() < Date.now();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tasks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No tenés tareas todavía</Text>
          <Text style={styles.emptyText}>
            Tocá el botón + para agregar tu primera tarea y dividirla en pasos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.taskName} numberOfLines={2}>{item.name}</Text>
                {item.due_date && (
                  <View style={[
                    styles.badge,
                    isOverdue(item.due_date) ? styles.badgeRed :
                    isDueSoon(item.due_date) ? styles.badgeYellow :
                    styles.badgeBlue
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      isOverdue(item.due_date) ? styles.badgeTextRed :
                      isDueSoon(item.due_date) ? styles.badgeTextYellow :
                      styles.badgeTextBlue
                    ]}>
                      {isOverdue(item.due_date) ? 'Vencida' : formatDueDate(item.due_date)}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.hint}>Tocá para ver los pasos</Text>
                <Text style={styles.hint}>Mantené para eliminar</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Botón flotante para crear tarea */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskForm', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A3A5C',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A3A5C',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeBlue:   { backgroundColor: '#EFF6FF' },
  badgeYellow: { backgroundColor: '#FEF9C3' },
  badgeRed:    { backgroundColor: '#FEE2E2' },
  badgeText:   { fontSize: 11, fontWeight: '500' },
  badgeTextBlue:   { color: '#1D4ED8' },
  badgeTextYellow: { color: '#854D0E' },
  badgeTextRed:    { color: '#991B1B' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
});