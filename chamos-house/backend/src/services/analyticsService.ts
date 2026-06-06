import { Op } from 'sequelize';
import { Pedido, DetallePedido, Producto, sequelize } from '../models';

/**
 * TODO: Interfaces de respuesta de analytics
 * Deben coincidir con las interfaces TypeScript del frontend
 */

export interface MonthlyAnalyticsResponse {
  period: string;
  monthlyIncome: number;
  incomeGrowthPercent: number;
  ytdRevenue: number;
  starProduct: { name: string; unitsSold: number };
  weeklyChart: { label: string; real: number; projected: number }[];
  recordDay: { dayName: string; date: number; amount: number };
  bestWeek: { weekNumber: number; percentVsAvg: number };
  stockTable: Array<{ id: string; name: string; unitsSoldMonth: number; stockAvailable: number; status: string }>;
  kitchenStatus: { capacityPercent: number; isActive: boolean };
  avgPrepMinutes: number;
  prepDeltaMinutes: number;
  stockAlerts: Array<{ name: string; level: string }>;
}

export interface WeeklyAnalyticsResponse {
  weekLabel: string;
  dateRange: string;
  weeklyIncome: number;
  incomeGrowthPercent: number;
  peakDay: string;
  peakTime: string;
  top3Products: Array<{ rank: 1 | 2 | 3; name: string; units: number }>;
  dailyChart: Array<{ day: string; income: number; isHighlight: boolean }>;
  unitsPerProduct: Array<{ name: string; units: number }>;
  avgPrepMinutes: number;
  customerRating: number;
  weeklyPredictionText: string;
}

export interface DailyAnalyticsResponse {
  date: string;
  dailyIncome: number;
  incomeGrowthPercent: number;
  totalOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
  avgTicket: number;
  starProduct: { name: string; unitsSold: number };
  hourlyChart: Array<{ hour: string; income: number; isHighlight: boolean }>;
  soldProducts: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalGenerated: number;
  }>;
}

export class AnalyticsService {
  /**
   * Obtiene análisis mensuales
   * Para ahora devuelve mock data como fallback
   * TODO: Implementar queries reales con Sequelize
   */
  static async getMonthlyAnalytics(year: number, month: number): Promise<MonthlyAnalyticsResponse> {
    try {
      // TODO: Implementar queries reales
      // const startDate = new Date(year, month - 1, 1);
      // const endDate = new Date(year, month, 0);
      
      // Queries esperadas:
      // 1. Ingresos del mes (sum de pedidos entregados)
      // 2. Top producto del mes
      // 3. Ventas por semana (4 semanas)
      // 4. Día con máximo ingreso
      // 5. Stock disponible (desde tabla de inventario si existe)
      // 6. Tiempo promedio de preparación (promedio de duraciones)

      // Por ahora devolver error para forzar fallback a mock
      throw new Error('API no implementada aún');
    } catch {
      // Fallback a mock data
      console.log('Usando mock data para monthly analytics');
      return {
        period: `Julio 2025`,
        monthlyIncome: 24500,
        incomeGrowthPercent: 12.5,
        ytdRevenue: 142800,
        starProduct: { name: 'Chamos Burger', unitsSold: 842 },
        weeklyChart: [
          { label: 'Semana 1', real: 5200, projected: 5000 },
          { label: 'Semana 2', real: 7820, projected: 6500 },
          { label: 'Semana 3', real: 6100, projected: 6200 },
          { label: 'Semana 4', real: 5380, projected: 5800 },
        ],
        recordDay: { dayName: 'Viernes', date: 12, amount: 2450 },
        bestWeek: { weekNumber: 2, percentVsAvg: 18 },
        stockTable: [
          { id: '1', name: 'Chamos Burger', unitsSoldMonth: 842, stockAvailable: 45, status: 'Bajo Stock' },
          { id: '2', name: 'Combo Pareja', unitsSoldMonth: 412, stockAvailable: 120, status: 'Saludable' },
          { id: '3', name: 'Malta Polar', unitsSoldMonth: 650, stockAvailable: 200, status: 'Saludable' },
          { id: '4', name: 'Papas Fritas XL', unitsSoldMonth: 530, stockAvailable: 15, status: 'Crítico' },
        ],
        kitchenStatus: { capacityPercent: 85, isActive: true },
        avgPrepMinutes: 14.2,
        prepDeltaMinutes: -2.5,
        stockAlerts: [
          { name: 'Pan Brioche', level: 'Bajo' },
          { name: 'Salsa Secreta', level: 'Medio' },
        ],
      };
    }
  }

  /**
   * Obtiene análisis semanales
   * Para ahora devuelve mock data como fallback
   * TODO: Implementar queries reales con Sequelize
   */
  static async getWeeklyAnalytics(year: number, month: number, weekNumber: number): Promise<WeeklyAnalyticsResponse> {
    try {
      // TODO: Implementar queries reales
      // Calcular rango de fechas de la semana
      // Queries esperadas:
      // 1. Ingresos de la semana
      // 2. Ventas por día de la semana
      // 3. Productos más vendidos
      // 4. Día pico de la semana

      throw new Error('API no implementada aún');
    } catch {
      // Fallback a mock data
      console.log('Usando mock data para weekly analytics');
      return {
        weekLabel: 'Semana 02',
        dateRange: '08 Jul - 14 Jul',
        weeklyIncome: 6125,
        incomeGrowthPercent: 12.4,
        peakDay: 'Viernes',
        peakTime: '20:30 hrs',
        top3Products: [
          { rank: 1, name: 'Chamos Burger', units: 184 },
          { rank: 2, name: 'Pepsi 1.5L', units: 110 },
          { rank: 3, name: 'Tequeños', units: 92 },
        ],
        dailyChart: [
          { day: 'LUN', income: 650, isHighlight: false },
          { day: 'MAR', income: 720, isHighlight: false },
          { day: 'MIE', income: 810, isHighlight: false },
          { day: 'JUE', income: 980, isHighlight: false },
          { day: 'VIE', income: 1420, isHighlight: true },
          { day: 'SAB', income: 990, isHighlight: false },
          { day: 'DOM', income: 555, isHighlight: false },
        ],
        unitsPerProduct: [
          { name: 'Chamos Burger', units: 184 },
          { name: 'Papas Fritas XL', units: 145 },
          { name: 'Malta Polar', units: 120 },
          { name: 'Pepsi 1.5L', units: 110 },
          { name: 'Combo', units: 98 },
        ],
        avgPrepMinutes: 14.2,
        customerRating: 4.8,
        weeklyPredictionText: 'Se espera un incremento del 15% en pedidos de "Chamos Burger" para el próximo fin de semana.',
      };
    }
  }

  /**
   * Obtiene análisis diarios
   * Para ahora devuelve mock data como fallback
   * TODO: Implementar queries reales con Sequelize
   */
  static async getDailyAnalytics(date: string): Promise<DailyAnalyticsResponse> {
    try {
      // TODO: Implementar queries reales
      // const targetDate = new Date(date);
      // Queries esperadas:
      // 1. Ingresos del día
      // 2. Pedidos entregados/cancelados
      // 3. Productos vendidos con detalles
      // 4. Ventas por hora

      throw new Error('API no implementada aún');
    } catch {
      // Fallback a mock data
      console.log('Usando mock data para daily analytics');
      return {
        date: '15 de Julio, 2025',
        dailyIncome: 1847.5,
        incomeGrowthPercent: 12,
        totalOrders: 47,
        deliveredOrders: 42,
        canceledOrders: 2,
        avgTicket: 39.3,
        starProduct: { name: 'Chamos Burger', unitsSold: 24 },
        hourlyChart: [
          { hour: '08:00', income: 120, isHighlight: false },
          { hour: '09:00', income: 180, isHighlight: false },
          { hour: '10:00', income: 240, isHighlight: false },
          { hour: '11:00', income: 310, isHighlight: false },
          { hour: '12:00', income: 520, isHighlight: true },
          { hour: '13:00', income: 390, isHighlight: false },
          { hour: '14:00', income: 280, isHighlight: false },
          { hour: '15:00', income: 190, isHighlight: false },
          { hour: '16:00', income: 160, isHighlight: false },
          { hour: '17:00', income: 210, isHighlight: false },
          { hour: '18:00', income: 290, isHighlight: false },
          { hour: '19:00', income: 370, isHighlight: false },
          { hour: '20:00', income: 510, isHighlight: true },
          { hour: '21:00', income: 380, isHighlight: false },
          { hour: '22:00', income: 260, isHighlight: false },
          { hour: '23:00', income: 150, isHighlight: false },
          { hour: '00:00', income: 80, isHighlight: false },
        ],
        soldProducts: [
          { id: '1', name: 'Chamos Burger', category: 'Burgers', quantity: 24, unitPrice: 12.5, totalGenerated: 300.0 },
          { id: '2', name: 'Papas Fritas XL', category: 'Acompañantes', quantity: 18, unitPrice: 4.5, totalGenerated: 81.0 },
          { id: '3', name: 'Malta Polar', category: 'Bebidas', quantity: 15, unitPrice: 2.5, totalGenerated: 37.5 },
          { id: '4', name: 'Combo Pareja', category: 'Combos', quantity: 10, unitPrice: 22.0, totalGenerated: 220.0 },
          { id: '5', name: 'Pepsi 1.5L', category: 'Bebidas', quantity: 8, unitPrice: 3.5, totalGenerated: 28.0 },
        ],
      };
    }
  }
}
