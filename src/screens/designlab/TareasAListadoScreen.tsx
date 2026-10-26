// ⚠️ DESIGN: preview para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, Text as RNText, Pressable, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import FilterPills, { type FilterPillOption } from '../../components/designlab/FilterPills';
import FeaturedTaskCard from '../../components/designlab/FeaturedTaskCard';
import QueueTaskRow, { type QueueTaskItem, type QueueTaskStatus } from '../../components/designlab/QueueTaskRow';
import { type StepSegmentStatus } from '../../components/designlab/SegmentedProgressBar';
import { mci } from '../../components/designlab/mciIconMap';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  sereneBorderRadius,
  withAlpha,
  useResponsive,
} from '../../theme/serene';
import type { ProfileStackParamList } from '../../types/navigation';
import { deriveTaskCategory, pickFocusTask, type TaskCategory } from '../../utils/designlab/deriveTaskCategory';
import { formatDueDate } from '../../utils/designlab/dueDate';
import { flujoAListadoFixtures, type FlujoACategoryKey } from './tareasFlujoAFixtures';

const CATEGORY_ORDER: FlujoACategoryKey[] = ['inProgress', 'notStarted', 'completed'];

/**
 * Variante A "Enfoque" — Tareas / Listado.
 *
 * La categoría de cada tarea (En curso / Por empezar / Completadas) y la tarea
 * "En foco" se DERIVAN de los pasos (sin estado guardado). Los filtros filtran
 * de verdad la cola. Un solo CTA principal: "Reanudar foco".
 */
export default function TareasAListadoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'TareasAListado'>>();
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();
  const [activeFilter, setActiveFilter] = useState<FlujoACategoryKey>('inProgress');

  const f = flujoAListadoFixtures;
  const { tasks, copy } = f;

  const whisperColor = withAlpha(sereneColors['on-surface-variant'], 0.6);

  const categories = useMemo<TaskCategory[]>(
    () => tasks.map((task) => deriveTaskCategory(task.steps)),
    [tasks],
  );

  const counts = useMemo(() => {
    const base: Record<FlujoACategoryKey, number> = { inProgress: 0, notStarted: 0, completed: 0 };
    categories.forEach((category) => {
      base[category] += 1;
    });
    return base;
  }, [categories]);

  const focusIndex = useMemo(() => pickFocusTask(tasks), [tasks]);

  const completedSteps = useMemo(
    () =>
      tasks.reduce(
        (acc, task) => acc + task.steps.filter((step) => step.status === 'completed').length,
        0,
      ),
    [tasks],
  );

  const filterOptions: FilterPillOption<FlujoACategoryKey>[] = CATEGORY_ORDER.map((key) => ({
    key,
    label: copy.categoryLabels[key],
    count: counts[key],
  }));

  const handleFilterChange = useCallback((key: FlujoACategoryKey) => {
    setActiveFilter(key);
  }, []);

  const focus = useMemo(() => {
    if (focusIndex === null) return null;
    const task = tasks[focusIndex];
    const total = task.steps.length;
    if (total === 0) return null;
    const found = task.steps.findIndex((step) => step.status === 'pending');
    const currentIndex = found < 0 ? total - 1 : found;
    const currentStep = task.steps[currentIndex];
    return {
      badge: copy.focusBadge,
      minutesLabel: `~${currentStep.minutes} ${copy.focusMinutesSuffix}`,
      title: task.name,
      stepTitle: currentStep.name,
      primaryCta: copy.focusCta,
      dueLabel: task.dueDate ? formatDueDate(task.dueDate) : undefined,
      steps: task.steps.map((step, index) => ({
        done: step.status === 'completed',
        current: index === currentIndex,
        title: step.name,
      })),
    };
  }, [focusIndex, tasks, copy]);

  const queueItems: QueueTaskItem[] = useMemo(
    () =>
      tasks
        .map((task, index) => ({ task, index }))
        .filter(({ index }) => index !== focusIndex && categories[index] === activeFilter)
          .map(({ task }) => {
            const allCompleted = task.steps.length > 0 && task.steps.every((step) => step.status === 'completed');
            const completedStep = task.steps
              .filter((step) => step.status === 'completed')
              .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
              .pop();
            const completedDateStr = completedStep?.completedAt
              ? completedStep.completedAt.split('T')[0]
              : undefined;
            return {
              id: task.id,
              name: task.name,
              stepCount: task.steps.length,
              totalMinutes: task.steps.reduce((acc, step) => acc + step.minutes, 0),
              status: (allCompleted ? 'completed' : 'ready') as QueueTaskStatus,
              stepStatuses: task.steps.map((step) =>
                step.status === 'completed' ? ('done' as StepSegmentStatus) : ('pending' as StepSegmentStatus)
              ),
              dueLabel: task.dueDate ? formatDueDate(task.dueDate) : undefined,
              completedDate: completedDateStr ? formatDueDate(completedDateStr) : undefined,
            };
          }),
    [tasks, categories, focusIndex, activeFilter, copy],
  );

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      <DesignLabHeader
        title={f.headerTitle}
        showAvatar={false}
        rightAction={{
          icon: mci('add'),
          label: f.quickCreate.title,
          onPress: () => navigation.navigate('TareasACrear'),
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: sereneSpacing.margin,
          paddingBottom: contentPaddingBottom,
          gap: sereneSpacing['space-lg'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado + resumen del día (una línea) */}
        <View style={{ gap: sereneSpacing['space-sm'], paddingTop: sereneSpacing['space-sm'] }}>
          <RNText
            style={[sereneTypography['headline-lg-mobile'] as TextStyle, { color: sereneColors['on-surface'] }]}
          >
            {f.pageTitle}
          </RNText>

          <RNText
            style={[
              sereneTypography['body-sm'] as TextStyle,
              { color: sereneColors['on-surface-variant'], flexShrink: 1 },
            ]}
          >
            <RNText style={{ fontWeight: '600', color: sereneColors['on-surface'] }}>
              {f.summaryLabel}{' '}
            </RNText>
            {`${completedSteps} pasos completados · ${counts.inProgress} ${copy.categoryLabels.inProgress.toLowerCase()} · ${counts.notStarted} ${copy.categoryLabels.notStarted.toLowerCase()}`}
          </RNText>

          <FilterPills options={filterOptions} activeKey={activeFilter} onChange={handleFilterChange} />
        </View>

        {/* Tarea en foco (única superficie primaria; solo en "En curso") */}
        {focus && activeFilter === 'inProgress' && (
          <FeaturedTaskCard
            badge={focus.badge}
            minutesLabel={focus.minutesLabel}
            title={focus.title}
            stepTitle={focus.stepTitle}
            primaryCta={focus.primaryCta}
            toggleOpen={copy.toggleOpen}
            toggleClose={copy.toggleClose}
            steps={focus.steps}
            dueLabel={focus.dueLabel}
            onResume={() => navigation.navigate('EnfoqueFocus')}
          />
        )}

        {/* Cola (filtrada por la categoría activa) */}
        <View style={{ gap: sereneSpacing['space-sm'] }}>
          <RNText
            style={[sereneTypography['title-md'] as TextStyle, { color: sereneColors['on-surface'], flexShrink: 1 }]}
          >
            {f.queue.title}{' '}
            <RNText
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], fontWeight: '400' },
              ]}
            >
              {f.queue.subtitle}
            </RNText>
          </RNText>

          <View style={{ gap: sereneSpacing['space-sm'] + 2 }}>
            {queueItems.length === 0 ? (
              <RNText
                style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'] }]}
              >
                {f.queue.empty}
              </RNText>
            ) : (
              queueItems.map((item) => (
                <QueueTaskRow
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('TareasADetalle')}
                />
              ))
            )}
          </View>
        </View>

        {/* CTA secundario al pie: crear tarea */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={f.footerCta}
          onPress={() => navigation.navigate('TareasACrear')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: sereneSpacing['space-sm'],
            minHeight: s(48),
            borderRadius: sereneBorderRadius.xl,
            borderWidth: 1,
            borderColor: sereneColors.outline,
            backgroundColor: sereneColors.surface,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <MaterialCommunityIcons name={mci('add')} size={s(20)} color={sereneColors.primary} />
          <RNText style={[sereneTypography['label-md'] as TextStyle, { color: sereneColors.primary }]}>
            {f.footerCta}
          </RNText>
        </Pressable>

        {/* Cierre al pie - diseño igual que FocusFixture */}
        <View
          style={{
            alignItems: 'center',
            paddingTop: sereneSpacing['space-xs'],
            paddingBottom: sereneSpacing['space-xs'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(4) }}>
            <MaterialCommunityIcons name="spa" size={s(14)} color={whisperColor} />
            <RNText style={[sereneTypography['label-sm'] as TextStyle, { color: whisperColor }]}>
              {f.footerNote}
            </RNText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
