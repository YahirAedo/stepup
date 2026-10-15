import React from 'react';
import FocusRunningView from '../../components/designlab/FocusRunningView';
import { corriendoFixtures } from './focusFixtures';

/**
 * Pantalla del mockup `stepup_cron_metro_limpio_modo_claro` — WRAPPER.
 *
 * - Header custom, tab bar oculta (gestionada desde ProfileStack).
 * - Timer local, datos mock. `MARCAR PASO HECHO` SOLO muestra toast y cambia
 *   el boton a COMPLETADO; NO escribe en SQLite.
 * - Comparte la vista corriendo con `FocusPrevioScreen` vía `FocusRunningView`.
 */
export default function CronometroLimpioScreen() {
  return (
    <FocusRunningView
      initialSeconds={corriendoFixtures.timer.initialSeconds}
      maxSeconds={corriendoFixtures.timer.maxSeconds}
      fixtures={corriendoFixtures}
      headerTitle="Cronómetro"
    />
  );
}