import { Router } from 'express';
import { PedidoController } from '../orders/order.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { runValidation } from '../../core/middlewares/validate.middleware';
import {
  actualizarEstadoValidator,
  pedidoHistorialValidator,
  pedidoIdValidator,
  webhookPedidoValidator,
} from '..//orders/order.validators';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();

router.use(verifyToken, requireRole('admin', 'cocina'));

router.get(
  '/',
  pedidoHistorialValidator,
  runValidation,
  asyncHandler(PedidoController.listar)
);

router.get('/activos', asyncHandler(PedidoController.getActivos));

router.get(
  '/:id',
  pedidoIdValidator,
  runValidation,
  asyncHandler(PedidoController.getById)
);

router.patch(
  '/:id/estado',
  actualizarEstadoValidator,
  runValidation,
  asyncHandler(PedidoController.actualizarEstado)
);

router.post(
  '/',
  webhookPedidoValidator,
  runValidation,
  asyncHandler(PedidoController.crear)
);

export default router;
