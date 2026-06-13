import '../config/env';
import { sequelize } from '../config/database';
import '../models';
import { Usuario, Producto } from '../models';
import { logger } from '../utils/logger';

const PRODUCTOS_SEED = [
  // ── Papas ────────────────────────────────────────────────────────────
  { nombre: 'Papas chamo',      descripcion: null, precio: 3500, categoria: 'papas' },
  { nombre: 'Papas Mega Chamo', descripcion: null, precio: 4500, categoria: 'papas' },
  { nombre: 'Orden de papas',   descripcion: null, precio: 1500, categoria: 'papas' },
  { nombre: 'Papicarne',        descripcion: null, precio: 2500, categoria: 'papas' },
  { nombre: 'Salchipapa',       descripcion: null, precio: 2000, categoria: 'papas' },
  { nombre: 'Salchipapicarne',  descripcion: null, precio: 3000, categoria: 'papas' },
  // ── Tequeños ─────────────────────────────────────────────────────────
  { nombre: 'Tequeños',         descripcion: null, precio: 2500, categoria: 'tequeños' },
];

async function seed(): Promise<void> {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const usuariosCount = await Usuario.count();
    if (usuariosCount === 0) {
      await Usuario.create({
        telefono: '00000000000',
        nombre: 'Admin',
        rol: 'admin',
        password: 'Admin123!',
        activo: true,
      });

      await Usuario.create({
        telefono: '11111111111',
        nombre: 'Cocina',
        rol: 'cocina',
        password: 'Cocina123!',
        activo: true,
      });

      logger.info('Usuarios admin y cocina creados');
    } else {
      logger.info('Usuarios ya existen, omitiendo creación');
    }

    // Limpia todos los productos (force:true evita restricciones de softDelete si las hubiera)
    // DELETE sin TRUNCATE para respetar las FK de detalle_pedidos
    await Producto.unscoped().destroy({ where: {}, force: true });
    await Producto.bulkCreate(
      PRODUCTOS_SEED.map((p) => ({ ...p, disponible: true }))
    );
    logger.info(`${PRODUCTOS_SEED.length} productos cargados en la base de datos`);

    logger.info('Seed completado exitosamente');
    process.exit(0);
  } catch (err) {
    logger.error('Error ejecutando seed', { err });
    process.exit(1);
  }
}

void seed();
