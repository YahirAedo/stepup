/**
 * Theme "Serene Focus" — entrada oficial del rediseño durante la migración.
 *
 * Las pantallas nuevas (rediseño Serene) importan de aquí. Las pantallas viejas
 * siguen en el theme de producción (`src/theme/index.ts`, Zenith). Un archivo
 * importa uno u otro, nunca los dos: lo verifica `src/theme/themeMix.test.ts`.
 * Los módulos neutrales `../layout` y `../responsive` (medidas y escala, sin
 * tokens visuales) están permitidos en ambos lados.
 *
 * Sigue sin reexportarse desde `src/theme/index.ts` a propósito: mantenerlo
 * separado permite que la Fase 7 borre Zenith o Serene en un solo commit sin
 * tocar el barrel compartido.
 *
 * `scale` / `useResponsive` se reexportan desde el theme padre para que las
 * pantallas nuevas no tengan que importar de dos lugares distintos.
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
