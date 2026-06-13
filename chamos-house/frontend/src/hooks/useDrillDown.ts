import { useState, useMemo } from 'react';
import type { DrillDownState, BreadcrumbItem, DashboardView } from '../types/analytics.types';

interface UseDrillDownReturn {
  state: DrillDownState;
  goToMonthly: () => void;
  goToWeek: (weekNumber: number) => void;
  goToDay: (date: Date) => void;
  changeMonth: (date: Date) => void;
  setView: (view: DashboardView) => void;
  breadcrumbs: BreadcrumbItem[];
}

export function useDrillDown(): UseDrillDownReturn {
  const today = new Date();
  const [state, setState] = useState<DrillDownState>({
    view: 'monthly',
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    dateStr: today.toISOString().split('T')[0],
  });

  const goToMonthly = () => {
    setState(s => ({ ...s, view: 'monthly' }));
  };

  const goToWeek = (weekNumber: number) => {
    setState(s => ({ ...s, view: 'weekly', weekNumber }));
  };

  const goToDay = (date: Date) => {
    // Para evitar desfases de timezone, trabajamos localmente
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    setState(s => ({
      ...s,
      view: 'daily',
      year,
      month,
      day,
      dateStr,
      weekNumber: Math.ceil(day / 7)
    }));
  };

  const changeMonth = (date: Date) => {
    setState(s => ({
      ...s,
      year: date.getFullYear(),
      month: date.getMonth() + 1
    }));
  };

  const setView = (view: DashboardView) => {
    setState(s => ({ ...s, view }));
  }

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const monthNames = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const monthLabel = monthNames[state.month - 1] || 'MES';

    if (state.view === 'monthly') {
      return [{ label: 'DASHBOARD' }];
    }

    if (state.view === 'weekly') {
      return [
        { label: 'DASHBOARD', onClick: goToMonthly },
        { label: monthLabel },
        { label: `DETALLE SEMANA ${state.weekNumber}` },
      ];
    }

    if (state.view === 'daily') {
      const dDate = state.dateStr ? new Date(`${state.dateStr}T12:00:00Z`) : new Date();
      const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
      const dayName = dayNames[dDate.getUTCDay()] || 'DÍA';
      
      return [
        { label: 'DASHBOARD', onClick: goToMonthly },
        { label: monthLabel },
        { label: `SEMANA ${state.weekNumber || 1}`, onClick: () => goToWeek(state.weekNumber || 1) },
        { label: `${dayName} ${state.day}` },
      ];
    }

    return [{ label: 'DASHBOARD' }];
  }, [state]);

  return {
    state,
    goToMonthly,
    goToWeek,
    goToDay,
    changeMonth,
    setView,
    breadcrumbs,
  };
}
