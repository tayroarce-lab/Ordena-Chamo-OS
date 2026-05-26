import type { Request, Response } from 'express';
import { PedidoService, mapPedidoToSocketPayload } from '../services/pedidoService';
import { emitNuevoPedido } from '../socket/handlers/cocinaHandler';
import type { WebhookPedidoPayload } from '../types';

export class WebhookController {
  static async recibirPedido(req: Request, res: Response): Promise<Response> {
    const payload = req.body as WebhookPedidoPayload;
    const pedido = await PedidoService.crearPedidoDesdeWebhook(payload);
    emitNuevoPedido(mapPedidoToSocketPayload(pedido));

    return res.status(201).json({
      success: true,
      pedido_id: pedido.id,
      mensaje: 'Pedido recibido correctamente',
    });
  }
}
