import type { Request, Response } from 'express';
import { PedidoService, mapPedidoToSocketPayload } from '../services/pedidoService';
import { emitPedidoActualizado, emitNuevoPedido } from '../socket/handlers/cocinaHandler';
import { success, paginated } from '../utils/apiResponse';
import type { EstadoPedido, MetodoPago, WebhookPedidoPayload } from '../types';

export class PedidoController {
  static async listar(req: Request, res: Response): Promise<Response> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const estado = req.query.estado as EstadoPedido | undefined;
    const metodo_pago = req.query.metodo_pago as MetodoPago | undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const { rows, count } = await PedidoService.getPedidoHistorial({
      page,
      limit,
      estado,
      metodo_pago,
      startDate,
      endDate,
    });

    return paginated(res, rows, count, page, limit);
  }

  static async getActivos(_req: Request, res: Response): Promise<Response> {
    const pedidos = await PedidoService.getPedidosActivos();
    return success(res, pedidos);
  }

  static async getById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const pedido = await PedidoService.getPedidoById(id);
    return success(res, pedido);
  }

  static async actualizarEstado(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado: EstadoPedido };

    const resultado = await PedidoService.actualizarEstado(id, estado);
    emitPedidoActualizado(
      resultado.pedidoId,
      resultado.estadoAnterior,
      resultado.nuevoEstado
    );

    return success(res, {
      pedido_id: resultado.pedidoId,
      estado: resultado.nuevoEstado,
    }, 'Estado de pedido actualizado');
  }

  static async crear(req: Request, res: Response): Promise<Response> {
    const payload = req.body as WebhookPedidoPayload;
    const pedido = await PedidoService.crearPedidoDesdeWebhook(payload);
    emitNuevoPedido(mapPedidoToSocketPayload(pedido));

    return success(res, pedido, 'Pedido creado manualmente', 201);
  }
}
