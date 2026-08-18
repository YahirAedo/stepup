import { Dimensions, Platform, useWindowDimensions } from 'react-native';

/** Baseline de diseño: iPhone 11 (375pt de ancho). */
const BASE_WIDTH = 375;

/**
 * Ancho máximo efectivo de layout en web.
 *
 * En web el viewport puede medir 600-1280px+ y `scale()` explotaría
 * (elementos gigantes). Se limita el ancho usado para escalar al de una
 * tablet, manteniendo proporciones coherentes en el preview web.
 */
const MAX_WEB_LAYOUT_WIDTH = 600;

/**
 * Ancho efectivo usado para escalar. En web se limita a
 * `MAX_WEB_LAYOUT_WIDTH`; en native (Expo Go) se usa el ancho real.
 */
function effectiveLayoutWidth(width: number): number {
  if (Platform.OS === 'web') {
    return Math.min(width, MAX_WEB_LAYOUT_WIDTH);
  }
  return width;
}

/**
 * Escala lineal proporcional al ancho de pantalla.
 * Usar para tamaños absolutos que deben escalar con el dispositivo:
 * iconos decorativos, rings del timer, ilustraciones, checkmarks grandes.
 *
 * En web el ancho efectivo se limita a `MAX_WEB_LAYOUT_WIDTH` (600) para que
 * los elementos no se vuelvan gigantes con viewports de escritorio.
 *
 * ```tsx
 * <View style={{ width: scale(224), height: scale(224) }} />
 * ```
 */
export const scale = (size: number): number => {
  return (effectiveLayoutWidth(Dimensions.get('window').width) / BASE_WIDTH) * size;
};

/**
 * Escala moderada — mezcla entre escala lineal y el valor original.
 * Usar para elementos donde el escalado completo se siente exagerado:
 * padding interno, border radius, iconos pequeños.
 *
 * @param factor - qué tanto escala (0 = nada, 1 = escala completa). Default 0.5.
 *
 * ```tsx
 * <View style={{ borderRadius: moderateScale(12) }} />
 * ```
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/** Tipo del hook useResponsive. */
export interface Responsive {
  /** Escala lineal — wrapper de `scale()` reactivo a cambios de dimensión. */
  scale: (n: number) => number;
  /** true si el ancho es menor a 360pt (iPhone SE, pantallas chicas). */
  isSmall: boolean;
  /** true si el ancho está entre 360 y 599pt (phones normales). */
  isMedium: boolean;
  /** true si el ancho es 600pt o más (tablets). */
  isTablet: boolean;
}

/**
 * Hook responsive que se actualiza automáticamente al rotar o cambiar
 * de dispositivo (split view, multitarea).
 *
 * Preferir este hook sobre `scale()` directo cuando el componente
 * pueda cambiar de tamaño en runtime.
 *
 * ```tsx
 * function TimerWidget() {
 *   const { scale: s, isSmall } = useResponsive();
 *   return <View style={{ width: s(256), height: s(256) }} />;
 * }
 * ```
 */
export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  const layoutWidth = effectiveLayoutWidth(width);

  return {
    scale: (n: number) => (layoutWidth / BASE_WIDTH) * n,
    isSmall: width < 360,
    isMedium: width >= 360 && width < 600,
    isTablet: width >= 600,
  };
}
