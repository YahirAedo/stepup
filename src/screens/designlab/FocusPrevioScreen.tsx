import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Text as RNText,
  type TextStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomLayout } from '../../theme/layout';
import DesignLabHeader from '../../components/designlab/DesignLabHeader';
import FocusStepCard from '../../components/designlab/FocusStepCard';
import FocusQueue, { type QueueItem } from '../../components/designlab/FocusQueue';
import AddMicroStepInline from '../../components/designlab/AddMicroStepInline';
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
 * Preview "Focus — Paso previo" (Design Lab #296).
 *
 * Tres fases:
 * - 'previo': preparación calma — 1 superficie primaria (step card), 2 secundarias
 *   (cola compacta + strip zen). La duración ya viene definida.
 * - 'corriendo': cronómetro limpio (reusa FocusRunningView compartido con
 *   CronometroLimpioScreen). Al llegar a 0:00 dispara el overlay de tiempo
 *   cumplido.
 * - 'completado': pantalla "Paso completado v2" (StepCompleteView).
 *
 * Cada fase trae su propio header (DesignLabHeader); por eso no hay un header
 * comun en el contenedor. Transición: crossfade animado entre fases.
 */
export default function FocusPrevioScreen() {
  const { contentPaddingBottom } = useBottomLayout();
  const { scale: s } = useResponsive();

  const [phase, setPhase] = useState<Phase>('previo');
  const [addVisible, setAddVisible] = useState(false);

  const minutes = previoFixtures.heroStep.suggestedMinutes;

  // Animaciones de crossfade por fase
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

  // Handlers para la queue (simulación visual)
  const handlePromote = useCallback((id: string) => {
    console.log('[DesignLab] Promote to focus:', id);
  }, []);

  const handleSaveMicroStep = useCallback((title: string) => {
    console.log('[DesignLab] Save micro-step:', title);
    setAddVisible(false);
  }, []);

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
        <DesignLabHeader title="Focus — Paso previo" />

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
              { color: sereneColors.primary, textAlign: 'center', marginTop: sereneSpacing['space-md'], marginBottom: sereneSpacing['space-lg'] },
            ]}
          >
            {previoFixtures.motivation.headline}
          </RNText>

          {/* Superficie primaria: step card */}
          <FocusStepCard
            currentIndex={previoFixtures.heroStep.currentIndex}
            totalSteps={previoFixtures.heroStep.totalSteps}
            minutes={minutes}
            title={previoFixtures.heroStep.title}
            description={previoFixtures.heroStep.description}
            onStart={switchToCorriendo}
            onPostpone={() => console.log('[DesignLab] Postpone step')}
            onPress={() => console.log('[DesignLab] Open step detail')}
          />

          {/* Superficie secundaria: cola compacta + form inline */}
          <View style={{ marginTop: sereneSpacing['space-xl'] }}>
            <FocusQueue
              items={previoFixtures.queue as unknown as QueueItem[]}
              onPromote={handlePromote}
              onAdd={() => setAddVisible(true)}
              subtitle={previoFixtures.queueSubtitle}
              maxVisible={3}
            />

            <View style={{ marginTop: sereneSpacing['space-md'] }}>
              <AddMicroStepInline
                visible={addVisible}
                suggestedMinutes={previoFixtures.microStep.suggestedMinutes}
                maxMinutes={previoFixtures.microStep.maxMinutes}
                heading={previoFixtures.microStep.heading}
                placeholder={previoFixtures.microStep.placeholder}
                onClose={() => setAddVisible(false)}
                onSave={handleSaveMicroStep}
              />
            </View>
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
            <MaterialCommunityIcons
              name={previoFixtures.zenCard.icon as any}
              size={s(18)}
              color={sereneColors.secondary}
            />
            <RNText
              numberOfLines={1}
              style={[sereneTypography['body-sm'] as TextStyle, { color: sereneColors['on-surface-variant'], flexShrink: 1 }]}
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
            completedStepTitle={completadoFixtures.completedStepTitle}
            nextStep={completadoFixtures.nextStep}
            breakCta={completadoFixtures.breakCta}
            primaryCta={completadoFixtures.primaryCta}
            secondaryCta={completadoFixtures.secondaryCta}
            microCopy={completadoFixtures.microCopy}
            headerTitle={completadoFixtures.headerTitle}
            onContinue={switchToPrevio}
            onRest={switchToPrevio}
            onBreak={() => console.log('[DesignLab] Mindful break')}
          />
        </Animated.View>
      )}
    </View>
  );
}
