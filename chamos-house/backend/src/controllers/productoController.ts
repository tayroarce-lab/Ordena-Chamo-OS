import type { Request, Response } from 'express';
import { ProductoService } from '../services/productoService';
import { success } from '../utils/apiResponse';

export class ProductoController {
  static async listar(req: Request, res: Response): Promise<Response> {
    const includeInactive = req.user?.rol === 'admin';
    const productos = await ProductoService.getAll(includeInactive);
    return success(res, productos);
  }

  static async listarPublico(_req: Request, res: Response): Promise<Response> {
    const productos = await ProductoService.getAll(false);
    return success(res, productos);
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const includeInactive = req.user?.rol === 'admin';
    const producto = await ProductoService.getById(id, includeInactive);
    return success(res, producto);
  }

  static async crear(req: Request, res: Response): Promise<Response> {
    const producto = await ProductoService.create(req.body);
    return success(res, producto, 'Producto creado', 201);
  }

  static async actualizar(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const producto = await ProductoService.update(id, req.body);
    return success(res, producto, 'Producto actualizado');
  }

  static async toggleDisponible(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const producto = await ProductoService.toggleDisponible(id);
    return success(res, producto, 'Disponibilidad actualizada');
  }

  static async eliminar(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    await ProductoService.delete(id);
    return success(res, null, 'Producto eliminado');
  }
}
