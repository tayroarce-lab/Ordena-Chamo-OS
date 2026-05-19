import { Request, Response } from 'express';
import { PedidoService } from '../services/pedidoService';
import { socketManager } from '../socket/socketManager';

export class WebhookController {
  /**
   * Endpoint receptor del payload de n8n para nuevos pedidos
   */
  static async recibirPedido(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;

      // Llamar al service para ejecutar la lógica de negocio y transacciones
      const pedido = await PedidoService.crearPedidoDesdeWebhook(data);

      // Emitir evento al namespace /cocina para el KDS
      socketManager.getCocinaNamespace().emit('nuevo_pedido', pedido.toJSON());

      // Retornar respuesta exitosa esperada por n8n
      return res.status(201).json({
        success: true,
        pedido_id: pedido.id,
        mensaje: 'Pedido recibido correctamente'
      });

    } catch (error: unknown) {
      console.error('[WebhookController] Error procesando pedido desde n8n:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return res.status(500).json({
        success: false,
        error: 'Error interno al procesar el pedido.',
        details: errorMessage
      });
    }
  }
}
