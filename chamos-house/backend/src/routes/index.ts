import { Router } from 'express';
import authRoutes from './authRoutes';
import webhookRoutes from './webhookRoutes';
import pedidoRoutes from './pedidoRoutes';
import productoRoutes from './productoRoutes';
import usuarioRoutes from './usuarioRoutes';
import reporteRoutes from './reporteRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/productos', productoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/reportes', reporteRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
