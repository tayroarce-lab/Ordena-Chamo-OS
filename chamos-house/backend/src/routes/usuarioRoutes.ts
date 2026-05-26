import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { runValidation } from '../middlewares/validate.middleware';
import {
  createUsuarioValidator,
  updateUsuarioValidator,
  usuarioIdValidator,
  usuarioListValidator,
} from '../middlewares/validators/usuario.validators';
import { asyncHandler } from '../utils/asyncHandler';

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
