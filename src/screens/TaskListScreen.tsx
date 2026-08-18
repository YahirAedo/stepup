import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TasksStackParamList } from '../types/navigation';
import { TaskService } from '../services/TaskService';
import { StepService } from '../services/StepService';
import { ProgressService } from '../services/ProgressService';
import { Task } from '../types';
import { colors, typography, spacing, borderRadius, shadows, useBottomLayout } from '../theme';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskList'>;

interface TaskWithProgress extends Task {
  stepsTotal: number;
  stepsCompleted: number;
}

export default function TaskListScreen({ navigation }: Props) {
  const { contentPaddingBottomWithFab } = useBottomLayout();
  const [tasks, setTasks] = useState<TaskWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepsToday, setStepsToday] = useState(0);
  const [weekData, setWeekData] = useState<{ date: string; count: number }[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  async function loadData() {
    setLoading(true);
    const raw = await TaskService.getAll();
    const withSteps: TaskWithProgress[] = await Promise.all(
      raw.map(async (t) => {
        const counts = await StepService.getStepCounts(t.id);
        return { ...t, stepsTotal: counts.total, stepsCompleted: counts.completed };
      }),
    );
    const today = await ProgressService.getToday();
    const week = await ProgressService.getWeek();
    setTasks(withSteps);
    setStepsToday(today);
    setWeekData(week);
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
            loadData();
          },
        },
      ],
    );
  }

  function formatDueDate(due_date: string | null): string {
    if (!due_date) return '';
    const date = new Date(due_date);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  }

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const featured = activeTasks[0];
  const secondary = activeTasks.slice(1, 3);

  const maxWeekCount = Math.max(1, ...weekData.map((d) => d.count));
  const shortDayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  function getDayLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return shortDayLabels[new Date(y, m - 1, d).getDay()];
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

  if (tasks.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <EmptyState
          headline="No tenés tareas todavía"
          subtext="Tocá el botón + para agregar tu primera tarea y dividirla en pasos."
          cta="Crear Tarea"
          onCtaPress={() => navigation.navigate('TaskForm', {})}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPaddingBottomWithFab }}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing['container-padding'],
            paddingTop: 16,
            paddingBottom: spacing['stack-gap'],
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={[typography['headline-md'], { color: colors.primary }]}>StepUp</Text>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors['surface-variant'],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero section */}
        <View
          style={{
            paddingHorizontal: spacing['container-padding'],
            marginBottom: spacing['section-gap'],
          }}
        >
          <Text
            style={[
              typography['label-sm'],
              {
                color: colors.secondary,
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: spacing.unit,
              },
            ]}
          >
            Gestión Activa
          </Text>
          <Text
            style={[
              typography['headline-lg-mobile'],
              { color: colors['on-surface'], marginBottom: spacing.unit },
            ]}
          >
            Tareas en curso
          </Text>
          <Text
            style={[
              typography['body-md'],
              { color: colors['on-surface-variant'], marginBottom: spacing['stack-gap'] },
            ]}
          >
            {stepsToday > 0
              ? `${stepsToday} paso${stepsToday !== 1 ? 's' : ''} completado${stepsToday !== 1 ? 's' : ''} hoy`
              : 'Organiza tus proyectos con precisión Zen.'}
          </Text>
          {stepsToday > 0 && (
            <View style={{ flexDirection: 'row', gap: spacing.unit }}>
              <View
                style={{
                  backgroundColor: colors['secondary-fixed'],
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: borderRadius.full,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 14 }}>🚀</Text>
                <Text style={[typography['label-md'], { color: colors['on-secondary-fixed'] }]}>
                  {stepsToday} Completado hoy
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Featured card */}
        {featured && (
          <View
            style={{
              paddingHorizontal: spacing['container-padding'],
              marginBottom: spacing['stack-gap'],
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetail', { taskId: featured.id })}
              onLongPress={() => handleDelete(featured)}
              activeOpacity={0.85}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: borderRadius.xl + 8,
                padding: 32,
                overflow: 'hidden',
                ...shadows.ambient,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  right: -40,
                  top: -40,
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: `${colors.secondary}0D`,
                }}
              />
              <View style={{ position: 'relative', zIndex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 24,
                  }}
                >
                  <Badge label="Urgente" variant="urgent" />
                  <Text style={{ fontSize: 20 }}>⋯</Text>
                </View>
                <Text
                  style={[
                    typography['headline-md'],
                    { color: colors['on-surface'], marginBottom: spacing.unit * 2 },
                  ]}
                >
                  {featured.name}
                </Text>
                <Text
                  style={[
                    typography['body-md'],
                    { color: colors['on-surface-variant'], marginBottom: 48 },
                  ]}
                >
                  {featured.stepsTotal > 0
                    ? `${featured.stepsTotal - featured.stepsCompleted} paso${featured.stepsTotal - featured.stepsCompleted !== 1 ? 's' : ''} pendiente${featured.stepsTotal - featured.stepsCompleted !== 1 ? 's' : ''}`
                    : 'Sin pasos definidos'}
                </Text>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.unit,
                    }}
                  >
                    <Text style={[typography['label-md'], { color: colors.secondary }]}>
                      {featured.stepsTotal > 0
                        ? `${featured.stepsTotal - featured.stepsCompleted} pasos pendientes`
                        : '—'}
                    </Text>
                    <Text style={[typography['label-sm'], { color: colors['on-surface-variant'] }]}>
                      {featured.stepsTotal > 0
                        ? `${Math.round((featured.stepsCompleted / featured.stepsTotal) * 100)}%`
                        : '—'}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={
                      featured.stepsTotal > 0 ? featured.stepsCompleted / featured.stepsTotal : 0
                    }
                    color={colors.secondary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Secondary cards grid */}
        {secondary.length > 0 && (
          <View
            style={{
              paddingHorizontal: spacing['container-padding'],
              marginBottom: spacing['stack-gap'],
            }}
          >
            <View style={{ flexDirection: 'row', gap: spacing['stack-gap'] }}>
              {secondary.map((task, i) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  onLongPress={() => handleDelete(task)}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    backgroundColor: i === 0 ? `${colors['secondary-fixed']}33` : '#FFFFFF',
                    borderRadius: borderRadius.xl + 8,
                    padding: 24,
                    borderWidth: i === 0 ? 1 : 0,
                    borderColor: `${colors['secondary-fixed']}4D`,
                    ...shadows.ambient,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 24,
                    }}
                  >
                    <Text style={{ fontSize: 20, color: colors.secondary }}>📖</Text>
                  </View>
                  <Text
                    style={[
                      typography['headline-md'],
                      { color: colors['on-surface'], fontSize: 18, marginBottom: spacing.unit },
                    ]}
                  >
                    {task.name}
                  </Text>
                  <Text style={[typography['label-md'], { color: `${colors.secondary}CC` }]}>
                    {task.stepsTotal - task.stepsCompleted} paso
                    {task.stepsTotal - task.stepsCompleted !== 1 ? 's' : ''} pendiente
                    {task.stepsTotal - task.stepsCompleted !== 1 ? 's' : ''}
                  </Text>
                  <View style={{ marginTop: 24 }}>
                    <ProgressBar
                      progress={task.stepsTotal > 0 ? task.stepsCompleted / task.stepsTotal : 0}
                      color={colors.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                      style={{
                        marginTop: 12,
                        paddingVertical: 8,
                        backgroundColor: colors.secondary,
                        borderRadius: borderRadius.full,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={[typography['label-md'], { color: '#FFFFFF' }]}>Continuar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Pending tasks list */}
        {activeTasks.length > 2 && (
          <View
            style={{
              paddingHorizontal: spacing['container-padding'],
              marginBottom: spacing['stack-gap'],
            }}
          >
            <Text
              style={[
                typography['label-sm'],
                {
                  color: colors['on-surface-variant'],
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: spacing['stack-gap'],
                },
              ]}
            >
              Pendientes
            </Text>
            <View style={{ gap: spacing['stack-gap'] }}>
              {activeTasks.slice(2, 4).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  onLongPress={() => handleDelete(task)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: borderRadius.xl + 8,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing['stack-gap'],
                    borderWidth: 1,
                    borderColor: colors['surface-container'],
                    ...shadows.ambient,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: `${colors.secondary}33`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.secondary,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[typography['label-md'], { color: colors['on-surface'] }]}
                      numberOfLines={1}
                    >
                      {task.name}
                    </Text>
                    <Text style={[typography['label-sm'], { color: colors['on-surface-variant'] }]}>
                      {formatDueDate(task.due_date) || 'Sin fecha'}
                    </Text>
                  </View>
                  <View style={{ width: 60 }}>
                    <ProgressBar
                      progress={task.stepsTotal > 0 ? task.stepsCompleted / task.stepsTotal : 0}
                      color={colors.secondary}
                    />
                  </View>
                </TouchableOpacity>
              ))}

              {/* New task button */}
              <TouchableOpacity
                onPress={() => navigation.navigate('TaskForm', {})}
                activeOpacity={0.7}
                style={{
                  backgroundColor: colors['surface-container-low'],
                  borderRadius: borderRadius.xl + 8,
                  padding: 20,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors['outline-variant'],
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 72,
                  flexDirection: 'row',
                  gap: spacing.unit * 2,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors['primary-container'],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#FFFFFF', transform: [{ translateY: -2 }] }}>
                    +
                  </Text>
                </View>
                <Text style={[typography['label-md'], { color: colors['on-surface-variant'] }]}>
                  Nueva Tarea
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Activity visualizer */}
        <View
          style={{
            paddingHorizontal: spacing['container-padding'],
            marginBottom: spacing['section-gap'],
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: borderRadius.xl + 8,
              padding: 24,
              ...shadows.ambient,
            }}
          >
            <Text
              style={[
                typography['label-sm'],
                {
                  color: colors['on-surface-variant'],
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginBottom: 16,
                },
              ]}
            >
              Ritmo Semanal
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 }}>
              {weekData.map((day, i) => {
                const pct = day.count / maxWeekCount;
                const isToday = i === 6;
                return (
                  <View key={day.date} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View
                      style={{
                        width: '100%',
                        height: Math.max(4, pct * 72),
                        backgroundColor: isToday ? colors.primary : colors['secondary-fixed'],
                        borderRadius: 2,
                      }}
                    />
                    <Text
                      style={{ fontSize: 10, color: colors['on-surface-variant'], opacity: 0.6 }}
                    >
                      {getDayLabel(day.date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Next steps list */}
        <View style={{ paddingHorizontal: spacing['container-padding'] }}>
          <Text
            style={[
              typography['headline-md'],
              { color: colors['on-surface'], marginBottom: spacing['stack-gap'] },
            ]}
          >
            Siguientes pasos
          </Text>
          {activeTasks.slice(0, 5).map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: spacing['stack-gap'],
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: borderRadius.lg,
                marginBottom: spacing.unit,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing['stack-gap'],
                  flex: 1,
                }}
              >
                <Text style={{ fontSize: 20, color: colors['on-surface-variant'] }}>⬜</Text>
                <Text
                  style={[typography['body-md'], { color: colors['on-surface'], flex: 1 }]}
                  numberOfLines={1}
                >
                  {task.name}
                </Text>
              </View>
              <Text style={[typography['label-sm'], { color: colors['on-surface-variant'] }]}>
                {task.stepsTotal - task.stepsCompleted} paso
                {task.stepsTotal - task.stepsCompleted !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        </ScrollView>
      </View>
  );
}
