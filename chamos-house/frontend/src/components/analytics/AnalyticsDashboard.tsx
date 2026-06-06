import { MONTHLY_MOCK, WEEKLY_MOCK, DAILY_MOCK } from '@/data/analytics.mock';
import { useDrillDown } from '@/hooks/useDrillDown';
import { MonthlyView } from './MonthlyView';
import { WeeklyView } from './WeeklyView';
import { DailyView } from './DailyView';

/**
 * AnalyticsDashboard
 * 
 * Componente orquestador que gestiona la navegación drill-down entre
 * vistas mensuales, semanales y diarias. Usa useDrillDown para mantener
 * el estado de navegación y renderiza la vista correcta según el estado actual.
 * 
 * TODO: Conectar con API real cuando esté disponible.
 * Endpoints esperados:
 * - GET /api/analytics/monthly?year=2025&month=7
 * - GET /api/analytics/weekly?year=2025&month=7&week=2
 * - GET /api/analytics/daily?date=2025-07-15
 */
export function AnalyticsDashboard() {
  const { state, goToMonthly, goToWeek, goToDay } = useDrillDown();

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {state.view === 'monthly' && (
        <MonthlyView
          data={MONTHLY_MOCK}
          onWeekClick={goToWeek}
        />
      )}
      {state.view === 'weekly' && state.weekNumber && (
        <WeeklyView
          data={WEEKLY_MOCK}
          onDayClick={goToDay}
          onGoToMonthly={goToMonthly}
          weekNumber={state.weekNumber}
        />
      )}
      {state.view === 'daily' && (
        <DailyView
          data={DAILY_MOCK}
          onGoToMonthly={goToMonthly}
          onGoToWeek={goToWeek}
        />
      )}
    </div>
  );
}
