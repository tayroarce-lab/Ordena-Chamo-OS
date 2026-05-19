import { Request, Response } from 'express';
import { ReporteService } from '../services/reporteService';
import { getDynamicDateRange, Periodo } from '../utils/dateRangeHelper';

export class ReporteController {
  /**
   * Endpoint GET /api/reportes?periodo=dia|semana|mes&fecha=YYYY-MM-DD
   */
  static async obtenerReportes(req: Request, res: Response): Promise<Response> {
    try {
      const { periodo, fecha } = req.query as { periodo?: string; fecha?: string };

      if (!periodo || !['dia', 'semana', 'mes'].includes(periodo)) {
        return res.status(400).json({ 
          success: false, 
          error: "El parámetro 'periodo' es requerido y debe ser 'dia', 'semana' o 'mes'." 
        });
      }

      if (!fecha) {
        return res.status(400).json({ 
          success: false, 
          error: "El parámetro 'fecha' es requerido en formato YYYY-MM-DD." 
        });
      }

      // 1. Obtener el rango de fechas dinámico
      const { startDate, endDate } = getDynamicDateRange(periodo as Periodo, fecha);

      // 2. Ejecutar las consultas
      const reporteData = await ReporteService.obtenerReportes(startDate, endDate);

      // 3. Responder con JSON consolidado
      return res.status(200).json({
        periodo,
        rango: {
          inicio: startDate.toISOString(),
          fin: endDate.toISOString()
        },
        ...reporteData
      });

    } catch (error: unknown) {
      console.error('[ReporteController] Error generando reportes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno al generar los reportes.', 
        details: errorMessage 
      });
    }
  }
}
