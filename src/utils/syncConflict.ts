export function formatModifiedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  if (date.toDateString() === now.toDateString()) return `Hoy, ${time}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Ayer, ${time}`;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}, ${time}`;
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completada';
    case 'active':
      return 'Activa';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
}
