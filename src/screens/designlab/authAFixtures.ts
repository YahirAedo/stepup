/**
 * Fixtures del acceso (Login y Registro) — Design Lab.
 *
 * Aca vive TODO el texto visible y las opciones del selector de demo; las
 * pantallas solo dibujan. Los correos son de ejemplo: no hay credenciales
 * reales en el repo.
 */

export type LoginDemoState =
  | 'normal'
  | 'error'
  | 'cargando'
  | 'sinConexion'
  | 'cambioCuentaConCambios'
  | 'cambioCuentaSinCambios';

export type RegistroDemoState = 'normal' | 'error' | 'cargando' | 'sinConexion';

export interface AuthDemoOption<S extends string> {
  key: S;
  label: string;
}

export interface AuthFieldFixtures {
  label: string;
  placeholder?: string;
  helper?: string;
}

export const loginAFixtures = {
  headerTitle: 'StepUp',
  title: 'Iniciar sesión',
  subtitle: 'Entrá para sincronizar tus tareas.',
  fields: {
    email: { label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com' } as AuthFieldFixtures,
    password: { label: 'Contraseña', placeholder: '••••••••' } as AuthFieldFixtures,
  },
  demo: {
    label: 'Estado (solo Design Lab)',
    indexCta: 'Índice',
    options: [
      { key: 'normal', label: 'Normal' },
      { key: 'error', label: 'Error' },
      { key: 'cargando', label: 'Cargando' },
      { key: 'sinConexion', label: 'Sin conexión' },
      { key: 'cambioCuentaConCambios', label: 'Cambio con cambios' },
      { key: 'cambioCuentaSinCambios', label: 'Cambio sin cambios' },
    ] as AuthDemoOption<LoginDemoState>[],
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
  dialog: {
    title: 'Este teléfono tiene datos de otra cuenta',
    bodyWithPending:
      'Si continuás, se borran de este teléfono. Hay cambios que no se sincronizaron y se perderían.',
    bodyClean: 'Si continuás, se borran de este teléfono. Tu otra cuenta los conserva.',
    confirmLabel: 'Continuar y borrar',
    cancelLabel: 'Cancelar',
    newAccountEmail: 'nueva.cuenta@ejemplo.com',
    newAccountPassword: '••••••••',
  },
  a11y: {
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
  },
};

export const registroAFixtures = {
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
  demo: {
    label: 'Estado (solo Design Lab)',
    indexCta: 'Índice',
    options: [
      { key: 'normal', label: 'Normal' },
      { key: 'error', label: 'Error' },
      { key: 'cargando', label: 'Cargando' },
      { key: 'sinConexion', label: 'Sin conexión' },
    ] as AuthDemoOption<RegistroDemoState>[],
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
