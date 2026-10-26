import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StepCompleteView from '../../components/designlab/StepCompleteView';
import FocusStateDemoControl from '../../components/designlab/FocusStateDemoControl';
import { completadoScenarios, type CompletadoScenario } from './focusFixtures';
import type { ProfileStackParamList } from '../../types/navigation';

/**
 * Pantalla del mockup `Focus - Paso completado v2` — WRAPPER.
 *
 * Preview aislada de la vista de "paso completado". Comparte `StepCompleteView`
 * con la fase 'completado' de `EnfoqueFocusScreen`. NO escribe en SQLite.
 *
 * Lote C: un conmutador (SOLO DESIGN LAB) recorre los 3 cierres —
 * queda otro paso / último de la tarea / sin pendientes— y los CTA navegan
 * dentro del flujo Tareas.
 */
export default function FocusCompletadoScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'FocusCompletado'>>();
  const [scenario, setScenario] = useState<CompletadoScenario>('next-step');
  const f = completadoScenarios[scenario];

  const handleContinue = () => {
    if (scenario === 'next-step') {
      navigation.navigate('TareasAListado');
      return;
    }
    if (scenario === 'last-step') {
      navigation.navigate('TareasAListado');
      return;
    }
    if (scenario === 'all-done') {
      navigation.navigate('TareasACrear');
      return;
    }
    if (scenario === 'postpone') {
      navigation.navigate('TareasAListado');
      return;
    }
    navigation.navigate('TareasAListado');
  };

  return (
    <StepCompleteView
      demoControl={<FocusStateDemoControl state={scenario} onChange={setScenario} />}
      headline={f.headline}
      durationLabel={f.durationLabel}
      subtitleTemplate={f.subtitleTemplate}
      recapLabel={f.recapLabel}
      completedStepName={f.completedStepName}
      nextStep={f.nextStep}
      breakCta="Descansar 2 min"
      primaryCta="Salir"
      secondaryCta=""
      microCopy={f.microCopy}
      headerTitle={f.headerTitle}
      onContinue={handleContinue}
      onRest={() => navigation.navigate('TareasAListado')}
      onBreak={() => navigation.navigate('TareasAListado')}
    />
  );
}
