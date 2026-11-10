import type { MciSymbolKey } from '../../../components/designlab/mciIconMap';

export interface AuthFieldFixtures {
  label: string;
  placeholder?: string;
  helper?: string;
}

export const loginCopy = {
  headerTitle: 'StepUp',
  title: 'Iniciar sesión',
  subtitle: 'Entrá para sincronizar tus tareas.',
  fields: {
    email: { label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com' } as AuthFieldFixtures,
    password: { label: 'Contraseña', placeholder: '••••••••' } as AuthFieldFixtures,
  },
  primary: 'Iniciar sesión',
  loading: 'Iniciando sesión…',
  loadingCaption: 'Puede tardar unos segundos.',
  secondary: 'Seguir sin cuenta',
  secondaryCaption: 'Tus tareas quedan en este teléfono.',
  footerQuestion: '¿No tenés cuenta?',
  footerLink: 'Crear cuenta',
  errorMessage: 'Correo o contraseña incorrectos.',
  offline: {
    title: 'Sin conexión',
    body: 'Podés seguir sin cuenta.',
  },
  a11y: {
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
  },
};

export const registerCopy = {
  headerTitle: 'StepUp',
  title: 'Crear cuenta',
  subtitle: 'Con una cuenta, tus tareas se sincronizan.',
  fields: {
    name: { label: 'Nombre', placeholder: 'Tu nombre' } as AuthFieldFixtures,
    email: { label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com' } as AuthFieldFixtures,
    password: {
      label: 'Contraseña',
      placeholder: '••••••••',
      helper: 'Mínimo 8 caracteres',
    } as AuthFieldFixtures,
  },
  primary: 'Crear cuenta',
  loading: 'Creando cuenta…',
  footerQuestion: '¿Ya tenés cuenta?',
  footerLink: 'Iniciar sesión',
  errorMessage: 'La contraseña necesita al menos 8 caracteres.',
  offline: {
    title: 'Sin conexión',
    body: 'Necesitás conexión para crear una cuenta.',
  },
  a11y: {
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
  },
};

export interface OnboardingAPoint {
  text: string;
  icon: MciSymbolKey;
}

export interface OnboardingAProblemFixtures {
  headerTitle?: string;
  progressLabel: string;
  visualTaskLabel: string;
  visualStepsLabel: string;
  headline: string;
  points: OnboardingAPoint[];
  primary: string;
}

export interface OnboardingASolutionFixtures {
  headerTitle?: string;
  progressLabel: string;
  headline: string;
  points: OnboardingAPoint[];
  footnote: string;
  primary: string;
}

export const onboardingCopy = {
  problem: {
    progressLabel: 'Paso 1 de 2',
    visualTaskLabel: 'Tarea',
    visualStepsLabel: 'Pasos',
    headline: 'Empezar es lo difícil',
    points: [
      { icon: 'schedule' as MciSymbolKey, text: 'Una tarea grande cuesta arrancarla.' },
      { icon: 'pause_circle' as MciSymbolKey, text: 'Si no sabés por dónde empezar, la dejás para después.' },
    ],
    primary: 'Siguiente',
  } as OnboardingAProblemFixtures,
  solution: {
    progressLabel: 'Paso 2 de 2',
    headline: 'Un paso a la vez',
    points: [
      { icon: 'checklist' as MciSymbolKey, text: 'Dividí la tarea en pasos chicos.' },
      { icon: 'timer' as MciSymbolKey, text: 'Elegí uno y dedicale un rato de foco, con cronómetro.' },
      { icon: 'check_circle' as MciSymbolKey, text: 'Marcá lo que completaste y seguí con el siguiente.' },
    ],
    footnote: 'Tus tareas se guardan en este teléfono. Si creás una cuenta, también se sincronizan.',
    primary: 'Empezar',
  } as OnboardingASolutionFixtures,
};

export const authCopy = {
  emptyLogin: 'Completá tu correo y contraseña.',
  emptyRegister: 'Completá todos los campos.',
  passwordTooShort: 'La contraseña necesita al menos 8 caracteres.',
  passwordTooLong: 'La contraseña es demasiado larga.',
  serverError: 'No pudimos completar la acción. Probá de nuevo.',
  unknownError: 'Algo salió mal. Probá de nuevo.',
};
