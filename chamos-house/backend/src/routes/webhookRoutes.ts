import { Router } from 'express';
import { WebhookController } from '../controllers/webhookController';
import { verifyWebhookSecret } from '../middlewares/auth.middleware';
import { runValidation } from '../middlewares/validate.middleware';
import { webhookPedidoValidator } from '../middlewares/validators/pedido.validators';
import { asyncHandler } from '../utils/asyncHandler';
import { webhookLimiter } from '../middlewares/rateLimiter';

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
