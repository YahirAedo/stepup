import React from 'react';
import StepCompleteView from '../../components/designlab/StepCompleteView';
import { completadoFixtures } from './focusFixtures';

/**
 * Pantalla del mockup `Focus - Paso completado v2` — WRAPPER.
 *
 * Preview aislada de la vista de "paso completado". Comparte `StepCompleteView`
 * con la fase 'completado' de `FocusPrevioScreen`. NO escribe en SQLite.
 */
export default function FocusCompletadoScreen() {
  return (
    <StepCompleteView
      headline={completadoFixtures.headline}
      durationLabel={completadoFixtures.durationLabel}
      subtitleTemplate={completadoFixtures.subtitleTemplate}
      recapLabel={completadoFixtures.recapLabel}
      completedStepTitle={completadoFixtures.completedStepTitle}
      nextStep={completadoFixtures.nextStep}
      breakCta={completadoFixtures.breakCta}
      primaryCta={completadoFixtures.primaryCta}
      secondaryCta={completadoFixtures.secondaryCta}
      microCopy={completadoFixtures.microCopy}
      headerTitle={completadoFixtures.headerTitle}
      onContinue={() => console.log('[DesignLab] Continue next step')}
      onRest={() => console.log('[DesignLab] Rest for today')}
      onBreak={() => console.log('[DesignLab] Mindful break')}
    />
  );
}
