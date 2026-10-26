import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MdiName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Mapeo de los iconos que usan los mockups de Tareas (Material Symbols
 * Outlined) a nombres validos de `MaterialCommunityIcons` (MCI).
 *
 * Los HTML fuente piden la fuente "Material Symbols Outlined" (`<span
 * class="material-symbols-outlined">spa</span>`). En RN no se carga esa fuente;
 * MCI es el set equivalente instalado. Este mapa centraliza la traduccion y el
 * tipo `MdiName` valida cada valor en compilacion: si un icono no existe en MCI,
 * el typecheck falla.
 *
 * Las keys conservan el nombre del Material Symbol del mockup para que la
 * busqueda en el HTML sea literal.
 */
export const mciIconMap = {
  spa: 'flower',
  checklist: 'format-list-checks',
  calendar_today: 'calendar-today',
  schedule: 'clock-outline',
  subdirectory_arrow_right: 'arrow-bottom-right',
  play_arrow: 'play',
  arrow_forward: 'arrow-right',
  arrow_forward_ios: 'chevron-right',
  expand_less: 'chevron-up',
  expand_more: 'chevron-down',
  check: 'check',
  add: 'plus',
  self_improvement: 'yoga',
  visibility_off: 'eye-off-outline',
  eco: 'leaf',
  edit: 'pencil-outline',
  delete: 'trash-can-outline',
  undo: 'undo',
  more_vert: 'dots-vertical',
  flag: 'flag-outline',
  lightbulb: 'lightbulb-on-outline',
  bolt: 'lightning-bolt',
  auto_awesome: 'auto-fix',
  drag_indicator: 'drag',
  hourglass_empty: 'timer-sand',
  add_task: 'playlist-plus',
  label_important: 'label-outline',
  celebration: 'party-popper',
  format_quote: 'format-quote-open',
  lock_clock: 'lock-outline',
  energy_savings_leaf: 'leaf',
  person: 'account',
  timer: 'timer-outline',
  format_list_bulleted: 'format-list-bulleted',
  history_edu: 'history',
  arrow_back: 'arrow-left',
  more_horiz: 'dots-horizontal',
  timelapse: 'timelapse',
  alt_route: 'routes',
  target: 'target',
  done: 'check',
  check_circle: 'check-circle-outline',
  drag_handle: 'drag-horizontal-variant',
  swap_vert: 'swap-vertical',
  content_copy: 'content-copy',
  play_circle: 'play-circle',
  task_alt: 'checkbox-marked-circle-outline',
} satisfies Record<string, MdiName>;

export type MciSymbolKey = keyof typeof mciIconMap;

/** Devuelve el nombre MCI correspondiente a un icono del mockup. */
export function mci(symbol: MciSymbolKey): MdiName {
  return mciIconMap[symbol];
}