import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { runValidation } from '../middlewares/validate.middleware';
import {
  actualizarEstadoValidator,
  pedidoHistorialValidator,
  pedidoIdValidator,
} from '../middlewares/validators/pedido.validators';
import { asyncHandler } from '../utils/asyncHandler';

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

export default router;
