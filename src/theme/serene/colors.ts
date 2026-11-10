import type { ThemeColors } from '../../types/theme';

/**
 * Paleta "Serene Focus" — theme paralelo, AISLADO del theme de produccion.
 *
 * Origen: `tailwind.config` del mockup `stepup_cron_metro_limpio_modo_claro`.
 * NO editar contra la prosa de `serene_focus/DESIGN.md` (describe otra
 * iteracion y se contradice con el HTML renderizado). El HTML manda.
 *
 * Mismos 47 nombres de token que `ThemeColors` (Material 3), valores distintos.
 *
 * POR QUE ESTA AISLADA: esta paleta invierte la semantica de los roles.
 * `secondary` deja de ser el naranja de acento y pasa a salvia; `tertiary`
 * deja de ser el AZUL del focus (documentado en `Arquitectura E2.md` y
 * literalizado como "Focus - Azul" en `FocusScreen.tsx`) y pasa a marron.
 * Aplicarla sobre `src/theme/colors.ts` restiliria las 15 pantallas existentes
 * de una y romperia HU-17. La migracion va pantalla por pantalla (epico aparte).
 *
 * Issue: #295. Ver DT en `docs/Log Decisiones Tecnicas E2.md`.
 */
export const sereneColors: ThemeColors = {
  // base surfaces
  surface: '#f9f9fc',
  'surface-dim': '#dadadc',
  'surface-bright': '#f9f9fc',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f3f3f6',
  'surface-container': '#eeeef0',
  'surface-container-high': '#e8e8ea',
  'surface-container-highest': '#e2e2e5',
  background: '#f9f9fc',
  'surface-variant': '#e2e2e5',

  // on-surface
  'on-surface': '#1a1c1e',
  'on-surface-variant': '#414943',
  'on-background': '#1a1c1e',

  // inverse
  'inverse-surface': '#2f3133',
  'inverse-on-surface': '#f0f0f3',

  // outlines
  outline: '#717972',
  'outline-variant': '#c0c9c1',
  'surface-tint': '#36684e',

  // primary (verde profundo)
  primary: '#003a24',
  'on-primary': '#ffffff',
  'primary-container': '#1e5139',
  'on-primary-container': '#8ec2a4',
  'inverse-primary': '#9dd2b3',
  'primary-fixed': '#b8efce',
  'primary-fixed-dim': '#9dd2b3',
  'on-primary-fixed': '#002112',
  'on-primary-fixed-variant': '#1d5038',

  // secondary (salvia — antes naranja)
  secondary: '#4f6358',
  'on-secondary': '#ffffff',
  'secondary-container': '#d2e8da',
  'on-secondary-container': '#55695e',
  'secondary-fixed': '#d2e8da',
  'secondary-fixed-dim': '#b6ccbe',
  'on-secondary-fixed': '#0c1f17',
  'on-secondary-fixed-variant': '#384b41',

  // tertiary (marron — antes azul)
  tertiary: '#482b0f',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#624123',
  'on-tertiary-container': '#dcae88',
  'tertiary-fixed': '#ffdcc1',
  'tertiary-fixed-dim': '#edbd96',
  'on-tertiary-fixed': '#2e1500',
  'on-tertiary-fixed-variant': '#604022',

  // error
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
};
