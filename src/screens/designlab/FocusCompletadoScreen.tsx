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

  return (
    <StepCompleteView
      demoControl={<FocusStateDemoControl state={scenario} onChange={setScenario} />}
      headline={f.headline}
      durationLabel={f.durationLabel}
      subtitleTemplate={f.subtitleTemplate}
      recapLabel={f.recapLabel}
      completedStepName={f.completedStepName}
      nextStep={f.nextStep}
      breakCta={f.breakCta}
      primaryCta={f.primaryCta}
      secondaryCta={f.secondaryCta}
      microCopy={f.microCopy}
      headerTitle={f.headerTitle}
      onContinue={() => {
        if (scenario === 'next-step') {
          console.log('[DesignLab] Continue next step');
          return;
        }
        navigation.navigate(scenario === 'all-done' ? 'TareasACrear' : 'TareasAListado');
      }}
      onRest={() => navigation.navigate('TareasAListado')}
      onBreak={() => console.log('[DesignLab] Break')}
    />
  );
}
