import { Router } from 'express';
import { ReporteController } from '../reports/report.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { asyncHandler } from '../../core/utils/asyncHandler';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('admin'),
  asyncHandler(ReporteController.obtener)
);

export default router;
