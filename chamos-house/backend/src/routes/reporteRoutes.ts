import { Router } from 'express';
import { ReporteController } from '../controllers/reporteController';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('admin'),
  asyncHandler(ReporteController.obtener)
);

export default router;
