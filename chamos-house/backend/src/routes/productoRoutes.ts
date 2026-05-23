import { Router } from 'express';
import { ProductoController } from '../controllers/productoController';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { runValidation } from '../middlewares/validate.middleware';
import {
  createProductoValidator,
  updateProductoValidator,
  productoIdValidator,
} from '../middlewares/validators/producto.validators';
import { asyncHandler } from '../utils/asyncHandler';

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
