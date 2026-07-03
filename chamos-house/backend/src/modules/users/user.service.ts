import { Op } from 'sequelize';
import { Usuario, Pedido } from '../../models';
import { AppError } from '../../core/middlewares/error.middleware';
import type { RolUsuario, UsuarioFiltros } from '../../types';

export interface UsuarioCreateInput {
  telefono: string;
  nombre?: string | null;
  rol: 'cocina' | 'admin';
  password: string;
  activo?: boolean;
}

export interface UsuarioUpdateInput {
  telefono?: string;
  nombre?: string | null;
  rol?: 'cocina' | 'admin';
  password?: string;
  activo?: boolean;
}

export class UsuarioService {
  static async getAll(
    filtros: UsuarioFiltros
  ): Promise<{ rows: Usuario[]; count: number }> {
    const where: Record<string, unknown> = {
      rol: { [Op.in]: ['cocina', 'admin'] },
    };

    if (filtros.rol) where.rol = filtros.rol;

    if (filtros.search) {
      Object.assign(where, {
        [Op.or]: [
          { nombre: { [Op.like]: `%${filtros.search}%` } },
          { telefono: { [Op.like]: `%${filtros.search}%` } },
        ],
      });
    }

    const offset = (filtros.page - 1) * filtros.limit;

    return Usuario.findAndCountAll({
      where,
      order: [['f_creacion', 'DESC']],
      limit: filtros.limit,
      offset,
    });
  }

  static async getById(id: number): Promise<{ usuario: Usuario; pedidosCount: number }> {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const pedidosCount = await Pedido.count({ where: { usuario_id: id } });
    return { usuario, pedidosCount };
  }

  static async create(data: UsuarioCreateInput): Promise<Usuario> {
    return Usuario.create({
      telefono: data.telefono,
      nombre: data.nombre ?? null,
      rol: data.rol,
      password: data.password,
      activo: data.activo ?? true,
    });
  }

  static async update(id: number, data: UsuarioUpdateInput): Promise<Usuario> {
    const usuario = await Usuario.scope('withPassword').findByPk(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (usuario.rol === 'cliente') {
      throw new AppError('No se puede modificar un usuario cliente desde este módulo', 403);
    }

    if (data.telefono !== undefined) usuario.telefono = data.telefono;
    if (data.nombre !== undefined) usuario.nombre = data.nombre;
    if (data.rol !== undefined) usuario.rol = data.rol;
    if (data.password !== undefined) usuario.password = data.password;
    if (data.activo !== undefined) usuario.activo = data.activo;

    await usuario.save();
    return usuario;
  }

  static async toggleActivo(id: number): Promise<Usuario> {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (usuario.rol === 'cliente') {
      throw new AppError('No se puede desactivar usuarios cliente desde aquí', 403);
    }

    if (usuario.rol === 'admin' && usuario.activo) {
      const adminsActivos = await Usuario.count({
        where: { rol: 'admin', activo: true },
      });
      if (adminsActivos <= 1) {
        throw new AppError('No se puede desactivar el último administrador activo', 409);
      }
    }

    usuario.activo = !usuario.activo;
    await usuario.save();
    return usuario;
  }
}
