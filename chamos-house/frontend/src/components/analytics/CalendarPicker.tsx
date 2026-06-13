import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import type { CalendarSummaryResponse } from '@/types/analytics.types';

interface CalendarPickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  calendarData: CalendarSummaryResponse | null;
}

export function CalendarPicker({ selectedDate, onSelectDate, onMonthChange, calendarData }: CalendarPickerProps) {
  // Convert days with orders into a Date array for modifiers
  const daysWithOrders = calendarData?.days
    .filter(d => d.hasOrders)
    .map(d => new Date(`${d.date}T12:00:00Z`)) || [];

  return (
    <div className="bg-analytics-panel/40 backdrop-blur-md rounded-2xl p-4 border border-analytics-border shadow-lg flex justify-center">
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #f59e0b; /* amber-500 */
          --rdp-background-color: rgba(245, 158, 11, 0.1);
          --rdp-accent-color-dark: #d97706; /* amber-600 */
          --rdp-background-color-dark: rgba(217, 119, 6, 0.1);
          --rdp-outline: 2px solid var(--rdp-accent-color);
          margin: 0;
        }
        .rdp-day_selected {
          font-weight: bold;
          background-color: var(--rdp-accent-color) !important;
          color: black !important;
        }
        .rdp-day_selected:hover {
          background-color: var(--rdp-accent-color-dark) !important;
        }
        .rdp-day {
          color: #e2e8f0; /* slate-200 */
        }
        .rdp-day:hover:not(.rdp-day_selected) {
          background-color: rgba(255,255,255,0.1);
        }
        .rdp-button:focus-visible:not([disabled]) {
          outline: var(--rdp-outline);
        }
        .day-with-orders {
          position: relative;
        }
        .day-with-orders::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: #f59e0b; /* amber-500 */
          border-radius: 50%;
        }
        .rdp-day_selected.day-with-orders::after {
          background-color: black;
        }
        .rdp-caption_label {
          color: white;
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          text-transform: capitalize;
        }
        .rdp-head_cell {
          color: #94a3b8; /* slate-400 */
          font-weight: 500;
          font-size: 0.8rem;
        }
        .rdp-nav_button {
          color: white;
        }
        .rdp-nav_button:hover {
          background-color: rgba(255,255,255,0.1);
        }
      `}</style>
      
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(d) => d && onSelectDate(d)}
        onMonthChange={onMonthChange}
        locale={es}
        modifiers={{
          hasOrders: daysWithOrders
        }}
        modifiersClassNames={{
          hasOrders: 'day-with-orders'
        }}
        showOutsideDays
      />
    </div>
  );
}
