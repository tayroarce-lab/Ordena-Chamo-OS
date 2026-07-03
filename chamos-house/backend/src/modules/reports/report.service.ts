import { Op } from 'sequelize';
import { Pedido, DetallePedido, Producto, sequelize } from '../../models';
import { getDynamicDateRange, getTodayRange } from '../../core/utils/dateRangeHelper';
import type { PeriodoReporte } from '../../types';

export interface ReporteFinancieroRow {
  metodo_pago: string;
  total_pedidos: number;
  ingresos: number;
}

export interface ReporteTopProductoRow {
  producto_id: number;
  nombre: string;
  categoria: string | null;
  total_vendido: number;
  ingresos_generados: number;
}

export interface ReporteEstadoOperativoRow {
  estado: string;
  cantidad: number;
}

export interface ReporteConsolidado {
  periodo: PeriodoReporte;
  rango: { inicio: string; fin: string };
  resumen_financiero: {
    total_ingresos: number;
    total_pedidos: number;
    por_metodo: ReporteFinancieroRow[];
  };
  top_productos: ReporteTopProductoRow[];
  estado_operativo: ReporteEstadoOperativoRow[];
}

interface RawFinancieroRow {
  metodo_pago: string;
  total_pedidos: string | number;
  ingresos_totales: string | number;
}

interface RawTopProductoRow {
  producto_id: number;
  total_vendido: string | number;
  ingresos: string | number;
  'producto.nombre'?: string;
  'producto.categoria'?: string | null;
  producto?: { nombre: string; categoria: string | null };
}

interface RawEstadoRow {
  estado: string;
  cantidad: string | number;
}

export class ReporteService {
  static async getReporte(periodo: PeriodoReporte, fecha: string): Promise<ReporteConsolidado> {
    const { startDate, endDate } = getDynamicDateRange(periodo, fecha);
    const { startOfToday, endOfToday } = getTodayRange();

    const [resultadoA, resultadoB, resultadoC] = await Promise.all([
      Pedido.findAll({
        attributes: [
          'metodo_pago',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_pedidos'],
          [sequelize.fn('SUM', sequelize.col('total')), 'ingresos_totales'],
        ],
        where: {
          estado: 'entregado',
          f_creacion: { [Op.between]: [startDate, endDate] },
        },
        group: ['metodo_pago'],
        raw: true,
      }) as unknown as Promise<RawFinancieroRow[]>,

      DetallePedido.findAll({
        attributes: [
          'producto_id',
          [sequelize.fn('SUM', sequelize.col('DetallePedido.cantidad')), 'total_vendido'],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal('DetallePedido.cantidad * DetallePedido.p_unitario')
            ),
            'ingresos',
          ],
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
        order: [[sequelize.literal('total_vendido'), 'DESC']],
        limit: 10,
        raw: true,
        nest: true,
      }) as unknown as Promise<RawTopProductoRow[]>,

      Pedido.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
        ],
        where: {
          f_creacion: { [Op.between]: [startOfToday, endOfToday] },
        },
        group: ['estado'],
        raw: true,
      }) as unknown as Promise<RawEstadoRow[]>,
    ]);

    const porMetodo: ReporteFinancieroRow[] = resultadoA.map((row) => ({
      metodo_pago: row.metodo_pago,
      total_pedidos: Number(row.total_pedidos) || 0,
      ingresos: Number(row.ingresos_totales) || 0,
    }));

    const totalIngresos = porMetodo.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalPedidos = porMetodo.reduce((acc, curr) => acc + curr.total_pedidos, 0);

    const topProductos: ReporteTopProductoRow[] = resultadoB.map((row) => ({
      producto_id: row.producto_id,
      nombre: row.producto?.nombre ?? '',
      categoria: row.producto?.categoria ?? null,
      total_vendido: Number(row.total_vendido) || 0,
      ingresos_generados: Number(row.ingresos) || 0,
    }));

    const estadoOperativo: ReporteEstadoOperativoRow[] = resultadoC.map((row) => ({
      estado: row.estado,
      cantidad: Number(row.cantidad) || 0,
    }));

    return {
      periodo,
      rango: {
        inicio: startDate.toISOString(),
        fin: endDate.toISOString(),
      },
      resumen_financiero: {
        total_ingresos: totalIngresos,
        total_pedidos: totalPedidos,
        por_metodo: porMetodo,
      },
      top_productos: topProductos,
      estado_operativo: estadoOperativo,
    };
  }
}
