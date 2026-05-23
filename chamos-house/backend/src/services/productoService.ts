import { Op } from 'sequelize';
import { Producto, DetallePedido, Pedido } from '../models';
import { AppError } from '../middlewares/error.middleware';

export interface ProductoCreateInput {
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria?: string | null;
  disponible?: boolean;
}

export interface ProductoUpdateInput {
  nombre?: string;
  descripcion?: string | null;
  precio?: number;
  categoria?: string | null;
  disponible?: boolean;
}

export class ProductoService {
  static async getAll(includeInactive = false): Promise<Producto[]> {
    if (includeInactive) {
      return Producto.unscoped().findAll({ order: [['nombre', 'ASC']] });
    }
    return Producto.findAll({ order: [['nombre', 'ASC']] });
  }

  static async getById(id: number, includeInactive = false): Promise<Producto> {
    const producto = includeInactive
      ? await Producto.unscoped().findByPk(id)
      : await Producto.findByPk(id);

    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    return producto;
  }

  static async create(data: ProductoCreateInput): Promise<Producto> {
    return Producto.unscoped().create({
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      precio: data.precio,
      categoria: data.categoria ?? null,
      disponible: data.disponible ?? true,
    });
  }

  static async update(id: number, data: ProductoUpdateInput): Promise<Producto> {
    const producto = await Producto.unscoped().findByPk(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    if (data.nombre !== undefined) producto.nombre = data.nombre;
    if (data.descripcion !== undefined) producto.descripcion = data.descripcion;
    if (data.precio !== undefined) producto.precio = data.precio;
    if (data.categoria !== undefined) producto.categoria = data.categoria;
    if (data.disponible !== undefined) producto.disponible = data.disponible;

    await producto.save();
    return producto;
  }

  static async toggleDisponible(id: number): Promise<Producto> {
    const producto = await Producto.unscoped().findByPk(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }
    producto.disponible = !producto.disponible;
    await producto.save();
    return producto;
  }

  static async delete(id: number): Promise<void> {
    const producto = await Producto.unscoped().findByPk(id);
    if (!producto) {
      throw new AppError('Producto no encontrado', 404);
    }

    const detallesActivos = await DetallePedido.count({
      where: { producto_id: id },
      include: [
        {
          model: Pedido,
          as: 'pedido',
          where: {
            estado: { [Op.in]: ['pendiente', 'en_proceso', 'listo'] },
          },
          required: true,
        },
      ],
    });

    if (detallesActivos > 0) {
      throw new AppError(
        'No se puede eliminar el producto porque está en pedidos activos',
        409
      );
    }

    await producto.destroy();
  }
}
