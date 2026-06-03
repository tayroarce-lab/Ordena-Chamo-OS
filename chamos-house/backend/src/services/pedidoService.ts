import { Op } from 'sequelize';
import {
  sequelize,
  Usuario,
  Pedido,
  DetallePedido,
  Producto,
} from '../models';
import { AppError } from '../middlewares/error.middleware';
import { sanitizeTelefono } from '../utils/dateRangeHelper';
import {
  TRANSICIONES_VALIDAS,
  type EstadoPedido,
  type PedidoCompletoSocket,
  type PedidoHistorialFiltros,
  type WebhookPedidoPayload,
} from '../types';

const pedidoInclude = [
  {
    model: Usuario,
    as: 'usuario',
    attributes: ['id', 'nombre', 'telefono'],
  },
  {
    model: DetallePedido,
    as: 'detalles',
    include: [{ model: Producto.unscoped(), as: 'producto' }],
  },
];

export function mapPedidoToSocketPayload(pedido: Pedido): PedidoCompletoSocket {
  const usuario = pedido.usuario;
  const detalles = pedido.detalles ?? [];

  return {
    pedido_id: pedido.id,
    usuario: {
      id: usuario?.id ?? pedido.usuario_id,
      nombre: usuario?.nombre ?? null,
      telefono: usuario?.telefono ?? '',
    },
    estado: pedido.estado,
    metodo_pago: pedido.metodo_pago,
    total: Number(pedido.total),
    notas: pedido.notas,
    f_creacion: pedido.f_creacion.toISOString(),
    items: detalles.map((detalle) => ({
      detalle_id: detalle.id,
      producto: {
        id: detalle.producto?.id ?? detalle.producto_id,
        nombre: detalle.producto?.nombre ?? '',
        categoria: detalle.producto?.categoria ?? null,
      },
      cantidad: detalle.cantidad,
      p_unitario: Number(detalle.p_unitario),
      modificadores: detalle.modificadores,
    })),
  };
}

export class PedidoService {
  static async crearPedidoDesdeWebhook(data: WebhookPedidoPayload): Promise<Pedido> {
    const telefono = sanitizeTelefono(data.telefono);
    if (telefono.length < 7) {
      throw new AppError('Teléfono inválido', 422);
    }

    const [usuario] = await Usuario.findOrCreate({
      where: { telefono },
      defaults: {
        telefono,
        nombre: data.nombre_cliente ?? null,
        rol: 'cliente' as const,
        password: null,
        activo: true,
      },
    });

    if (data.nombre_cliente && usuario.nombre !== data.nombre_cliente) {
      usuario.nombre = data.nombre_cliente;
      await usuario.save();
    }

    const itemIds = data.items.map((item) => item.producto_id);
    const uniqueIds = [...new Set(itemIds)];

    const productosDB = await Producto.unscoped().findAll({
      where: {
        id: { [Op.in]: uniqueIds },
        disponible: true,
      },
    });

    if (productosDB.length !== uniqueIds.length) {
      const foundIds = new Set(productosDB.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      throw new AppError('Uno o más productos no existen o no están disponibles', 422, {
        producto_ids: missing,
      });
    }

    const mapProductos = new Map(productosDB.map((p) => [p.id, p]));

    const transaccion = await sequelize.transaction();

    try {
      let totalPedido = 0;
      for (const item of data.items) {
        const producto = mapProductos.get(item.producto_id);
        if (!producto) {
          throw new AppError(`Producto ${item.producto_id} no disponible`, 422);
        }
        totalPedido += Number(producto.precio) * item.cantidad;
      }

      const nuevoPedido = await Pedido.create(
        {
          usuario_id: usuario.id,
          estado: 'pendiente',
          metodo_pago: data.metodo_pago,
          total: totalPedido,
          notas: data.notas ?? null,
        },
        { transaction: transaccion }
      );

      await Promise.all(
        data.items.map((item) => {
          const producto = mapProductos.get(item.producto_id)!;
          return DetallePedido.create(
            {
              pedido_id: nuevoPedido.id,
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              p_unitario: Number(producto.precio),
              modificadores: item.modificadores,
            },
            { transaction: transaccion }
          );
        })
      );

      await transaccion.commit();

      const pedidoCompleto = await Pedido.findByPk(nuevoPedido.id, {
        include: pedidoInclude,
      });

      if (!pedidoCompleto) {
        throw new AppError('Error al recargar el pedido creado', 500);
      }

      return pedidoCompleto;
    } catch (err) {
      await transaccion.rollback();
      throw err;
    }
  }

  static async actualizarEstado(
    pedidoId: number,
    nuevoEstado: EstadoPedido
  ): Promise<{ pedidoId: number; estadoAnterior: EstadoPedido; nuevoEstado: EstadoPedido }> {
    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) {
      throw new AppError('Pedido no encontrado', 404);
    }

    const estadoAnterior: EstadoPedido = pedido.estado ?? 'pendiente';
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoAnterior];

    if (!transicionesPermitidas || !transicionesPermitidas.includes(nuevoEstado)) {
      throw new AppError(
        `Transición no permitida de '${estadoAnterior}' a '${nuevoEstado}'`,
        400
      );
    }

    pedido.estado = nuevoEstado;
    await pedido.save();

    return {
      pedidoId: pedido.id,
      estadoAnterior,
      nuevoEstado,
    };
  }

  static async getPedidosActivos(): Promise<Pedido[]> {
    return Pedido.findAll({
      where: {
        estado: { [Op.in]: ['pendiente', 'en_proceso', 'listo'] },
      },
      include: [...pedidoInclude],
      order: [['f_creacion', 'ASC']],
    });
  }

  static async getPedidoById(id: number): Promise<Pedido> {
    const pedido = await Pedido.findByPk(id, {
      include: [...pedidoInclude],
    });
    if (!pedido) {
      throw new AppError('Pedido no encontrado', 404);
    }
    return pedido;
  }

  static async getPedidoHistorial(
    filtros: PedidoHistorialFiltros
  ): Promise<{ rows: Pedido[]; count: number }> {
    const where: Record<string, unknown> = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.metodo_pago) where.metodo_pago = filtros.metodo_pago;
    if (filtros.startDate && filtros.endDate) {
      where.f_creacion = { [Op.between]: [filtros.startDate, filtros.endDate] };
    }

    const offset = (filtros.page - 1) * filtros.limit;

    return Pedido.findAndCountAll({
      where,
      include: [...pedidoInclude],
      order: [['f_creacion', 'DESC']],
      limit: filtros.limit,
      offset,
    });
  }
}
