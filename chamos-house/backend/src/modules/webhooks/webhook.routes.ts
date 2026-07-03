import { Router } from 'express';
import { WebhookController } from '../webhooks/webhook.controller';
import { verifyWebhookSecret } from '../../core/middlewares/auth.middleware';
import { runValidation } from '../../core/middlewares/validate.middleware';
import { webhookPedidoValidator } from '..//orders/order.validators';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { webhookLimiter } from '../../core/middlewares/rateLimiter';

const router = Router();

router.post(
  '/pedido',
  webhookLimiter,
  verifyWebhookSecret,
  webhookPedidoValidator,
  runValidation,
  asyncHandler(WebhookController.recibirPedido)
);

export default router;
