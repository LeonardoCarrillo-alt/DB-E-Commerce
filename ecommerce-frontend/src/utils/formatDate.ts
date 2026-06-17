// formatDate.ts
const isValidDate = (dateStr: any): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

export const formatDate = (dateString: string): string => {
  // 🚨 Validación de seguridad
  if (!isValidDate(dateString)) return "Fecha no disponible";

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export const formatDateShort = (dateString: string): string => {
  // 🚨 Validación de seguridad
  if (!isValidDate(dateString)) return "Pendiente";

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateString));
}

export const formatDateTime = (dateString: string): string => {
  // 🚨 Validación de seguridad
  if (!isValidDate(dateString)) return "Sin fecha/hora";

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}