/**
 * Fixtures de las dos pantallas de onboarding (Design Lab).
 *
 * Recrean los mockups `paso_1_el_problema` (el problema) y
 * `paso_2_la_soluci_n` (la solución) con el vocabulario de la app:
 * tarea, paso, foco.
 */

import type { MciSymbolKey } from '../../components/designlab/mciIconMap';

export interface OnboardingAPoint {
  text: string;
  icon: MciSymbolKey;
}

export interface OnboardingAProblemFixtures {
  headerTitle: string;
  progressLabel: string;
  visualTaskLabel: string;
  visualStepsLabel: string;
  headline: string;
  points: OnboardingAPoint[];
  primary: string;
}

export const onboardingAProblemaFixtures: OnboardingAProblemFixtures = {
  headerTitle: 'Onboarding 1',
  progressLabel: 'Paso 1 de 2',
  visualTaskLabel: 'Tarea',
  visualStepsLabel: 'Pasos',
  headline: 'Empezar es lo difícil',
  points: [
    { icon: 'schedule', text: 'Una tarea grande cuesta arrancarla.' },
    { icon: 'pause_circle', text: 'Si no sabés por dónde empezar, la dejás para después.' },
  ],
  primary: 'Siguiente',
};

export interface OnboardingASolutionFixtures {
  headerTitle: string;
  progressLabel: string;
  headline: string;
  points: OnboardingAPoint[];
  footnote: string;
  primary: string;
}

export const onboardingASolucionFixtures: OnboardingASolutionFixtures = {
  headerTitle: 'Onboarding 2',
  progressLabel: 'Paso 2 de 2',
  headline: 'Un paso a la vez',
  points: [
    { icon: 'checklist', text: 'Dividí la tarea en pasos chicos.' },
    { icon: 'timer', text: 'Elegí uno y dedicale un rato de foco, con cronómetro.' },
    { icon: 'check_circle', text: 'Marcá lo que completás y seguí con el siguiente.' },
  ],
  footnote: 'Tus tareas se guardan en este teléfono. Si creás una cuenta, también se sincronizan.',
  primary: 'Empezar',
};
