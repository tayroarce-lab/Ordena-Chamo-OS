import { Router } from 'express';
import { ReporteController } from '../controllers/reporteController';

const router = Router();

// GET /api/reportes?periodo=dia|semana|mes&fecha=YYYY-MM-DD
router.get('/', ReporteController.obtenerReportes);

export default router;
