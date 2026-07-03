import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/config/axios';
import type { 
  MonthlyData, 
  WeeklyData, 
  DailyData, 
  CalendarSummaryResponse,
  DrillDownState 
} from '@/features/analytics/types/analytics.types';

interface UseAnalyticsReturn {
  monthlyData: MonthlyData | null;
  weeklyData: WeeklyData | null;
  dailyData: DailyData | null;
  calendarData: CalendarSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchCalendar: (year: number, month: number) => Promise<void>;
}

export function useAnalytics(state: DrillDownState): UseAnalyticsReturn {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const prevMonthRef = useRef<string>('');

  const fetchCalendar = async (year: number, month: number) => {
    try {
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      if (prevMonthRef.current === monthStr && calendarData) return; // cacheo simple
      
      const { data } = await apiClient.get<{ data: CalendarSummaryResponse }>(`/analytics/calendar-summary?month=${monthStr}`);
      setCalendarData(data.data);
      prevMonthRef.current = monthStr;
    } catch (err) {
      console.error('Error fetching calendar summary:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (state.view === 'monthly') {
          const { data } = await apiClient.get<{ data: MonthlyData }>(`/analytics/monthly?year=${state.year}&month=${state.month}`);
          setMonthlyData(data.data);
          await fetchCalendar(state.year, state.month);
        } 
        else if (state.view === 'weekly' && state.weekNumber) {
          const { data } = await apiClient.get<{ data: WeeklyData }>(`/analytics/weekly?year=${state.year}&month=${state.month}&week=${state.weekNumber}`);
          setWeeklyData(data.data);
          await fetchCalendar(state.year, state.month);
        }
        else if (state.view === 'daily' && state.dateStr) {
          const { data } = await apiClient.get<{ data: DailyData }>(`/analytics/daily?date=${state.dateStr}`);
          setDailyData(data.data);
          const [y, m] = state.dateStr.split('-');
          await fetchCalendar(Number(y), Number(m));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error cargando datos de analytics');
        console.error('Analytics error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [state.view, state.year, state.month, state.weekNumber, state.dateStr]);

  return {
    monthlyData,
    weeklyData,
    dailyData,
    calendarData,
    isLoading,
    error,
    fetchCalendar
  };
}
