import '../config/env';
import { sequelize } from '../config/database';
import '../models';
import { Usuario, Producto, Pedido, DetallePedido } from '../models';
import { logger } from '../utils/logger';
import { EstadoPedido, MetodoPago } from '../types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedAnalytics(): Promise<void> {
  try {
    await sequelize.authenticate();
    
    // 1. Obtener Admin (creado por el seeder inicial)
    const admin = await Usuario.findOne({ where: { rol: 'admin' } });
    if (!admin) {
      throw new Error('No se encontró el usuario admin. Ejecuta npm run seed primero.');
    }

    // 2. Obtener Productos disponibles
    const productos = await Producto.findAll();
    if (productos.length === 0) {
      throw new Error('No se encontraron productos. Ejecuta npm run seed primero.');
    }

    // 3. Limpiar pedidos y detalles existentes
    await DetallePedido.destroy({ where: {}, force: true });
    await Pedido.destroy({ where: {}, force: true });
    logger.info('Pedidos y detalles anteriores eliminados.');

    // 4. Parámetros de generación (90 días)
    const DAYS_TO_GENERATE = 90;
    const now = new Date();
    
    const pedidosAInsertar: any[] = [];
    
    for (let i = DAYS_TO_GENERATE; i >= 0; i--) {
      const currentDay = new Date(now);
      currentDay.setDate(now.getDate() - i);
      const dayOfWeek = currentDay.getDay(); // 0: Dom, 1: Lun, ..., 6: Sab
      
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Vie, Sab, Dom
      
      // 5% probabilidad de día sin ventas
      if (Math.random() < 0.05) continue;
      
      const numOrders = isWeekend ? getRandomInt(8, 18) : getRandomInt(3, 10);
      
      for (let o = 0; o < numOrders; o++) {
        // Hora entre 11:00 y 22:00, con más probabilidad entre 12-14 y 19-21
        let hour = getRandomInt(11, 22);
        const r = Math.random();
        if (r < 0.3) hour = getRandomInt(12, 14); // Pico mediodía
        else if (r < 0.7) hour = getRandomInt(19, 21); // Pico noche
        
        const f_creacion = new Date(currentDay);
        f_creacion.setHours(hour, getRandomInt(0, 59), getRandomInt(0, 59));
        
        // Estado
        let estado: EstadoPedido = 'entregado';
        const stRand = Math.random();
        if (stRand > 0.97) estado = 'pendiente';
        else if (stRand > 0.90) estado = 'listo';
        else if (stRand > 0.78) estado = 'en_proceso';

        // Método pago
        let metodo_pago: MetodoPago = 'efectivo';
        const mpRand = Math.random();
        if (mpRand > 0.85) metodo_pago = 'sinpe_movil';
        else if (mpRand > 0.6) metodo_pago = 'transferencia';

        // Items
        const numItems = getRandomInt(1, 5);
        let total = 0;
        const detalles = [];
        const usedProducts = new Set<number>();

        for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
          // Elegir producto ponderado
          const pRand = Math.random();
          let prodNombre = 'Papas chamo';
          if (pRand > 0.97) prodNombre = 'Orden de papas';
          else if (pRand > 0.92) prodNombre = 'Salchipapicarne';
          else if (pRand > 0.84) prodNombre = 'Papas Mega Chamo';
          else if (pRand > 0.72) prodNombre = 'Papicarne';
          else if (pRand > 0.52) prodNombre = 'Tequeños';
          else if (pRand > 0.30) prodNombre = 'Salchipapa';

          const prod = productos.find(p => p.nombre === prodNombre) || productos[0];
          
          if (usedProducts.has(prod.id)) continue;
          usedProducts.add(prod.id);

          // Cantidad (1 a 3)
          const qRand = Math.random();
          const cantidad = qRand > 0.9 ? 3 : (qRand > 0.6 ? 2 : 1);
          
          total += parseFloat((prod.precio * cantidad).toString());
          
          detalles.push({
            producto_id: prod.id,
            cantidad,
            p_unitario: prod.precio,
            f_creacion
          });
        }

        if (detalles.length === 0) continue; // Si todos fueron ignorados por ser repetidos

        pedidosAInsertar.push({
          usuario_id: admin.id,
          estado,
          metodo_pago,
          total,
          f_creacion,
          detalles
        });
      }
    }
    
    // 5. Inserción de pedidos y detalles
    // Lo hacemos uno a uno (o en bulk) para mantener las FKs fáciles. Como Sequelize soporta include con bulkCreate, pero Pedido tiene asociaciones, las crearemos de a grupos.
    for (const pedidoData of pedidosAInsertar) {
      const p = await Pedido.create({
        usuario_id: pedidoData.usuario_id,
        estado: pedidoData.estado,
        metodo_pago: pedidoData.metodo_pago,
        total: pedidoData.total,
        f_creacion: pedidoData.f_creacion
      });
      
      for (const d of pedidoData.detalles) {
        await DetallePedido.create({
          pedido_id: p.id,
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          p_unitario: d.p_unitario,
          f_creacion: d.f_creacion,
          modificadores: null
        });
      }
    }

    logger.info(`${pedidosAInsertar.length} pedidos generados con éxito para los últimos ${DAYS_TO_GENERATE} días.`);
    
    process.exit(0);
  } catch (err) {
    logger.error('Error ejecutando seed de analytics', { err });
    console.error(err);
    process.exit(1);
  }
}

void seedAnalytics();
