import type { Request, Response } from 'express';
import { UsuarioService } from '../users/user.service';
import { success, paginated } from '../../core/utils/apiResponse';
import type { RolUsuario } from '../../types';

export class UsuarioController {
  static async listar(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const rol = req.query.rol as RolUsuario | undefined;
    const search = req.query.search as string | undefined;

    const { rows, count } = await UsuarioService.getAll({ page, limit, rol, search });
    return paginated(res, rows, count, page, limit);
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const { usuario, pedidosCount } = await UsuarioService.getById(id);
    return success(res, { usuario, pedidosCount });
  }

  static async crear(req: Request, res: Response): Promise<Response> {
    const usuario = await UsuarioService.create(req.body);
    return success(res, usuario, 'Usuario creado', 201);
  }

  static async actualizar(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const usuario = await UsuarioService.update(id, req.body);
    return success(res, usuario, 'Usuario actualizado');
  }

  static async toggleActivo(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const usuario = await UsuarioService.toggleActivo(id);
    return success(res, usuario, 'Estado de usuario actualizado');
  }
}
