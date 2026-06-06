// ─── NIVEL MENSUAL ────────────────────────────────────────────────
export interface MonthlyData {
  period: string;                    // "Julio 2025"
  monthlyIncome: number;             // 24500.00
  incomeGrowthPercent: number;       // +12.5
  ytdRevenue: number;                // 142800.00
  starProduct: { name: string; unitsSold: number; emoji?: string };
  weeklyChart: {
    label: string;                   // "Semana 1"
    real: number;
    projected: number;
  }[];                               // Siempre 4 elementos
  recordDay: { dayName: string; date: number; amount: number };
  bestWeek: { weekNumber: number; percentVsAvg: number };
  stockTable: StockRow[];
  kitchenStatus: { capacityPercent: number; isActive: boolean };
  avgPrepMinutes: number;
  prepDeltaMinutes: number;          // vs mes pasado (negativo = mejoró)
  stockAlerts: { name: string; level: 'Bajo' | 'Medio' | 'Alto' }[];
}

export interface StockRow {
  id: string;
  name: string;
  emoji?: string;
  unitsSoldMonth: number;
  stockAvailable: number;
  status: 'Bajo Stock' | 'Saludable' | 'Crítico';
}

// ─── NIVEL SEMANAL ────────────────────────────────────────────────
export interface WeeklyData {
  weekLabel: string;                 // "Semana 02"
  dateRange: string;                 // "08 Jul - 14 Jul"
  weeklyIncome: number;              // 6125.00
  incomeGrowthPercent: number;       // +12.4
  peakDay: string;                   // "Viernes"
  peakTime: string;                  // "20:30 hrs"
  top3Products: { rank: 1|2|3; name: string; units: number }[];
  dailyChart: {
    day: 'LUN'|'MAR'|'MIE'|'JUE'|'VIE'|'SAB'|'DOM';
    income: number;
    isHighlight: boolean;
  }[];
  unitsPerProduct: { name: string; units: number }[];
  avgPrepMinutes: number;
  customerRating: number;            // 4.8
  weeklyPredictionText: string;
}

// ─── NIVEL DIARIO ─────────────────────────────────────────────────
export interface DailyData {
  date: string;                      // "15 de Julio, 2025"
  dailyIncome: number;               // 1847.50
  incomeGrowthPercent: number;       // +12
  totalOrders: number;               // 47
  deliveredOrders: number;           // 42
  canceledOrders: number;            // 2
  avgTicket: number;                 // 39.30
  starProduct: { name: string; unitsSold: number; emoji?: string };
  hourlyChart: {
    hour: string;                    // "08:00", "09:00" ... "00:00"
    income: number;
    isHighlight: boolean;            // true para picos (12:00, 20:00)
  }[];                               // 17 puntos: 08:00 a 00:00
  soldProducts: SoldProductRow[];
}

export interface SoldProductRow {
  id: string;
  name: string;
  imageUrl?: string;
  category: 'Burgers' | 'Acompañantes' | 'Bebidas' | 'Combos';
  quantity: number;
  unitPrice: number;
  totalGenerated: number;
}

// ─── ESTADO DE NAVEGACIÓN ─────────────────────────────────────────
export type DashboardView = 'monthly' | 'weekly' | 'daily';

export interface DrillDownState {
  view: DashboardView;
  year: number;
  month: number;          // 1-12
  weekNumber?: number;    // 1-4
  day?: number;           // 1-31
}

// ─── BREADCRUMB ───────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}
