import type { SereneTabKey } from '../components/ui/SereneTabBar';
import { migrationFlags } from '../config/migration';

/**
 * Configuracion del navegador de 3 pestañas del rediseño (Fase 1).
 *
 * Los nombres de ruta son los mismos que en `MainTabs` (GlassTabBar) para que
 * los `navigate` existentes sigan funcionando sin cambios: `TaskListScreen`
 * navega a `Profile`, `TaskDetailScreen` a `Focus`, `FocusScreen` a `Tasks`.
 */
export const TAB_ROUTES = ['Focus', 'Tasks', 'Profile'] as const;

export type TabRouteName = (typeof TAB_ROUTES)[number];

/** Ruta de tab → clave de la barra Serene. */
export const TAB_KEY_BY_ROUTE: Record<TabRouteName, SereneTabKey> = {
  Focus: 'foco',
  Tasks: 'tareas',
  Profile: 'perfil',
};

/** Navegador a montar: `serene` = 3 tabs nuevos; `legacy` = MainTabs con GlassTabBar. */
export const TABS_VARIANT: 'serene' | 'legacy' = migrationFlags.tabs ? 'serene' : 'legacy';

/**
 * Pantallas que se muestran a pantalla completa, sin barra. Copia de
 * `FULLSCREEN_ROUTES` en `src/components/GlassTabBar.tsx`: ese archivo no se
 * toca durante la migracion y se borra en la Fase 7. Si la Fase 2 agrega una
 * ruta nueva del Lab, hay que sumarla en los dos lugares.
 */
export const FULLSCREEN_ROUTES: ReadonlySet<string> = new Set([
  'DesignLab',
  'CronometroLimpio',
  'FocusCompletado',
  'EnfoqueFocus',
  'FocusSinTareas',
  'TareasAListado',
  'TareasACrear',
  'TareasADetalle',
  'TareasAEditar',
  'TareasACompletada',
  'TareasEditarPasoSheet',
  'PerfilA',
  'SereneTabs',
  'LogrosA',
  'ConflictosA',
  'Onboarding1A',
  'Onboarding2A',
  'LoginA',
  'RegistroA',
]);

/** true si la pantalla anidada activa debe ocultar la barra. */
export function isFullscreenRoute(name: string | undefined): boolean {
  return name !== undefined && FULLSCREEN_ROUTES.has(name);
}
