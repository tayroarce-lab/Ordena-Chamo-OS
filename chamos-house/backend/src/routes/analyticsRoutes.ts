import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * Rutas de Analytics
 * Todos los endpoints requieren autenticación y rol 'admin' o superior
 */

router.get(
  '/monthly',
  verifyToken,
  requireRole('admin'),
  asyncHandler(AnalyticsController.getMonthly)
);

router.get(
  '/weekly',
  verifyToken,
  requireRole('admin'),
  asyncHandler(AnalyticsController.getWeekly)
);

router.get(
  '/daily',
  verifyToken,
  requireRole('admin'),
  asyncHandler(AnalyticsController.getDaily)
);

export default router;
