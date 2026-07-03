import { Router } from 'express';
import { UsuarioController } from '../users/user.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { runValidation } from '../../core/middlewares/validate.middleware';
import {
  createUsuarioValidator,
  updateUsuarioValidator,
  usuarioIdValidator,
  usuarioListValidator,
} from '..//users/user.validators';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get(
  '/',
  usuarioListValidator,
  runValidation,
  asyncHandler(UsuarioController.listar)
);

router.get(
  '/:id',
  usuarioIdValidator,
  runValidation,
  asyncHandler(UsuarioController.getById)
);

router.post(
  '/',
  createUsuarioValidator,
  runValidation,
  asyncHandler(UsuarioController.crear)
);

router.put(
  '/:id',
  updateUsuarioValidator,
  runValidation,
  asyncHandler(UsuarioController.actualizar)
);

router.patch(
  '/:id/activo',
  usuarioIdValidator,
  runValidation,
  asyncHandler(UsuarioController.toggleActivo)
);

export default router;
