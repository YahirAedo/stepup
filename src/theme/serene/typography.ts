import type { TypographyStyle } from '../../types/theme';

/**
 * Escala tipografica "Serene Focus" — Space Grotesk (display) + Inter (body).
 *
 * Origen: `fontSize` + `fontFamily` del `tailwind.config` del mockup
 * `stepup_cron_metro_limpio_modo_claro`. 13 tokens.
 *
 * EXCEPCION DOCUMENTADA AL DS (#295): el `zenith-vitality-ds` SKILL.md fija
 * "siempre Manrope + Plus Jakarta Sans". Las previews del Design Lab usan
 * Space Grotesk + Inter porque el mockup las pide explicitamente. El alcance
 * de la excepcion son SOLO las pantallas bajo `src/screens/designlab/`, y
 * caduca cuando el epico de migracion de paleta defina las fuentes
 * definitivas de la app. Issue #295.
 *
 * `letterSpacing` se convierte em -> px multiplicando por el fontSize de cada
 * token (no por 16 como hace `src/theme/typography.ts`): en tokens chicos
 * (label-sm 11px) la diferencia de tracking es perceptible. Ver
 * `src/theme/typography.ts` si se decide unificar la convencion.
 *
 * NO se bakea `textTransform` en los tokens: el HTML lo aplica con la clase
 * `uppercase` elemento por elemento, no en toda la escala. Se aplica inline
 * donde el mockup lo pide.
 */
export type SereneTypography = Record<string, TypographyStyle>;

const SPACE_GROTESK_500 = 'SpaceGrotesk_500Medium';
const SPACE_GROTESK_600 = 'SpaceGrotesk_600SemiBold';
const INTER_400 = 'Inter_400Regular';

export const sereneTypography: SereneTypography = {
  'display-lg': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 48,
    fontWeight: '600',
    lineHeight: 56,
    letterSpacing: -0.03 * 48,
  },
  'display-lg-mobile': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 44,
    letterSpacing: -0.02 * 36,
  },
  'headline-lg': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
    letterSpacing: -0.02 * 32,
  },
  'headline-lg-mobile': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 34,
    letterSpacing: -0.015 * 26,
  },
  'headline-md': {
    fontFamily: SPACE_GROTESK_500,
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 32,
    letterSpacing: -0.01 * 24,
  },
  'headline-sm': {
    fontFamily: SPACE_GROTESK_500,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: 0,
  },
  'title-md': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.005 * 16,
  },
  'body-lg': {
    fontFamily: INTER_400,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0,
  },
  'body-md': {
    fontFamily: INTER_400,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  'body-sm': {
    fontFamily: INTER_400,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  'label-lg': {
    fontFamily: SPACE_GROTESK_500,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.01 * 14,
  },
  'label-md': {
    fontFamily: SPACE_GROTESK_500,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.02 * 12,
  },
  'label-sm': {
    fontFamily: SPACE_GROTESK_600,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.04 * 11,
  },
};
