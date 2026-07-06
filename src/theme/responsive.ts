import { Dimensions, useWindowDimensions } from 'react-native';

/** Baseline de diseño: iPhone 11 (375pt de ancho). */
const BASE_WIDTH = 375;

/**
 * Escala lineal proporcional al ancho de pantalla.
 * Usar para tamaños absolutos que deben escalar con el dispositivo:
 * iconos decorativos, rings del timer, ilustraciones, checkmarks grandes.
 *
 * ```tsx
 * <View style={{ width: scale(224), height: scale(224) }} />
 * ```
 */
export const scale = (size: number): number => {
  return (Dimensions.get('window').width / BASE_WIDTH) * size;
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

  return {
    scale: (n: number) => (width / BASE_WIDTH) * n,
    isSmall: width < 360,
    isMedium: width >= 360 && width < 600,
    isTablet: width >= 600,
  };
}
