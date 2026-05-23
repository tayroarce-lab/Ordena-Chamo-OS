import type { PeriodoReporte } from '../types';

export function getDynamicDateRange(
  periodo: PeriodoReporte,
  fechaStr: string
): { startDate: Date; endDate: Date } {
  const parts = fechaStr.split('-');
  if (parts.length !== 3) {
    throw new Error('Fecha inválida. Formato esperado: YYYY-MM-DD');
  }

  const year = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10) - 1;
  const day = Number.parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  if (Number.isNaN(date.getTime())) {
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
      const dayOfWeek = date.getDay();
      const diffToMonday = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(date.getFullYear(), date.getMonth(), diffToMonday, 0, 0, 0, 0);
      endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + 6,
        23,
        59,
        59,
        999
      );
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

export function getTodayRange(): { startOfToday: Date; endOfToday: Date } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { startOfToday, endOfToday };
}

export function sanitizeTelefono(telefono: string): string {
  return telefono.replace(/\D/g, '');
}
