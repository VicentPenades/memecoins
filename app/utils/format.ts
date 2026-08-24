export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDuracion = (minutos: number) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas > 0) {
    return `${horas}h ${mins}m`;
  }
  return `${mins}m`;
};
