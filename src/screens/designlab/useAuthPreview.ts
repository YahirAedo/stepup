import { useState } from 'react';
import type { LoginDemoState, RegistroDemoState } from './authAFixtures';

/**
 * Estado de la preview de Login (Design Lab).
 *
 * Los campos y el estado son de demo: no tocan AuthService ni backend. El
 * selector de estados decide que se dibuja (normal, error, cargando, sin
 * conexion o el dialogo de cambio de cuenta).
 */
export function useLoginPreview() {
  const [state, setState] = useState<LoginDemoState>('normal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dialogVisible = state === 'cambioCuentaConCambios' || state === 'cambioCuentaSinCambios';
  const dialogHasPending = state === 'cambioCuentaConCambios';
  const isLoading = state === 'cargando';
  const isOffline = state === 'sinConexion';
  const hasError = state === 'error';

  const onSubmit = () => {
    // REQUIERE MIGRACIÓN: AuthService.login(email, password) y entrar a MainTabs;
    // el estado de error se toma de ApiError 401 y el de sin conexión de ApiError 0.
    console.log('[DesignLab] Login — iniciar sesión');
  };

  const onGuest = () => {
    // REQUIERE MIGRACIÓN: entrar a la app sin sesión y persistir
    // hasSeenOnboarding también para el invitado.
    console.log('[DesignLab] Login — seguir sin cuenta');
  };

  const onCloseDialog = () => setState('normal');

  const onConfirmDelete = () => {
    // REQUIERE MIGRACIÓN: hoy ensureLocalOwner() borra los datos de la cuenta
    // anterior sin avisar ni mirar si hay cambios sin sincronizar.
    setState('normal');
    console.log('[DesignLab] Login — continuar y borrar datos locales');
  };

  return {
    state,
    setState,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    dialogVisible,
    dialogHasPending,
    isLoading,
    isOffline,
    hasError,
    onSubmit,
    onGuest,
    onCloseDialog,
    onConfirmDelete,
  };
}

/**
 * Estado de la preview de Registro (Design Lab). No crea cuentas reales.
 */
export function useRegistroPreview() {
  const [state, setState] = useState<RegistroDemoState>('normal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = state === 'cargando';
  const isOffline = state === 'sinConexion';
  const hasError = state === 'error';

  const onSubmit = () => {
    // REQUIERE MIGRACIÓN: AuthService.register(name, email, password) y entrar a
    // MainTabs; la validación de 8 caracteres ya existe en RegisterScreen.
    console.log('[DesignLab] Registro — crear cuenta');
  };

  return {
    state,
    setState,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    isOffline,
    hasError,
    onSubmit,
  };
}
