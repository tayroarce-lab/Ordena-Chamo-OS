import { Request, Response } from 'express';
import { Pedido, Usuario, DetallePedido, Producto } from '../models';
import { Op } from 'sequelize';
import { socketManager } from '../socket/socketManager';

export class PedidoController {
  /**
   * GET /api/pedidos/activos
   * Retorna todos los pedidos que aún no han sido entregados, más los entregados el día de hoy.
   */
  static async getPedidosActivos(req: Request, res: Response): Promise<Response> {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const pedidos = await Pedido.findAll({
        where: {
          [Op.or]: [
            { estado: { [Op.ne]: 'entregado' } }, // Pendientes, en_proceso, listos (de cualquier fecha)
            { 
              estado: 'entregado',
              f_creacion: { [Op.gte]: hoy } // Solo entregados hoy (para no saturar el KDS con históricos)
            }
          ]
        },
        include: [
          { model: Usuario, as: 'usuario' },
          { 
            model: DetallePedido, 
            as: 'detalles',
            include: [{ model: Producto, as: 'producto' }]
          }
        ],
        order: [['f_creacion', 'ASC']]
      });

      return res.status(200).json({ success: true, pedidos });
    } catch (error: unknown) {
      console.error('[PedidoController] Error obteniendo pedidos activos:', error);
      return res.status(500).json({ success: false, error: 'Error interno al obtener pedidos activos' });
    }
  }

  /**
   * PATCH /api/pedidos/:id/estado
   * Actualiza el estado de un pedido y emite el evento por Socket.io.
   * Regla de negocio: Transiciones unidireccionales obligatorias.
   */
  static async actualizarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['pendiente', 'en_proceso', 'listo', 'entregado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado inválido' });
      }

      const pedido = await Pedido.findByPk(id);
      if (!pedido) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }

      // Validar ciclo de vida unidireccional (Regla 5)
      const estadoIndexActual = estadosValidos.indexOf(pedido.estado);
      const estadoIndexNuevo = estadosValidos.indexOf(estado);

      // Solo permitimos avanzar un paso hacia adelante
      if (estadoIndexNuevo <= estadoIndexActual || estadoIndexNuevo > estadoIndexActual + 1) {
        return res.status(400).json({ 
          success: false, 
          error: `Transición no permitida de '${pedido.estado}' a '${estado}'.` 
        });
      }

      pedido.estado = estado;
      await pedido.save();

      // Emitir evento para el Frontend KDS
      socketManager.getCocinaNamespace().emit('pedido_actualizado', {
        pedido_id: pedido.id,
        nuevo_estado: estado
      });

      return res.status(200).json({ 
        success: true, 
        mensaje: 'Estado de pedido actualizado', 
        pedido_id: pedido.id, 
        estado 
      });

    } catch (error: unknown) {
      console.error('[PedidoController] Error actualizando estado:', error);
      return res.status(500).json({ success: false, error: 'Error interno al actualizar estado del pedido' });
    }
  }
}
