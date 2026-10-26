// ⚠️ DESIGN: variante visual para evaluar en Design Lab; no es la pantalla final.

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Text as RNText,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import EnfoqueStepCard from '../../components/designlab/EnfoqueStepCard';
import EnfoqueQueue, { type EnfoqueQueueItem } from '../../components/designlab/EnfoqueQueue';
import TaskSwitcher, { type TaskSwitcherTask } from '../../components/designlab/TaskSwitcher';
import FocusRunningView from '../../components/designlab/FocusRunningView';
import StepCompleteView from '../../components/designlab/StepCompleteView';
import {
  previoFixtures,
  corriendoFixtures,
  completadoFixtures,
} from './focusFixtures';
import {
  sereneColors,
  sereneTypography,
  sereneSpacing,
  useResponsive,
} from '../../theme/serene';

type Phase = 'previo' | 'corriendo' | 'completado';

const CROSSFADE_DURATION = 250;

/**
 * Design Lab — "Variante E — Enfoque" (flujo completo).
 *
 * Harmonización del focus "paso previo" (título dominante en panel inset +
 * cola en acordeón colapsado) con el flujo completo de 3 fases:
 * - 'previo': superficie primaria con `EnfoqueStepCard`, luego `EnfoqueQueue`
 *   (dos secundarias: cola + strip zen). La duración ya viene definida.
 * - 'corriendo': reusa el `FocusRunningView` compartido (igual que la base y
 *   el Cronómetro limpio). Al llegar a 0:00 dispara el overlay de tiempo cumplido.
 * - 'completado': reusa `StepCompleteView`.
 *
 * Transición: crossfade animado entre fases.
 */
export default function EnfoqueFocusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'EnfoqueFocus'>>();
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();

  const [phase, setPhase] = useState<Phase>('previo');
  const [activeTaskId, setActiveTaskId] = useState<string>(previoFixtures.taskSwitcher.tasks[0].id);

  const activeTask =
    (previoFixtures.taskSwitcher.tasks.find((t) => t.id === activeTaskId) as TaskSwitcherTask | undefined) ??
    (previoFixtures.taskSwitcher.tasks[0] as TaskSwitcherTask);

  const minutes = activeTask.minutes;

  const previoOpacity = useRef(new Animated.Value(1)).current;
  const previoTranslateY = useRef(new Animated.Value(0)).current;
  const corriendoOpacity = useRef(new Animated.Value(0)).current;
  const corriendoTranslateY = useRef(new Animated.Value(s(20))).current;
  const completadoOpacity = useRef(new Animated.Value(0)).current;
  const completadoTranslateY = useRef(new Animated.Value(s(20))).current;

  const switchToCorriendo = useCallback(() => {
    setPhase('corriendo');
    Animated.parallel(
      [
        Animated.timing(previoOpacity, { toValue: 0, duration: CROSSFADE_DURATION, useNativeDriver: true }),
        Animated.timing(previoTranslateY, { toValue: -s(20), duration: CROSSFADE_DURATION, useNativeDriver: true }),
        Animated.timing(corriendoOpacity, { toValue: 1, duration: CROSSFADE_DURATION, useNativeDriver: true }),
        Animated.timing(corriendoTranslateY, { toValue: 0, duration: CROSSFADE_DURATION, useNativeDriver: true }),
      ],
      { stopTogether: false }
    ).start();
  }, [s]);

  const switchToCompletado = useCallback(() => {
    setPhase('completado');
    // Solo animamos la fase entrante. La saliente (`corriendo`) se desmonta en el
    // mismo commit, y animar un valor cuya vista se desmonta cancela el `parallel`
    // (dejaba `completado` pegado en opacity 0 = pantalla en blanco).
    completadoOpacity.setValue(0);
    completadoTranslateY.setValue(s(20));
    Animated.parallel(
      [
        Animated.timing(completadoOpacity, { toValue: 1, duration: CROSSFADE_DURATION, useNativeDriver: true }),
        Animated.timing(completadoTranslateY, { toValue: 0, duration: CROSSFADE_DURATION, useNativeDriver: true }),
      ],
      { stopTogether: false }
    ).start();
  }, [s]);

  const switchToPrevio = useCallback(() => {
    setPhase('previo');
    // `corriendo`/`completado` se desmontan al volver: no los animamos.
    corriendoOpacity.setValue(0);
    corriendoTranslateY.setValue(s(20));
    completadoOpacity.setValue(0);
    completadoTranslateY.setValue(s(20));
    Animated.parallel(
      [
        Animated.timing(previoOpacity, { toValue: 1, duration: CROSSFADE_DURATION, useNativeDriver: true }),
        Animated.timing(previoTranslateY, { toValue: 0, duration: CROSSFADE_DURATION, useNativeDriver: true }),
      ],
      { stopTogether: false }
    ).start();
  }, [s]);

  const alternatives = (previoFixtures.taskSwitcher.tasks.filter((t) => t.id !== activeTaskId) as TaskSwitcherTask[]);

  const handleSelectTask = useCallback((task: TaskSwitcherTask) => {
    setActiveTaskId(task.id);
  }, []);

  const handlePromote = useCallback((id: string) => {
    const promoted = previoFixtures.queue.find((q) => q.id === id);
    if (promoted) {
      setActiveTaskId(id);
    }
  }, []);

  const handleAddStep = useCallback(() => {
    navigation.navigate('TareasADetalle');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: sereneColors.surface }}>
      {/* FASE PREVIO — Preparación */}
      <Animated.View
        style={{
          opacity: previoOpacity,
          transform: [{ translateY: previoTranslateY }],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        pointerEvents={phase === 'previo' ? 'auto' : 'none'}
      >
        <DesignLabHeader title="Variante E — Enfoque" />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: sereneSpacing.gutter,
            paddingBottom: contentPaddingBottom,
            alignItems: 'stretch',
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro: una sola línea */}
          <RNText
            style={[
              sereneTypography['headline-lg-mobile'] as TextStyle,
              {
                color: sereneColors.primary,
                textAlign: 'center',
                marginTop: sereneSpacing['space-md'],
                marginBottom: sereneSpacing['space-lg'],
              },
            ]}
          >
            {previoFixtures.motivation.headline}
          </RNText>

          {/* Superficie primaria: step card con título dominante */}
          <EnfoqueStepCard
            currentIndex={activeTask.stepIndex}
            totalSteps={activeTask.totalSteps}
            minutes={activeTask.minutes}
            title={activeTask.stepName}
            description={activeTask.description}
            onStart={switchToCorriendo}
            onReorder={() => navigation.navigate('TareasAEditar', { ordenarPasos: true })}
          />

          {/* Superficie secundaria: cola en acordeón */}
          <View style={{ marginTop: sereneSpacing['space-xl'] }}>
            <EnfoqueQueue
              items={previoFixtures.queue as unknown as EnfoqueQueueItem[]}
              subtitle={previoFixtures.queueSubtitle}
              onPromote={handlePromote}
              onAdd={handleAddStep}
            />
          </View>

          <View style={{ marginTop: sereneSpacing['space-xl'] }}>
            <TaskSwitcher
              activeTask={activeTask}
              alternatives={alternatives}
              remainingToday={previoFixtures.taskSwitcher.remainingToday}
              onSelect={handleSelectTask}
            />
          </View>
          {/* Strip zen: una línea, sin card */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sereneSpacing['space-sm'],
              marginTop: sereneSpacing['space-xl'],
            }}
          >
            <MaterialCommunityIcons name="leaf" size={s(18)} color={sereneColors.secondary} />
            <RNText
              numberOfLines={1}
              style={[
                sereneTypography['body-sm'] as TextStyle,
                { color: sereneColors['on-surface-variant'], flexShrink: 1 },
              ]}
            >
              <RNText style={{ color: sereneColors.primary, fontWeight: '600' }}>
                {previoFixtures.zenCard.title}
              </RNText>
              {` ${previoFixtures.zenCard.text}`}
            </RNText>
          </View>
        </ScrollView>
      </Animated.View>

      {/* FASE CORRIENDO — Cronómetro */}
      {phase === 'corriendo' && (
        <Animated.View
          style={{
            opacity: corriendoOpacity,
            transform: [{ translateY: corriendoTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <FocusRunningView
            initialSeconds={minutes * 60}
            maxSeconds={minutes * 60}
            fixtures={corriendoFixtures}
            headerTitle="Cronómetro"
            onComplete={switchToCompletado}
          />
        </Animated.View>
      )}

      {/* FASE COMPLETADO — Paso completado */}
      {phase === 'completado' && (
        <Animated.View
          style={{
            opacity: completadoOpacity,
            transform: [{ translateY: completadoTranslateY }],
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <StepCompleteView
            headline={completadoFixtures.headline}
            durationLabel={`${minutes} minutos`}
            subtitleTemplate={completadoFixtures.subtitleTemplate}
            recapLabel={completadoFixtures.recapLabel}
            completedStepName={completadoFixtures.completedStepName}
            nextStep={completadoFixtures.nextStep}
            breakCta={completadoFixtures.breakCta}
            primaryCta={completadoFixtures.primaryCta}
            secondaryCta={completadoFixtures.secondaryCta}
            microCopy={completadoFixtures.microCopy}
            headerTitle={completadoFixtures.headerTitle}
            onContinue={switchToPrevio}
            onRest={switchToPrevio}
            onBreak={() => console.log('[DesignLab] Break')}
          />
        </Animated.View>
      )}
    </View>
  );
}








