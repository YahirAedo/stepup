import React, { useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../services/TaskService';
import { ProgressService } from '../services/ProgressService';
import { Task } from '../types';

export default function HistoryScreen() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [stepsToday, setStepsToday] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    setLoading(true);
    const [completed, today] = await Promise.all([
      TaskService.getCompleted(),
      ProgressService.getToday(),
    ]);
    setTasks(completed);
    setStepsToday(today);
    setLoading(false);
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
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
      <FlatList
        data={tasks}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{stepsToday}</Text>
            <Text style={styles.summaryLabel}>pasos completados hoy</Text>
            <Text style={styles.summaryTotal}>
              {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} completada{tasks.length !== 1 ? 's' : ''} en total
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyTitle}>Todavía no completaste ninguna tarea</Text>
            <Text style={styles.emptyText}>
              Cuando completes todos los pasos de una tarea va a aparecer acá.
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>✅</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.taskName}>{item.name}</Text>
              <Text style={styles.taskMeta}>
                Completada {formatDate(item.completed_at)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryCard: {
    backgroundColor: '#1A3A5C', borderRadius: 14,
    padding: 20, alignItems: 'center', marginBottom: 16,
  },
  summaryNum: { fontSize: 40, fontWeight: '700', color: '#93C5FD' },
  summaryLabel: { fontSize: 13, color: '#CBD5E1', marginTop: 2, marginBottom: 8 },
  summaryTotal: { fontSize: 12, color: '#64748B' },
  empty: {
    flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 16, fontWeight: '600', color: '#1A3A5C',
    textAlign: 'center', marginBottom: 8,
  },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 0.5, borderColor: '#E2E8F0', elevation: 1,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '600', color: '#1A3A5C', marginBottom: 3 },
  taskMeta: { fontSize: 12, color: '#94A3B8' },
});