export type Periodo = 'dia' | 'semana' | 'mes';

/**
 * Calcula los límites inferior y superior para un rango de fechas basado en el periodo deseado.
 * @param periodo - El periodo ('dia', 'semana', 'mes')
 * @param fechaStr - La fecha de referencia en formato YYYY-MM-DD
 * @returns Rango con `startDate` y `endDate`
 */
export function getDynamicDateRange(periodo: Periodo, fechaStr: string): { startDate: Date; endDate: Date } {
  // Asegurar que usemos hora local si es solo la fecha (agregando T00:00:00 o parseando correctamente)
  const parts = fechaStr.split('-');
  if (parts.length !== 3) {
    throw new Error('Fecha inválida. Formato esperado: YYYY-MM-DD');
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexado
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida tras el parseo.');
  }

  let startDate: Date;
  let endDate: Date;

  switch (periodo) {
    case 'dia':
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      break;

    case 'semana': {
      // Ajustar a Lunes (1) a Domingo (0)
      const dayOfWeek = date.getDay(); // Domingo=0, Lunes=1, ..., Sábado=6
      const diffToMonday = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(date.getFullYear(), date.getMonth(), diffToMonday, 0, 0, 0, 0);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999);
      break;
    }

    case 'mes':
      startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    default:
      throw new Error("Periodo inválido. Debe ser 'dia', 'semana' o 'mes'");
  }

  return { startDate, endDate };
}
