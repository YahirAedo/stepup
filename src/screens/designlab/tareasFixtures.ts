/**
 * Fixtures para la preview "Tareas — Listado" (Design Lab, epico Tareas).
 *
 * El mockup fuente es `Tareas - Listado/code.html`. Estructura: header del shell
 * (NO se reproduce: el lab usa DesignLabHeader), encabezado + resumen del dia,
 * filtros tipo pill, tarjeta destacada en foco, quick-create, cola de espera,
 * card anti-abrumamiento e imagen serena editorial.
 *
 * ⚠️ Campos marcados con `// ⚠️ DESIGN` NO existen en el modelo real:
 * requieren migracion / estado de sesion de foco. Se incluyen solo para
 * evaluar la visual; el PR documenta que hace falta.
 *
 * Copy: se elimina el prefijo "micro-" siguiendo la decision del equipo
 * ("pasos", no "micro-pasos").
 */

import type { MciSymbolKey } from '../../components/designlab/mciIconMap';
import type { StepSequenceVariant } from '../../components/designlab/StepSequenceItem';
import type { StepSegmentStatus } from '../../components/designlab/StepProgressPanel';

export type FilterKey = 'activas' | 'pausa' | 'completadas';

export interface ListadoFixtures {
  headerTitle: string;
  summary: {
    todayCompleted: number;
    focusActive: number;
    queueCount: number;
  };
  filters: Array<{ key: FilterKey; label: string; count: number }>;
  featured: {
    badge: string;
    minutesLabel: string;
    title: string;
    stepLabel: string;
    stepTitle: string;
    sessionLabel: string;
    sessionPercent: number;
    primaryCta: string;
    toggleOpen: string;
    toggleClose: string;
    // ⚠️ DESIGN: no existe "paso actual en sesion" persistido; el posicion de
    // paso en curso sale de la sesion de foco activa (estado local de screen).
    steps: Array<{
      done: boolean;
      current: boolean;
      title: string;
    }>;
  };
  quickCreate: {
    title: string;
    subtitle: string;
    badge: string;
  };
  queue: {
    title: string;
    subtitle: string;
    maxVisible: string;
    items: Array<{
      id: string;
      name: string;
      stepCount: number;
      totalMinutes: number;
      status: 'ready' | 'draft';
      statusLabel: string;
    }>;
  };
  antiOverwhelm: {
    title: string;
    body: string;
    cta: string;
  };
  banner: {
    /** URL remota de la imagen editorial del mockup. */
    imageUrl: string;
    caption: string;
  };
}

export interface DetalleStepFixture {
  variant: StepSequenceVariant;
  index: number;
  title: string;
  meta: string;
  minutes?: number;
  description?: string;
  activeBadge?: string;
  activeCta?: string;
}

export interface DetalleFixtures {
  headerTitle: string;
  summary: {
    statusBadge: string;
    title: string;
    description: string;
    progress: {
      percentLabel: string;
      remainingLabel: string;
      doneLabel: string;
      paceLabel: string;
      statuses: StepSegmentStatus[];
    };
  };
  stepsTitle: string;
  addStep: string;
  steps: DetalleStepFixture[];
  management: Array<{ key: string; label: string; icon: MciSymbolKey }>;
  calm: { title: string; body: string };
  actions: { primary: string; secondary: string };
}

export const listadoFixtures: ListadoFixtures = {
  headerTitle: 'Tareas',
  summary: {
    todayCompleted: 4,
    focusActive: 1,
    queueCount: 2,
  },
  filters: [
    { key: 'activas', label: 'Activas', count: 3 },
    { key: 'pausa', label: 'En pausa', count: 2 },
    { key: 'completadas', label: 'Completadas', count: 8 },
  ],
  featured: {
    badge: 'En foco principal',
    minutesLabel: '~4 min',
    title: 'Rediseño de Propuesta Comercial Q3',
    stepLabel: 'Paso 2/4',
    stepTitle: 'Escribir las 3 viñetas clave',
    sessionLabel: 'Avance de la sesión',
    sessionPercent: 0.5,
    primaryCta: 'Reanudar Foco Inmediato',
    toggleOpen: 'Ver detalle y pasos',
    toggleClose: 'Ocultar detalle de pasos',
    steps: [
      { done: true, current: false, title: '1. Recopilar métricas de abril y mayo (3 min)' },
      { done: false, current: true, title: '2. Escribir las 3 viñetas clave (4 min)' },
      { done: false, current: false, title: '3. Exportar borrador PDF a Figma (3 min)' },
      { done: false, current: false, title: '4. Enviar enlace de revisión a Sofía (2 min)' },
    ],
  },
  quickCreate: {
    title: 'Crear nueva tarea o paso',
    subtitle: 'Escribe solo una acción de 3 a 5 minutos',
    badge: 'Desglose anti-fricción',
  },
  queue: {
    title: 'Cola de espera',
    subtitle: '(Sin sobrecarga)',
    maxVisible: 'Máximo 3 visibles',
    items: [
      {
        id: 'q1',
        name: 'Revisión y respuesta a email de cliente',
        stepCount: 3,
        totalMinutes: 8,
        status: 'ready',
        statusLabel: 'Lista para iniciar',
      },
      {
        id: 'q2',
        name: 'Actualizar dependencias de proyecto SQLite',
        stepCount: 2,
        totalMinutes: 6,
        status: 'draft',
        statusLabel: 'Borrador',
      },
    ],
  },
  antiOverwhelm: {
    title: '¿Muchas cosas pendientes?',
    body: 'Elige solo una y oculta el resto por 25 minutos. Tu mente necesita calma, no prisa.',
    cta: 'Activar modo túnel anti-abrumamiento',
  },
  banner: {
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA89s-vNTw3UF4Z1kl4Vw8s2HHfTL_Vtjh_xEAbXQb0B7ch_aXVK2w4WxgeVhFsYupSn9kw1SsH0wMcA0leIoAToe1swA9GzO7oG4Mjx9KQVKmyh_nsW1lEQxbVZ0bhNYHpBvxSVkn_NQXSJmuWkqxAZshpa6jtEr3wn4htjbswH7xOzeMXTGysGKox2nRU8tR2aKmq8gKKzSByB8ZPk35Nabqy0GDdUuv4TRjRhNcZ08VwEfvTHqZ_',
    caption: 'Un paso a la vez es suficiente para avanzar hoy.',
  },
};

export const detalleFixtures: DetalleFixtures = {
  headerTitle: 'Detalle de Tarea',
  summary: {
    statusBadge: 'En progreso · Paso 2 de 4',
    title: 'Rediseño de Propuesta Comercial Q3',
    description:
      'Preparar documento para el cliente corporativo. Prioridad al alcance técnico antes de afinar márgenes.',
    progress: {
      percentLabel: '50% completado',
      remainingLabel: '~9 min restantes',
      doneLabel: '2 de 4 pasos listos',
      paceLabel: 'Ritmo sereno',
      statuses: ['done', 'current', 'pending', 'pending'],
    },
  },
  stepsTitle: 'Secuencia de pasos',
  addStep: 'Añadir paso',
  steps: [
    {
      variant: 'completed',
      index: 1,
      title: 'Abrir borrador y listar puntos de dolor',
      meta: 'Completado · 2 min',
    },
    {
      variant: 'active',
      index: 2,
      title: 'Escribir las 3 viñetas de solución técnica',
      meta: 'En foco · 4 min',
      minutes: 4,
      description: 'Solo concéntrate en la arquitectura y beneficios clave. Sin adjetivos de venta aún.',
      activeBadge: 'Foco actual',
      activeCta: 'Ejecutar este paso ahora',
    },
    {
      variant: 'pending',
      index: 3,
      title: 'Estimar calendario de entregas',
      meta: 'En espera · 3 min',
    },
    {
      variant: 'pending',
      index: 4,
      title: 'Lectura final rápida y exportar PDF',
      meta: 'En espera · 2 min',
    },
  ],
  management: [
    { key: 'editar', label: 'Editar', icon: 'edit' },
    { key: 'reordenar', label: 'Reordenar', icon: 'swap_vert' },
    { key: 'plantilla', label: 'Plantilla', icon: 'content_copy' },
  ],
  calm: {
    title: 'Respiro consciente',
    body: 'Recuerda: no necesitas completar todos los pasos hoy. Solo uno basta para vencer la resistencia.',
  },
  actions: {
    primary: 'INICIAR PASO 2 EN FOCO (4 MIN)',
    secondary: 'Marcar tarea completa',
  },
};