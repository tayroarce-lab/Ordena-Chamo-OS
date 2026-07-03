import { useDrillDown } from '@/features/analytics/hooks/useDrillDown';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { MonthlyView } from './MonthlyView';
import { WeeklyView } from './WeeklyView';
import { DailyView } from './DailyView';
import { CalendarPicker } from './CalendarPicker';
import { AnimatePresence, motion } from 'framer-motion';

export function AnalyticsDashboard() {
  const { state, goToMonthly, goToWeek, goToDay, changeMonth, setView } = useDrillDown();
  const { monthlyData, weeklyData, dailyData, calendarData, isLoading, error, fetchCalendar } = useAnalytics(state);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    out: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const handleSelectDate = (date: Date) => {
    goToDay(date);
  };

  const handleMonthChange = (date: Date) => {
    changeMonth(date);
    fetchCalendar(date.getFullYear(), date.getMonth() + 1);
  };

  return (
    <div className="bg-bg-primary min-h-screen text-text-primary p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:items-start max-w-[1400px] mx-auto pt-24">
      {/* Sidebar - Controles */}
      <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6">
        <h1 className="text-3xl font-sora font-bold text-white mb-2">Analytics</h1>
        
        {/* View Switcher */}
        <div className="bg-analytics-panel/40 backdrop-blur-md rounded-2xl p-2 border border-analytics-border shadow-lg flex gap-2">
          {['monthly', 'weekly', 'daily'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                state.view === v
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {v === 'monthly' ? 'Mes' : v === 'weekly' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>

        {/* Calendar Picker */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-2">Seleccionar Fecha</h2>
          <CalendarPicker 
            selectedDate={state.dateStr ? new Date(`${state.dateStr}T12:00:00Z`) : undefined}
            onSelectDate={handleSelectDate}
            onMonthChange={handleMonthChange}
            calendarData={calendarData}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-bg-primary/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-amber-500 font-medium">Cargando datos...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {!error && (
          <AnimatePresence mode="wait">
            {state.view === 'monthly' && monthlyData && (
              <motion.div key="monthly" initial="initial" animate="in" exit="out" variants={pageVariants}>
                <MonthlyView data={monthlyData} onWeekClick={goToWeek} />
              </motion.div>
            )}

            {state.view === 'weekly' && weeklyData && state.weekNumber && (
              <motion.div key="weekly" initial="initial" animate="in" exit="out" variants={pageVariants}>
                <WeeklyView data={weeklyData} onDayClick={(dayNumber) => {
                  // Approximate calculation for day click from weekly view
                  const d = new Date(); d.setDate(dayNumber); goToDay(d);
                }} onGoToMonthly={goToMonthly} weekNumber={state.weekNumber} />
              </motion.div>
            )}

            {state.view === 'daily' && dailyData && (
              <motion.div key="daily" initial="initial" animate="in" exit="out" variants={pageVariants}>
                <DailyView data={dailyData} onGoToMonthly={goToMonthly} onGoToWeek={goToWeek} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
