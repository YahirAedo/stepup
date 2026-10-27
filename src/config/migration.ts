/**
 * Banderas de la migración Design Lab → app real.
 *
 * Cada bandera elige, por área, entre la pantalla nueva (Serene) y la vieja
 * (Zenith) en cada ruta durante la migración. Se activan fase por fase y se
 * borran en la Fase 7, cuando ya no quede ninguna pantalla Zenith.
 * Ver `docs/MIGRACION.md`.
 */
export const migrationFlags = {
  tabs: false,
  tasks: false,
  focus: false,
  profile: false,
  auth: false,
};
