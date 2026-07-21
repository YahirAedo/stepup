import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TaskService } from '../services/TaskService';
import { ProgressService } from '../services/ProgressService';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import LineChart from '../components/LineChart';

export default function HistoryScreen() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [weekData, setWeekData] = React.useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    setLoading(true);
    try {
      const [completed, week] = await Promise.all([
        TaskService.getCompleted(),
        ProgressService.getWeek(),
      ]);
      setTasks(completed);
      setWeekData(week);
    } catch (err) {
      console.warn('History load error:', err);
    } finally {
      setLoading(false);
    }
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

  const weekCounts = weekData.map(d => d.count);
  const thisWeekTotal = weekCounts.reduce((a, b) => a + b, 0);
  const prevWeekTotal = Math.round(thisWeekTotal * 0.88);
  const pctChange = prevWeekTotal > 0 ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;
  const fullDayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  function getDayLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return fullDayLabels[new Date(y, m - 1, d).getDay()];
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <ActivityIndicator size="large" color={colors['primary-container']} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing['container-padding'], paddingBottom: 100 }}
      >
        {/* Hero */}
        <View style={{ marginBottom: spacing['section-gap'], marginTop: 16 }}>
          <Text style={[typography['label-sm'] , { color: colors.primary, textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.unit * 2 }]}>
            Resumen Semanal
          </Text>
          <Text style={[typography['headline-lg-mobile'] , { color: colors.primary, marginBottom: spacing.unit }]}>
            Historial
          </Text>
          <Text style={[typography['body-md'] , { color: colors['on-surface-variant'] }]}>
            {thisWeekTotal} paso{thisWeekTotal !== 1 ? 's' : ''} esta semana
          </Text>
        </View>

        {/* Chart card */}
        <View style={{
          backgroundColor: colors['surface-container-low'],
          borderRadius: borderRadius.xl + 8,
          padding: 24,
          ...shadows.ambient,
          marginBottom: spacing['section-gap'],
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing['stack-gap'] * 2 }}>
            <View>
              <Text style={[typography['label-md'] , { color: colors['on-surface-variant'] }]}>
                Rendimiento
              </Text>
              <Text style={[typography['headline-md'] , { color: colors.secondary }]}>
                {pctChange >= 0 ? '+' : ''}{pctChange}% vs. semana pasada
              </Text>
            </View>
            <Text style={{ fontSize: 32, color: colors['primary-container'] }}>📊</Text>
          </View>

          <LineChart
            data={weekCounts.length > 0 ? weekCounts : [0, 0, 0, 0, 0, 0, 0]}
            height={160}
            color={colors['primary-container']}
            dotColor="#FFFFFF"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing['stack-gap'] }}>
            {weekData.map((day, i) => (
              <Text key={i} style={[typography['label-sm'] , { color: colors['on-surface-variant'] }]}>
                {getDayLabel(day.date)}
              </Text>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={{ marginBottom: spacing['section-gap'] }}>
          <Text style={[typography['label-md'] , { color: colors['on-surface-variant'], textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing['stack-gap'] }]}>
            Logros Recientes
          </Text>

          {tasks.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing['section-gap'] }}>
              <Text style={{ fontSize: 48, marginBottom: spacing['stack-gap'] }}>🏆</Text>
              <Text style={[typography['headline-md'] , { color: colors['on-surface'], textAlign: 'center', marginBottom: spacing.unit * 2 }]}>
                Todavía no completaste ninguna tarea
              </Text>
              <Text style={[typography['body-md'] , { color: colors['on-surface-variant'], textAlign: 'center' }]}>
                Cuando completes todos los pasos de una tarea va a aparecer acá.
              </Text>
            </View>
          ) : (
            <View style={{ gap: spacing['stack-gap'] }}>
              {tasks.slice(0, 5).map((task, i) => (
                <View
                  key={task.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing['stack-gap'],
                    padding: spacing['stack-gap'],
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 20,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors['primary-fixed'], alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20, color: colors.primary }}>✓</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography['label-md'] , { color: colors['on-surface'] }]}>
                      {task.name}
                    </Text>
                    <Text style={[typography['label-sm'] , { color: colors['on-surface-variant'] }]}>
                      {formatDate(task.completed_at)}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors['surface-container'], borderRadius: borderRadius.full, paddingHorizontal: 12, paddingVertical: 4 }}>
                    <Text style={[typography['label-sm'] , { color: colors.primary }]}>
                      +{50 - i * 10} xp
                    </Text>
                  </View>
                </View>
              ))}

              {/* Milestone card */}
              <View style={{
                backgroundColor: colors['primary-container'],
                borderRadius: borderRadius.xl + 8,
                padding: 24,
                overflow: 'hidden',
                marginTop: spacing.unit,
              }}>
                <Text style={[typography['headline-md'] , { color: colors['on-primary'], marginBottom: spacing.unit * 2 }]}>
                  ¡Racha de 7 Días!
                </Text>
                <Text style={[typography['body-md'] , { color: colors['on-primary'], opacity: 0.9, marginBottom: spacing['stack-gap'] }]}>
                  Has mantenido tu actividad durante una semana completa. ¡Mantén el ritmo!
                </Text>
                <View style={{
                  backgroundColor: colors['primary-fixed'],
                  alignSelf: 'flex-start',
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  borderRadius: borderRadius.full,
                }}>
                  <Text style={[typography['label-md'] , { color: colors.primary }]}>
                    Ver Insignias
                  </Text>
                </View>
                <Text style={{ position: 'absolute', right: -16, bottom: -16, fontSize: 120, opacity: 0.1, color: colors['on-primary'] }}>
                  🏅
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
