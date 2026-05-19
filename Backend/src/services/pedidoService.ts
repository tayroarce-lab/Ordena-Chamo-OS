import { sequelize, Usuario, Pedido, DetallePedido, Producto } from '../models';
import { Op } from 'sequelize';

interface PedidoItemInput {
  producto_id: number;
  cantidad: number;
  modificadores: Record<string, unknown> | null;
}

interface PedidoInput {
  telefono: string;
  nombre_cliente?: string;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'zelle';
  notas?: string;
  items: PedidoItemInput[];
}

export class PedidoService {
  /**
   * Crea un nuevo pedido desde un payload proveniente de n8n.
   * Garantiza atomicidad mediante transacciones de Sequelize.
   */
  static async crearPedidoDesdeWebhook(data: PedidoInput): Promise<Pedido> {
    // 1. Buscar o crear usuario usando el teléfono como identificador principal
    const [usuario] = await Usuario.findOrCreate({
      where: { telefono: data.telefono },
      defaults: {
        nombre: data.nombre_cliente || null,
        rol: 'cliente'
      }
    });

    // 2. Obtener precios reales de todos los productos en una sola consulta
    const productoIds = data.items.map(i => i.producto_id);
    const productosDB = await Producto.findAll({
      where: { id: { [Op.in]: productoIds } }
    });

    // Validar que todos los productos solicitados existan realmente en la BD
    if (productosDB.length !== new Set(productoIds).size) {
      throw new Error('Uno o más productos solicitados no existen en la base de datos.');
    }

    const mapProductos = new Map<number, Producto>();
    productosDB.forEach(p => mapProductos.set(p.id, p));

    // 3. Iniciar transacción
    const transaccion = await sequelize.transaction();

    try {
      // Calcular total real basado en los precios de la BD, NUNCA en el payload de n8n
      let totalPedido = 0;
      data.items.forEach(item => {
        const producto = mapProductos.get(item.producto_id);
        if (producto) {
          totalPedido += Number(producto.precio) * item.cantidad;
        }
      });

      // Crear registro principal de pedido
      const nuevoPedido = await Pedido.create({
        usuario_id: usuario.id,
        estado: 'pendiente',
        metodo_pago: data.metodo_pago,
        total: totalPedido
      }, { transaction: transaccion });

      // Preparar inserción en detalle_pedidos
      const detallesPromesas = data.items.map(item => {
        const producto = mapProductos.get(item.producto_id)!;
        return DetallePedido.create({
          pedido_id: nuevoPedido.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          p_unitario: producto.precio, // Snapshot del precio actual
          modificadores: item.modificadores || null
        }, { transaction: transaccion });
      });

      // Ejecutar todos los INSERTS de detalle_pedidos en paralelo dentro de la transacción
      await Promise.all(detallesPromesas);

      // Confirmar transacción si todo es exitoso
      await transaccion.commit();

      // Cargar el pedido completo con asociaciones para emitir al Frontend
      const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id, {
        include: [
          { model: Usuario, as: 'usuario' },
          { 
            model: DetallePedido, 
            as: 'detalles',
            include: [{ model: Producto, as: 'producto' }]
          }
        ]
      });

      if (!pedidoCompleto) {
        throw new Error('Error interno al recargar el pedido recién creado.');
      }

      return pedidoCompleto;

    } catch (error) {
      // Si ocurre cualquier error (como restricciones de DB, fallos en red, etc), deshacer
      await transaccion.rollback();
      throw error;
    }
  }
}
