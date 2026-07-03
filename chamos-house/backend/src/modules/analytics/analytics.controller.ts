import type { Request, Response } from 'express';
import { AnalyticsService } from '../analytics/analytics.service';
import { success } from '../../core/utils/apiResponse';
import { AppError } from '../../core/middlewares/error.middleware';

export class AnalyticsController {
  /**
   * GET /api/analytics/monthly
   * Query params: year (number), month (1-12)
   */
  static async getMonthly(req: Request, res: Response): Promise<Response> {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);

    if (!year || !month || month < 1 || month > 12) {
      throw new AppError('Query params "year" y "month" (1-12) son obligatorios', 400);
    }

    const data = await AnalyticsService.getMonthlyAnalytics(year, month);
    return success(res, data);
  }

  /**
   * GET /api/analytics/weekly
   * Query params: year (number), month (1-12), week (1-4)
   */
  static async getWeekly(req: Request, res: Response): Promise<Response> {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);
    const week = parseInt(req.query.week as string, 10);

    if (!year || !month || month < 1 || month > 12 || !week || week < 1 || week > 4) {
      throw new AppError('Query params "year", "month" (1-12) y "week" (1-4) son obligatorios', 400);
    }

    const data = await AnalyticsService.getWeeklyAnalytics(year, month, week);
    return success(res, data);
  }

  /**
   * GET /api/analytics/daily
   * Query params: date (YYYY-MM-DD)
   */
  static async getDaily(req: Request, res: Response): Promise<Response> {
    const date = req.query.date as string;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError('Query param "date" (YYYY-MM-DD) es obligatorio', 400);
    }

    const data = await AnalyticsService.getDailyAnalytics(date);
    return success(res, data);
  }

  /**
   * GET /api/analytics/calendar-summary
   * Query params: month (YYYY-MM)
   */
  static async getCalendarSummary(req: Request, res: Response): Promise<Response> {
    const monthStr = req.query.month as string;

    if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
      throw new AppError('Query param "month" (YYYY-MM) es obligatorio', 400);
    }

    const [year, month] = monthStr.split('-').map(Number);
    const data = await AnalyticsService.getCalendarSummary(year, month);
    return success(res, data);
  }
}
