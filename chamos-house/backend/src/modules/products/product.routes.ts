import { Router } from 'express';
import { ProductoController } from '../products/product.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { runValidation } from '../../core/middlewares/validate.middleware';
import {
  createProductoValidator,
  updateProductoValidator,
  productoIdValidator,
} from '..//products/product.validators';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();

router.get('/publico', asyncHandler(ProductoController.listarPublico));

router.get('/', verifyToken, asyncHandler(ProductoController.listar));

router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  createProductoValidator,
  runValidation,
  asyncHandler(ProductoController.crear)
);

router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  updateProductoValidator,
  runValidation,
  asyncHandler(ProductoController.actualizar)
);

router.patch(
  '/:id/disponible',
  verifyToken,
  requireRole('admin'),
  productoIdValidator,
  runValidation,
  asyncHandler(ProductoController.toggleDisponible)
);

router.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  productoIdValidator,
  runValidation,
  asyncHandler(ProductoController.eliminar)
);

export default router;
