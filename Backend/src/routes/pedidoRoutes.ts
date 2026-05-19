import { Router } from 'express';
import { PedidoController } from '../controllers/pedidoController';

const router = Router();

// GET /api/pedidos/activos
router.get('/activos', PedidoController.getPedidosActivos);

// PATCH /api/pedidos/:id/estado
router.patch('/:id/estado', PedidoController.actualizarEstado);

export default router;
