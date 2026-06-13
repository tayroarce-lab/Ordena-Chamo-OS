// ─── NIVEL MENSUAL ────────────────────────────────────────────────
export interface MonthlyData {
  period: string;
  monthlyIncome: number;
  incomeGrowthPercent: number;
  ytdRevenue: number;
  totalOrders: number;
  starProduct: { name: string; unitsSold: number } | null;
  weeklyChart: { label: string; real: number }[];
  recordDay: { dayName: string; date: number; amount: number } | null;
  bestWeek: { weekNumber: number; percentVsAvg: number } | null;
  productBreakdown: { id: string; name: string; category: string | null; quantitySold: number; revenue: number }[];
}

// ─── NIVEL SEMANAL ────────────────────────────────────────────────
export interface WeeklyData {
  weekLabel: string;
  dateRange: string;
  weeklyIncome: number;
  incomeGrowthPercent: number;
  totalOrders: number;
  peakDay: string;
  top3Products: { rank: 1 | 2 | 3; name: string; units: number }[];
  dailyChart: { day: string; income: number; isHighlight: boolean }[];
  unitsPerProduct: { name: string; units: number }[];
}

// ─── NIVEL DIARIO ─────────────────────────────────────────────────
export interface DailyData {
  date: string;
  dailyIncome: number;
  incomeGrowthPercent: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  avgTicket: number;
  starProduct: { name: string; unitsSold: number } | null;
  hourlyChart: { hour: string; income: number; isHighlight: boolean }[];
  soldProducts: {
    id: string;
    name: string;
    category: string | null;
    quantity: number;
    unitPrice: number;
    totalGenerated: number;
  }[];
}

// ─── CALENDARIO ───────────────────────────────────────────────────
export interface CalendarSummaryResponse {
  days: { date: string; totalRevenue: number; orderCount: number; hasOrders: boolean }[];
}

// ─── ESTADO DE NAVEGACIÓN ─────────────────────────────────────────
export type DashboardView = 'monthly' | 'weekly' | 'daily';

export interface DrillDownState {
  view: DashboardView;
  year: number;
  month: number;          // 1-12
  weekNumber?: number;    // 1-5
  day?: number;           // 1-31
  dateStr?: string;       // YYYY-MM-DD para vista diaria
}

// ─── BREADCRUMB ───────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}
