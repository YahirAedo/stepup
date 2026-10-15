/**
 * Convierte un token de color hex a `rgba()` con alfa.
 *
 * Existe para que los modificadores de opacidad de Tailwind del mockup
 * (`bg-primary-fixed/20`, `bg-surface-container-highest/95`) NO se traduzcan
 * a un `rgba(...)` hardcodeado dentro de una pantalla — eso seria
 * anti-pattern del DS ("colores hardcodeados") y lo va a barrer el
 * `npm run check:ds` de #237.
 *
 * El color SIEMPRE entra como token del theme; aca solo se le aplica alfa.
 *
 * ```tsx
 * backgroundColor: withAlpha(sereneColors['primary-fixed'], 0.2)
 * ```
 *
 * @param hex - token de color en formato `#rrggbb`
 * @param alpha - alfa entre 0 y 1
 */
export function withAlpha(hex: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`withAlpha espera un color #rrggbb, recibio: ${hex}`);
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamped = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clamped})`;
}
