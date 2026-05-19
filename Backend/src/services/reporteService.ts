import { Pedido, DetallePedido, Producto, sequelize } from '../models';
import { Op } from 'sequelize';

export interface ReporteFinancieroRow {
  metodo_pago: string;
  total_pedidos: number;
  ingresos: number;
}

export interface ReporteTopProductoRow {
  producto_id: number;
  nombre: string;
  total_vendido: number;
  ingresos_generados: number;
}

export interface ReporteEstadoOperativoRow {
  estado: string;
  cantidad: number;
}

export interface ReporteConsolidado {
  resumen_financiero: {
    total_ingresos: number;
    total_pedidos: number;
    por_metodo: ReporteFinancieroRow[];
  };
  top_productos: ReporteTopProductoRow[];
  estado_operativo: ReporteEstadoOperativoRow[];
}

export class ReporteService {
  /**
   * Genera los reportes analíticos ejecutando tres consultas en paralelo.
   */
  static async obtenerReportes(startDate: Date, endDate: Date): Promise<ReporteConsolidado> {
    
    // Rango para hoy (Para la Consulta C)
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const [resultadoA, resultadoB, resultadoC] = await Promise.all([
      // CONSULTA A: Resumen Financiero
      Pedido.findAll({
        attributes: [
          'metodo_pago',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_pedidos'],
          [sequelize.fn('SUM', sequelize.col('total')), 'ingresos']
        ],
        where: {
          estado: 'entregado', // Solo pedidos entregados cuentan financieramente
          f_creacion: {
            [Op.between]: [startDate, endDate]
          }
        },
        group: ['metodo_pago'],
        raw: true
      }),

      // CONSULTA B: Top Productos
      DetallePedido.findAll({
        attributes: [
          'producto_id',
          [sequelize.col('producto.nombre'), 'nombre'],
          [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
          [sequelize.fn('SUM', sequelize.literal('p_unitario * cantidad')), 'ingresos_generados']
        ],
        include: [
          {
            model: Producto,
            as: 'producto',
            attributes: []
          },
          {
            model: Pedido,
            as: 'pedido',
            attributes: [],
            where: {
              f_creacion: {
                [Op.between]: [startDate, endDate]
              }
            }
          }
        ],
        group: ['producto_id', 'producto.nombre'],
        order: [[sequelize.literal('total_vendido'), 'DESC']],
        limit: 10,
        raw: true
      }),

      // CONSULTA C: Estado Operativo (Solo del día de hoy)
      Pedido.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
        ],
        where: {
          f_creacion: {
            [Op.between]: [hoyInicio, hoyFin]
          }
        },
        group: ['estado'],
        raw: true
      })
    ]);

    // Procesar Consulta A
    const porMetodo: ReporteFinancieroRow[] = (resultadoA as any[]).map(row => ({
      metodo_pago: row.metodo_pago,
      total_pedidos: Number(row.total_pedidos) || 0,
      ingresos: Number(row.ingresos) || 0
    }));

    const totalIngresos = porMetodo.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalPedidos = porMetodo.reduce((acc, curr) => acc + curr.total_pedidos, 0);

    // Procesar Consulta B
    const topProductos: ReporteTopProductoRow[] = (resultadoB as any[]).map(row => ({
      producto_id: row.producto_id,
      nombre: row.nombre,
      total_vendido: Number(row.total_vendido) || 0,
      ingresos_generados: Number(row.ingresos_generados) || 0
    }));

    // Procesar Consulta C
    const estadoOperativo: ReporteEstadoOperativoRow[] = (resultadoC as any[]).map(row => ({
      estado: row.estado,
      cantidad: Number(row.cantidad) || 0
    }));

    return {
      resumen_financiero: {
        total_ingresos: totalIngresos,
        total_pedidos: totalPedidos,
        por_metodo: porMetodo
      },
      top_productos: topProductos,
      estado_operativo: estadoOperativo
    };
  }
}
