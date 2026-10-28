/**
 * Formatea una fecha ISO a dd/mm/aaaa.
 *
 * Las fechas sin hora (YYYY-MM-DD) se parsean directamente del string para
 * evitar desplazamiento de zona horaria. Las que traen hora se convierten
 * a hora local.
 *
 * @param iso string ISO 8601 o null
 * @returns string con formato dd/mm/aaaa o null si la entrada es inválida
 */
export function formatDateShort(iso: string | null): string | null {
  if (!iso) return null;

  // Fecha sin hora: YYYY-MM-DD, parsear directamente sin Date
  const onlyDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (onlyDateMatch) {
    const [, year, month, day] = onlyDateMatch;
    return `${day}/${month}/${year}`;
  }

  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
