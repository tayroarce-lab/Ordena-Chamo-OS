import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import webhookRoutes from '../modules/webhooks/webhook.routes';
import pedidoRoutes from '../modules/orders/order.routes';
import productoRoutes from '../modules/products/product.routes';
import usuarioRoutes from '../modules/users/user.routes';
import reporteRoutes from '../modules/reports/report.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/productos', productoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/reportes', reporteRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
