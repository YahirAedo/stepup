import type { TextStyle, ViewStyle } from 'react-native';

export interface ThemeColors {
  surface: string;
  'surface-dim': string;
  'surface-bright': string;
  'surface-container-lowest': string;
  'surface-container-low': string;
  'surface-container': string;
  'surface-container-high': string;
  'surface-container-highest': string;
  'on-surface': string;
  'on-surface-variant': string;
  'inverse-surface': string;
  'inverse-on-surface': string;
  outline: string;
  'outline-variant': string;
  'surface-tint': string;
  primary: string;
  'on-primary': string;
  'primary-container': string;
  'on-primary-container': string;
  'inverse-primary': string;
  secondary: string;
  'on-secondary': string;
  'secondary-container': string;
  'on-secondary-container': string;
  tertiary: string;
  'on-tertiary': string;
  'tertiary-container': string;
  'on-tertiary-container': string;
  error: string;
  'on-error': string;
  'error-container': string;
  'on-error-container': string;
  'primary-fixed': string;
  'primary-fixed-dim': string;
  'on-primary-fixed': string;
  'on-primary-fixed-variant': string;
  'secondary-fixed': string;
  'secondary-fixed-dim': string;
  'on-secondary-fixed': string;
  'on-secondary-fixed-variant': string;
  'tertiary-fixed': string;
  'tertiary-fixed-dim': string;
  'on-tertiary-fixed': string;
  'on-tertiary-fixed-variant': string;
  background: string;
  'on-background': string;
  'surface-variant': string;
}

export type TypographyStyle = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'>;

export interface ThemeTypography {
  display: TypographyStyle;
  'headline-lg': TypographyStyle;
  'headline-lg-mobile': TypographyStyle;
  'headline-md': TypographyStyle;
  'body-lg': TypographyStyle;
  'body-md': TypographyStyle;
  'label-md': TypographyStyle;
  'label-sm': TypographyStyle;
}

export interface ThemeSpacing {
  unit: number;
  'container-padding': number;
  'stack-gap': number;
  'section-gap': number;
  gutter: number;
}

export interface ThemeBorderRadius {
  sm: number;
  DEFAULT: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeShadows {
  ambient: ShadowStyle;
  card: ShadowStyle;
  elevated: ShadowStyle;
  fab: ShadowStyle;
}

export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}
