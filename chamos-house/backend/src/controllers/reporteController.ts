import type { Request, Response } from 'express';
import { ReporteService } from '../services/reporteService';
import { success } from '../utils/apiResponse';
import type { PeriodoReporte } from '../types';
import { AppError } from '../middlewares/error.middleware';

export class ReporteController {
  static async obtener(req: Request, res: Response): Promise<Response> {
    const periodo = req.query.periodo as PeriodoReporte | undefined;
    const fecha = (req.query.fecha as string) || new Date().toISOString().slice(0, 10);

    if (!periodo || !['dia', 'semana', 'mes'].includes(periodo)) {
      throw new AppError("Query 'periodo' debe ser dia, semana o mes", 400);
    }

    const reporte = await ReporteService.getReporte(periodo, fecha);
    return success(res, reporte);
  }
}
