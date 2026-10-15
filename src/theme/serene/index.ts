/**
 * Theme "Serene Focus" — Design Lab, AISLADO del theme de produccion.
 *
 * Uso exclusivo de las previews bajo `src/screens/designlab/`. No se reexporta
 * desde `src/theme/index.ts` a proposito: mantenerlo separado permite que la
 * migracion pantalla por pantalla (epico posterior a #295) borre o promueva
 * este folder en un solo commit sin tocar el barrel compartido.
 *
 * `scale` / `useResponsive` se reexportan desde el theme padre para que las
 * previews no tengan que importar de dos lugares distintos.
 *
 * Issue: #295.
 */
export { sereneColors } from './colors';
export { sereneTypography, type SereneTypography } from './typography';
export { sereneSpacing, type SereneSpacing } from './spacing';
export { sereneBorderRadius, type SereneBorderRadius } from './borderRadius';
export { sereneShadows, type SereneShadows } from './shadows';
export { withAlpha } from './alpha';
export { scale, useResponsive } from '../responsive';
