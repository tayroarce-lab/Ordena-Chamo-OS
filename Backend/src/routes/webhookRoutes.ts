import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';
import { validatePedido } from '../middlewares/validatePedido';

const router = Router();

// Endpoint para recibir el webhook de n8n
router.post('/pedido', validatePedido, WebhookController.recibirPedido);

export default router;
