import type { SereneTabKey } from '../../components/ui/SereneTabBar';

export interface SereneTabPreviewCopy {
  key: SereneTabKey;
  title: string;
  subtitle: string;
  primaryCta: string;
  rows: string[];
}

/** Copy del "marco con tabs" del Design Lab: una vista simple por tab. */
export const sereneTabsFixtures: SereneTabPreviewCopy[] = [
  {
    key: 'foco',
    title: 'Foco',
    subtitle: 'Tu próximo paso, sin nada más alrededor.',
    primaryCta: 'Empezar foco',
    rows: [
      'Rediseño de Propuesta Comercial Q3',
      'Escribir las 3 viñetas clave',
      'Recopilar métricas de abril y mayo',
      'Exportar borrador PDF',
    ],
  },
  {
    key: 'tareas',
    title: 'Tareas',
    subtitle: 'Todo lo pendiente, dividido en pasos.',
    primaryCta: 'Crear tarea',
    rows: [
      'Responder email del cliente',
      'Actualizar dependencias de SQLite',
      'Preparar documento para el cliente',
      'Revisar el apartado de alcance',
    ],
  },
  {
    key: 'perfil',
    title: 'Perfil',
    subtitle: 'Tu cuenta, tus logros y tus datos.',
    primaryCta: 'Editar perfil',
    rows: [
      'Logros · 3 de 8',
      'Conflictos de sincronización · 1',
      'Recordatorios',
      'Cerrar sesión',
    ],
  },
];

export const sereneTabsNote =
  'Marco con tabs: comprobá que la barra no tape el botón de abajo.';
