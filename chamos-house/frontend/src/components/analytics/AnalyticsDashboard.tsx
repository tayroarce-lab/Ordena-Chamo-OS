import { MONTHLY_MOCK, WEEKLY_MOCK, DAILY_MOCK } from '@/data/analytics.mock';
import { useDrillDown } from '@/hooks/useDrillDown';
import { MonthlyView } from './MonthlyView';
import { WeeklyView } from './WeeklyView';
import { DailyView } from './DailyView';
import { AnimatePresence, motion } from 'framer-motion';

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

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    out: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="bg-bg-primary min-h-screen relative">
      <AnimatePresence mode="wait">
        {state.view === 'monthly' && (
          <motion.div
            key="monthly"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="absolute w-full"
          >
            <MonthlyView
              data={MONTHLY_MOCK}
              onWeekClick={goToWeek}
            />
          </motion.div>
        )}

        {state.view === 'weekly' && state.weekNumber && (
          <motion.div
            key="weekly"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="absolute w-full"
          >
            <WeeklyView
              data={WEEKLY_MOCK}
              onDayClick={goToDay}
              onGoToMonthly={goToMonthly}
              weekNumber={state.weekNumber}
            />
          </motion.div>
        )}

        {state.view === 'daily' && (
          <motion.div
            key="daily"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="absolute w-full"
          >
            <DailyView
              data={DAILY_MOCK}
              onGoToMonthly={goToMonthly}
              onGoToWeek={goToWeek}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
