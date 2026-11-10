/**
 * Radios "Serene Focus".
 *
 * Origen: `borderRadius` del `tailwind.config` del mockup, raiz 16px.
 * OJO: la prosa de `serene_focus/DESIGN.md` ## Border Radius propone 8/16/24
 * (otra iteracion). Manda el HTML renderizado: 4 / 8 / 12 / full. Documentado
 * en la DT de #295.
 */
export const sereneBorderRadius = {
  DEFAULT: 0.25 * 16, // 4
  lg: 0.5 * 16, // 8
  xl: 0.75 * 16, // 12
  full: 9999,
} as const;

export type SereneBorderRadius = typeof sereneBorderRadius;
