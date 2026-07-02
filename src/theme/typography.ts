import type { TypographyStyle } from '../types/theme';

export const typography: Record<string, TypographyStyle> = {
  display: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: -0.04 * 16,
  },
  'headline-lg': {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.03 * 16,
  },
  'headline-lg-mobile': {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.03 * 16,
  },
  'headline-md': {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.02 * 16,
  },
  'body-lg': {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0,
  },
  'body-md': {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  'label-md': {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.01 * 16,
  },
  'label-sm': {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.05 * 16,
  },
};
