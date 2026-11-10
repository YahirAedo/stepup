import type { ShadowStyle } from '../../types/theme';
import { sereneColors } from './colors';

/**
 * Sombras "Serene Focus" — ambientes, no sinteticas.
 *
 * Origen: seccion "## Elevation & Depth" de `serene_focus/DESIGN.md`, que
 * declara: "This system avoids dark, synthetic drop shadows" y define
 * box-shadow en dos tiers con `rgba(26, 28, 30, ...)` — que es exactamente
 * el color `on-surface` de la paleta. De ahi que el `shadowColor` salga de un
 * token y no de un hex hardcodeado.
 *
 * RN `ShadowStyle` no soporta box-shadow multi-capa ni spread negativo, asi
 * que se conserva la capa dominante de cada tier. En Android el `elevation`
 * es la unica que se renderiza, y RN no la pesa con el color del token: se
 * mantiene baja a proposito para no re-introducir la sombra sintetica que
 * DESIGN.md prohibe.
 *
 * El HTML del mockup pide `shadow-md` en MARCAR PASO HECHO mientras
 * DESIGN.md dice "Zero drop shadow" para la accion primaria. Sintesis
 * elegida: hay sombra, pero del tier `card` (4% ambiente). Asi se cumplen
 * las dos intenciones. Ver DT de #295.
 */
export const sereneShadows = {
  /** Equivale al tier "Active Card Tier": 0 4px 20px rgba(26,28,30,0.04). */
  card: {
    shadowColor: sereneColors['on-surface'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  /** Equivale al tier "Focused Modal / Sheet Tier": 0 12px 36px rgba(...,0.06). */
  sheet: {
    shadowColor: sereneColors['on-surface'],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 36,
    elevation: 4,
  },
} satisfies Record<string, ShadowStyle>;

export type SereneShadows = typeof sereneShadows;
