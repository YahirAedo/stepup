/**
 * Escala de espaciado "Serene Focus".
 *
 * Origen: `spacing` del `tailwind.config` del mockup
 * `stepup_cron_metro_limpio_modo_claro`. El mockup esta expresado en `rem`
 * con raiz 16px, asi que 1rem = 16px.
 *
 * Nombres conservados del mockup (no del theme de produccion) para que la
 * traduccion sea 1:1 y las 28 pantallas se puedan portar sin reinterpretar.
 */
export const sereneSpacing = {
  'space-xs': 0.25 * 16, // 4
  'space-sm': 0.5 * 16, // 8
  'space-md': 1 * 16, // 16
  'space-lg': 1.5 * 16, // 24
  'space-xl': 2.5 * 16, // 40
  gutter: 1.25 * 16, // 20
  'gutter-desktop': 1.5 * 16, // 24
  margin: 1.25 * 16, // 20
  'margin-tablet': 2 * 16, // 32
  'margin-desktop': 3 * 16, // 48
} as const;

export type SereneSpacing = typeof sereneSpacing;
