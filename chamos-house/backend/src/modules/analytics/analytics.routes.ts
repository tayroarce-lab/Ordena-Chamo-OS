import { Router } from 'express';
import { AnalyticsController } from '../analytics/analytics.controller';
import { verifyToken, requireRole } from '../../core/middlewares/auth.middleware';
import { asyncHandler } from '../../core/utils/asyncHandler';

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

router.get(
  '/calendar-summary',
  verifyToken,
  requireRole('admin'),
  asyncHandler(AnalyticsController.getCalendarSummary)
);

export default router;
