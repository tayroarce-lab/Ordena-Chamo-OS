import { Op, literal, fn, col } from 'sequelize';
import { Pedido, DetallePedido, Producto, sequelize } from '../../models';

export interface MonthlyAnalyticsResponse {
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

export interface WeeklyAnalyticsResponse {
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

export interface DailyAnalyticsResponse {
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

export interface CalendarSummaryResponse {
  days: { date: string; totalRevenue: number; orderCount: number; hasOrders: boolean }[];
}

export class AnalyticsService {

  private static getMonthName(monthNumber: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthNumber - 1] || 'Mes';
  }

  private static getDayName(dayIndex: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayIndex] || 'Día';
  }
  
  private static getDayAbbr(dayIndex: number): string {
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return days[dayIndex] || 'DIA';
  }

  static async getMonthlyAnalytics(year: number, month: number): Promise<MonthlyAnalyticsResponse> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const prevMonthStartDate = month === 1 ? new Date(year - 1, 11, 1) : new Date(year, month - 2, 1);
    const prevMonthEndDate = month === 1 ? new Date(year - 1, 11, 31, 23, 59, 59, 999) : new Date(year, month - 1, 0, 23, 59, 59, 999);

    const yearStartDate = new Date(year, 0, 1);

    // 1. Ingresos y órdenes mensuales (entregados para ingresos, todos para conteo)
    const currentMonthOrders = await Pedido.findAll({
      where: {
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'estado',
        [fn('SUM', col('total')), 'totalIncome'],
        [fn('COUNT', col('id')), 'totalOrders']
      ],
      group: ['estado'],
      raw: true
    }) as unknown as { estado: string; totalIncome: string; totalOrders: string }[];

    let monthlyIncome = 0;
    let totalOrders = 0;
    currentMonthOrders.forEach(row => {
      totalOrders += Number(row.totalOrders);
      if (row.estado === 'entregado') {
        monthlyIncome += Number(row.totalIncome);
      }
    });

    // 2. Ingresos del mes anterior para crecimiento
    const prevMonthOrders = await Pedido.findOne({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [prevMonthStartDate, prevMonthEndDate] }
      },
      attributes: [[fn('SUM', col('total')), 'totalIncome']],
      raw: true
    }) as unknown as { totalIncome: string } | null;

    const prevIncome = Number(prevMonthOrders?.totalIncome || 0);
    const incomeGrowthPercent = prevIncome === 0 ? 0 : Math.round(((monthlyIncome - prevIncome) / prevIncome) * 100);

    // 3. YTD Revenue
    const ytdOrders = await Pedido.findOne({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [yearStartDate, endDate] }
      },
      attributes: [[fn('SUM', col('total')), 'totalIncome']],
      raw: true
    }) as unknown as { totalIncome: string } | null;
    const ytdRevenue = Number(ytdOrders?.totalIncome || 0);

    // 4. Breakdown por producto y Top Producto
    const productBreakdownRaw = await DetallePedido.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('DetallePedido.cantidad')), 'quantitySold'],
        [fn('SUM', literal('`DetallePedido`.`cantidad` * `DetallePedido`.`p_unitario`')), 'revenue'],
      ],
      include: [
        {
          model: Producto.unscoped(),
          as: 'producto',
          attributes: ['nombre', 'categoria'],
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: [],
          where: {
            estado: 'entregado',
            f_creacion: { [Op.between]: [startDate, endDate] },
          },
        },
      ],
      group: ['producto_id', 'producto.id'],
      order: [[literal('quantitySold'), 'DESC']],
      raw: true,
      nest: true,
    }) as unknown as any[];

    const productBreakdown = productBreakdownRaw.map(row => ({
      id: String(row.producto_id),
      name: row.producto?.nombre || 'Desconocido',
      category: row.producto?.categoria || null,
      quantitySold: Number(row.quantitySold) || 0,
      revenue: Number(row.revenue) || 0
    }));

    const starProduct = productBreakdown.length > 0 ? {
      name: productBreakdown[0].name,
      unitsSold: productBreakdown[0].quantitySold
    } : null;

    // 5. Agrupación por Día para Record Day y Weekly Chart
    const dailyIncomeRaw = await Pedido.findAll({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('DATE', col('f_creacion')), 'dateStr'],
        [fn('SUM', col('total')), 'dailyIncome']
      ],
      group: [fn('DATE', col('f_creacion'))],
      order: [[literal('dailyIncome'), 'DESC']],
      raw: true
    }) as unknown as { dateStr: string; dailyIncome: string }[];

    let recordDay = null;
    if (dailyIncomeRaw.length > 0) {
      const bestDay = dailyIncomeRaw[0];
      const bestDate = new Date(`${bestDay.dateStr}T12:00:00Z`);
      recordDay = {
        dayName: this.getDayName(bestDate.getUTCDay()),
        date: bestDate.getUTCDate(),
        amount: Number(bestDay.dailyIncome)
      };
    }

    // Calcular Chart por semana simple (Dividiendo el mes en 4 o 5)
    const weeksMap = new Map<number, number>();
    let totalWeeklyAverages = 0;
    
    dailyIncomeRaw.forEach(row => {
      const d = new Date(`${row.dateStr}T12:00:00Z`);
      // Definimos semana 1-5 basado en la fecha
      const weekIndex = Math.ceil(d.getUTCDate() / 7);
      weeksMap.set(weekIndex, (weeksMap.get(weekIndex) || 0) + Number(row.dailyIncome));
    });

    const weeklyChart = [];
    let bestWeekNum = 1;
    let maxWeekInc = 0;
    let sumWeeks = 0;
    let countWeeks = 0;

    for (let i = 1; i <= 5; i++) {
      const inc = weeksMap.get(i) || 0;
      if (inc > 0 || i <= 4) { // Asegurar al menos 4 semanas
        weeklyChart.push({ label: `Semana ${i}`, real: inc });
        if (inc > maxWeekInc) {
          maxWeekInc = inc;
          bestWeekNum = i;
        }
        sumWeeks += inc;
        countWeeks++;
      }
    }

    const avgWeek = countWeeks > 0 ? sumWeeks / countWeeks : 0;
    const percentVsAvg = avgWeek > 0 ? Math.round(((maxWeekInc - avgWeek) / avgWeek) * 100) : 0;
    
    const bestWeek = countWeeks > 0 ? { weekNumber: bestWeekNum, percentVsAvg } : null;

    return {
      period: `${this.getMonthName(month)} ${year}`,
      monthlyIncome,
      incomeGrowthPercent,
      ytdRevenue,
      totalOrders,
      starProduct,
      weeklyChart,
      recordDay,
      bestWeek,
      productBreakdown
    };
  }

  static async getWeeklyAnalytics(year: number, month: number, weekNumber: number): Promise<WeeklyAnalyticsResponse> {
    // Calculamos el rango de fechas de la semana (aproximado basado en el mes y numero de semana)
    // Semana 1: 1-7, Semana 2: 8-14, Semana 3: 15-21, Semana 4: 22-28, Semana 5: 29-fin
    const startDay = (weekNumber - 1) * 7 + 1;
    let endDay = startDay + 6;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    if (endDay > lastDayOfMonth || weekNumber === 5) endDay = lastDayOfMonth;

    const startDate = new Date(year, month - 1, startDay);
    const endDate = new Date(year, month - 1, endDay, 23, 59, 59, 999);

    // Mes previo para crecimiento (vamos a compararlo con la misma semana del mes anterior para simplificar, o 7 dias antes)
    // Lo más simple: comparar con los 7 días inmediatamente anteriores
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);
    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - 7);

    // 1. Ingresos y órdenes
    const currentOrders = await Pedido.findAll({
      where: {
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'estado',
        [fn('SUM', col('total')), 'totalIncome'],
        [fn('COUNT', col('id')), 'totalOrders']
      ],
      group: ['estado'],
      raw: true
    }) as unknown as { estado: string; totalIncome: string; totalOrders: string }[];

    let weeklyIncome = 0;
    let totalOrders = 0;
    currentOrders.forEach(row => {
      totalOrders += Number(row.totalOrders);
      if (row.estado === 'entregado') {
        weeklyIncome += Number(row.totalIncome);
      }
    });

    // 2. Crecimiento
    const prevOrders = await Pedido.findOne({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [prevStartDate, prevEndDate] }
      },
      attributes: [[fn('SUM', col('total')), 'totalIncome']],
      raw: true
    }) as unknown as { totalIncome: string } | null;

    const prevIncome = Number(prevOrders?.totalIncome || 0);
    const incomeGrowthPercent = prevIncome === 0 ? 0 : Math.round(((weeklyIncome - prevIncome) / prevIncome) * 100);

    // 3. Ventas por día
    const dailyIncomeRaw = await Pedido.findAll({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('DATE', col('f_creacion')), 'dateStr'],
        [fn('SUM', col('total')), 'dailyIncome']
      ],
      group: [fn('DATE', col('f_creacion'))],
      raw: true
    }) as unknown as { dateStr: string; dailyIncome: string }[];

    const dailyMap = new Map<string, number>();
    let maxDaily = 0;
    let peakDayStr = '';

    dailyIncomeRaw.forEach(row => {
      const val = Number(row.dailyIncome);
      dailyMap.set(row.dateStr, val);
      if (val > maxDaily) {
        maxDaily = val;
        peakDayStr = row.dateStr;
      }
    });

    const dailyChart = [];
    const peakDayDate = peakDayStr ? new Date(`${peakDayStr}T12:00:00Z`) : null;
    const peakDay = peakDayDate ? this.getDayName(peakDayDate.getUTCDay()) : '-';

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const inc = dailyMap.get(dateStr) || 0;
      dailyChart.push({
        day: this.getDayAbbr(d.getDay()),
        income: inc,
        isHighlight: inc === maxDaily && inc > 0
      });
    }

    // 4. Top productos
    const productBreakdownRaw = await DetallePedido.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('DetallePedido.cantidad')), 'quantitySold'],
      ],
      include: [
        {
          model: Producto.unscoped(),
          as: 'producto',
          attributes: ['nombre'],
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: [],
          where: {
            estado: 'entregado',
            f_creacion: { [Op.between]: [startDate, endDate] },
          },
        },
      ],
      group: ['producto_id', 'producto.id'],
      order: [[literal('quantitySold'), 'DESC']],
      limit: 10,
      raw: true,
      nest: true,
    }) as unknown as any[];

    const unitsPerProduct = productBreakdownRaw.map(row => ({
      name: row.producto?.nombre || 'Desconocido',
      units: Number(row.quantitySold) || 0
    }));

    const top3Products: { rank: 1 | 2 | 3; name: string; units: number }[] = [];
    for (let i = 0; i < Math.min(3, unitsPerProduct.length); i++) {
      top3Products.push({
        rank: (i + 1) as 1 | 2 | 3,
        name: unitsPerProduct[i].name,
        units: unitsPerProduct[i].units
      });
    }

    return {
      weekLabel: `Semana ${weekNumber}`,
      dateRange: `${startDay} ${this.getMonthName(month).substring(0,3)} - ${endDay} ${this.getMonthName(month).substring(0,3)}`,
      weeklyIncome,
      incomeGrowthPercent,
      totalOrders,
      peakDay,
      top3Products,
      dailyChart,
      unitsPerProduct
    };
  }

  static async getDailyAnalytics(date: string): Promise<DailyAnalyticsResponse> {
    const startDate = new Date(`${date}T00:00:00.000Z`); // UTC midnight
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const prevDate = new Date(startDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);

    // 1. Ingresos y conteos
    const currentOrders = await Pedido.findAll({
      where: {
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        'estado',
        [fn('SUM', col('total')), 'totalIncome'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      group: ['estado'],
      raw: true
    }) as unknown as { estado: string; totalIncome: string; orderCount: string }[];

    let dailyIncome = 0;
    let totalOrders = 0;
    let deliveredOrders = 0;
    let pendingOrders = 0;

    currentOrders.forEach(row => {
      const c = Number(row.orderCount);
      totalOrders += c;
      if (row.estado === 'entregado') {
        dailyIncome += Number(row.totalIncome);
        deliveredOrders += c;
      } else {
        pendingOrders += c;
      }
    });

    const avgTicket = deliveredOrders > 0 ? dailyIncome / deliveredOrders : 0;

    // 2. Crecimiento vs día anterior
    const prevOrders = await Pedido.findOne({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [prevDate, prevEndDate] }
      },
      attributes: [[fn('SUM', col('total')), 'totalIncome']],
      raw: true
    }) as unknown as { totalIncome: string } | null;

    const prevIncome = Number(prevOrders?.totalIncome || 0);
    const incomeGrowthPercent = prevIncome === 0 ? 0 : Math.round(((dailyIncome - prevIncome) / prevIncome) * 100);

    // 3. Productos vendidos
    const productBreakdownRaw = await DetallePedido.findAll({
      attributes: [
        'producto_id',
        [fn('SUM', col('DetallePedido.cantidad')), 'quantitySold'],
        [fn('SUM', literal('`DetallePedido`.`cantidad` * `DetallePedido`.`p_unitario`')), 'revenue'],
        [fn('MAX', col('DetallePedido.p_unitario')), 'unitPrice']
      ],
      include: [
        {
          model: Producto.unscoped(),
          as: 'producto',
          attributes: ['nombre', 'categoria'],
        },
        {
          model: Pedido,
          as: 'pedido',
          attributes: [],
          where: {
            estado: 'entregado',
            f_creacion: { [Op.between]: [startDate, endDate] },
          },
        },
      ],
      group: ['producto_id', 'producto.id'],
      order: [[literal('quantitySold'), 'DESC']],
      raw: true,
      nest: true,
    }) as unknown as any[];

    const soldProducts = productBreakdownRaw.map(row => ({
      id: String(row.producto_id),
      name: row.producto?.nombre || 'Desconocido',
      category: row.producto?.categoria || null,
      quantity: Number(row.quantitySold) || 0,
      unitPrice: Number(row.unitPrice) || 0,
      totalGenerated: Number(row.revenue) || 0
    }));

    const starProduct = soldProducts.length > 0 ? {
      name: soldProducts[0].name,
      unitsSold: soldProducts[0].quantity
    } : null;

    // 4. Ventas por hora
    const hourlyIncomeRaw = await Pedido.findAll({
      where: {
        estado: 'entregado',
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('HOUR', col('f_creacion')), 'hourNum'],
        [fn('SUM', col('total')), 'hourlyIncome']
      ],
      group: [fn('HOUR', col('f_creacion'))],
      raw: true
    }) as unknown as { hourNum: number; hourlyIncome: string }[];

    const hourMap = new Map<number, number>();
    let maxHourInc = 0;
    hourlyIncomeRaw.forEach(row => {
      const inc = Number(row.hourlyIncome);
      hourMap.set(row.hourNum, inc);
      if (inc > maxHourInc) maxHourInc = inc;
    });

    const hourlyChart = [];
    for (let h = 8; h <= 23; h++) {
      const inc = hourMap.get(h) || 0;
      hourlyChart.push({
        hour: `${h.toString().padStart(2, '0')}:00`,
        income: inc,
        isHighlight: inc === maxHourInc && inc > 0
      });
    }

    // Convert date string
    const dDate = new Date(`${date}T12:00:00Z`);
    const dateStrFormatted = `${dDate.getUTCDate()} de ${this.getMonthName(dDate.getUTCMonth() + 1)}, ${dDate.getUTCFullYear()}`;

    return {
      date: dateStrFormatted,
      dailyIncome,
      incomeGrowthPercent,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      avgTicket,
      starProduct,
      hourlyChart,
      soldProducts
    };
  }

  static async getCalendarSummary(year: number, month: number): Promise<CalendarSummaryResponse> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const dailyStats = await Pedido.findAll({
      where: {
        f_creacion: { [Op.between]: [startDate, endDate] }
      },
      attributes: [
        [fn('DATE', col('f_creacion')), 'dateStr'],
        [fn('SUM', literal("CASE WHEN estado = 'entregado' THEN total ELSE 0 END")), 'totalRevenue'],
        [fn('COUNT', col('id')), 'orderCount']
      ],
      group: [fn('DATE', col('f_creacion'))],
      raw: true
    }) as unknown as { dateStr: string; totalRevenue: string; orderCount: string }[];

    const daysMap = new Map<string, any>();
    dailyStats.forEach(row => {
      daysMap.set(row.dateStr, {
        date: row.dateStr,
        totalRevenue: Number(row.totalRevenue) || 0,
        orderCount: Number(row.orderCount) || 0,
        hasOrders: Number(row.orderCount) > 0
      });
    });

    const days = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const stats = daysMap.get(dateStr) || { date: dateStr, totalRevenue: 0, orderCount: 0, hasOrders: false };
      days.push(stats);
    }

    return { days };
  }
}
