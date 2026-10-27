import { describe, expect, it } from 'vitest';
import { migrationFlags } from '../config/migration';
import {
  FULLSCREEN_ROUTES,
  TAB_KEY_BY_ROUTE,
  TAB_ROUTES,
  TABS_VARIANT,
  isFullscreenRoute,
} from './tabs';

describe('configuracion de las pestañas nuevas', () => {
  it('tiene exactamente tres rutas, en el orden Foco / Tareas / Perfil', () => {
    expect(TAB_ROUTES).toEqual(['Focus', 'Tasks', 'Profile']);
  });

  it('cada ruta tiene su clave de la barra Serene', () => {
    expect(Object.keys(TAB_KEY_BY_ROUTE).sort()).toEqual([...TAB_ROUTES].sort());
    expect(TAB_KEY_BY_ROUTE).toEqual({ Focus: 'foco', Tasks: 'tareas', Profile: 'perfil' });
  });

  it('no incluye la pestaña Historial', () => {
    expect(TAB_ROUTES).not.toContain('History');
  });
});

describe('isFullscreenRoute', () => {
  it('oculta la barra en una pantalla del Design Lab', () => {
    expect(isFullscreenRoute('DesignLab')).toBe(true);
    expect(isFullscreenRoute('TareasAListado')).toBe(true);
  });

  it('muestra la barra en las pantallas reales', () => {
    expect(isFullscreenRoute('TaskList')).toBe(false);
    expect(isFullscreenRoute('FocusMain')).toBe(false);
    expect(isFullscreenRoute('ProfileMain')).toBe(false);
  });

  it('no oculta la barra cuando no hay pantalla anidada', () => {
    expect(isFullscreenRoute(undefined)).toBe(false);
  });

  it('cubre las 19 rutas del Lab de GlassTabBar', () => {
    expect(FULLSCREEN_ROUTES.size).toBe(19);
  });
});

describe('selector del navegador', () => {
  it('con la bandera apagada se sigue usando el navegador actual', () => {
    expect(migrationFlags.tabs).toBe(false);
    expect(TABS_VARIANT).toBe('legacy');
  });
});
