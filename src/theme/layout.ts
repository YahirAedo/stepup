import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from './responsive';

/** Altura del pill del GlassTabBar (antes de escala). */
export const TAB_BAR_HEIGHT = 56;
/** Separación del pill respecto al borde inferior de la pantalla. */
export const TAB_BAR_MARGIN = 16;
/** Diámetro del FAB (antes de escala). */
export const FAB_SIZE = 56;
/** Espacio entre el pill del glassbar y el FAB. */
export const FAB_GAP = 8;
/** Margen extra para que el último item no quede pegado al pill. */
export const CONTENT_EXTRA_PADDING = 16;

/**
 * Medidas compartidas de la barra inferior flotante y el FAB.
 * GlassTabBar, FloatingActionButton y las screens usan los mismos valores,
 * evitando desalineaciones entre componentes.
 */
export function useBottomLayout() {
  const { scale: s } = useResponsive();
  const insets = useSafeAreaInsets();

  const tabBarHeight = s(TAB_BAR_HEIGHT);
  const tabBarMargin = s(TAB_BAR_MARGIN);
  const fabSize = s(FAB_SIZE);
  const fabGap = s(FAB_GAP);
  const extra = s(CONTENT_EXTRA_PADDING);

  // Posición del pill desde el borde inferior de la pantalla.
  const tabBarOffset = insets.bottom + tabBarMargin;
  // Posición del FAB: arriba del pill.
  const fabOffset = tabBarOffset + tabBarHeight + fabGap;

  return {
    insets,
    tabBarHeight,
    tabBarMargin,
    tabBarOffset,
    fabSize,
    fabGap,
    fabOffset,
    /** paddingBottom para screens que solo tienen el glassbar (sin FAB). */
    contentPaddingBottom: tabBarOffset + tabBarHeight + extra,
    /** paddingBottom para screens que además tienen el FAB visible (tab Tasks). */
    contentPaddingBottomWithFab: fabOffset + fabSize + extra,
  };
}
