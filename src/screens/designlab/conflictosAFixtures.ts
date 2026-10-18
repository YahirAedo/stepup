/**
 * Fixtures de la preview "Conflictos de sincronización" (flujo Perfil,
 * Variante A) del Design Lab.
 *
 * Acá vive TODO el texto visible y los datos de demo; la pantalla solo dibuja.
 * El conflicto es POR ITEM: un mismo dato se editó en el teléfono y en la nube
 * casi al mismo tiempo. Se muestran las dos versiones (nombre, estado y fecha)
 * y una acción por lado.
 *
 * NO se muestran "pasos por versión" ni "fusión inteligente": la app pide
 * elegir una versión completa, no mezclar campos.
 *
 * Reglas de copy (decision de producto): prohibido "consciente", "serena/sereno",
 * "calma", "respiro", "mente", "resistencia", "ritual", "mindful", "friccion",
 * "abrumamiento", "sin prisa" y "micro-paso".
 */

export interface ConflictoVersion {
  name: string;
  statusLabel: string;
  modifiedLabel: string;
}

export interface ConflictoItem {
  id: number;
  kind: 'Tarea' | 'Paso';
  local: ConflictoVersion;
  server: ConflictoVersion;
}

export const conflictosCopy = {
  headerTitle: 'Conflictos',
  intro: 'Se editó lo mismo en este teléfono y en la nube. Elegí con qué versión quedarte.',
  kindSuffix: 'editada en los dos lados',
  localLabel: 'Este dispositivo',
  serverLabel: 'La nube',
  localAction: 'Conservar esta',
  serverAction: 'Conservar la nube',
  emptyTitle: 'Todo en orden',
  emptyBody: 'No quedan conflictos. Tus datos están sincronizados.',
  backCta: 'Volver al perfil',
} as const;

export function conflictosRemainingLabel(remaining: number): string {
  return remaining === 1 ? 'Queda 1 conflicto por resolver.' : `Quedan ${remaining} conflictos por resolver.`;
}

export const conflictosFixtures: ConflictoItem[] = [
  {
    id: 1,
    kind: 'Tarea',
    local: {
      name: 'Preparar el parcial de Anatomía',
      statusLabel: 'Activa',
      modifiedLabel: 'Hoy, 09:12',
    },
    server: {
      name: 'Estudiar para Anatomía',
      statusLabel: 'Activa',
      modifiedLabel: 'Hoy, 09:05',
    },
  },
  {
    id: 2,
    kind: 'Paso',
    local: {
      name: 'Resumen del capítulo 3',
      statusLabel: 'Completado',
      modifiedLabel: 'Ayer, 21:40',
    },
    server: {
      name: 'Leer el capítulo 3',
      statusLabel: 'Pendiente',
      modifiedLabel: 'Ayer, 21:33',
    },
  },
];
