import { useState, useMemo } from 'react';
import type { DrillDownState, BreadcrumbItem } from '../types/analytics.types';

interface UseDrillDownReturn {
  state: DrillDownState;
  goToMonthly: () => void;
  goToWeek: (weekNumber: number) => void;
  goToDay: (dayNumber: number) => void;
  breadcrumbs: BreadcrumbItem[];
}

export function useDrillDown(): UseDrillDownReturn {
  const [state, setState] = useState<DrillDownState>({
    view: 'monthly',
    year: 2025,
    month: 7,
  });

  const goToMonthly = () => {
    setState({
      view: 'monthly',
      year: state.year,
      month: state.month,
    });
  };

  const goToWeek = (weekNumber: number) => {
    setState({
      view: 'weekly',
      year: state.year,
      month: state.month,
      weekNumber,
    });
  };

  const goToDay = (dayNumber: number) => {
    setState({
      view: 'daily',
      year: state.year,
      month: state.month,
      weekNumber: state.weekNumber,
      day: dayNumber,
    });
  };

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const monthNames = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const monthLabel = monthNames[state.month - 1] || 'MES';
    const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

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
      // Compute day of week (simplified - on real scenario would need actual date)
      const dayName = dayNames[state.day ? (state.day % 7) : 0] || 'DÍA';
      return [
        { label: 'DASHBOARD', onClick: goToMonthly },
        { label: monthLabel },
        { label: `SEMANA ${state.weekNumber}`, onClick: () => goToWeek(state.weekNumber!) },
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
    breadcrumbs,
  };
}
