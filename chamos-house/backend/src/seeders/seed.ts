import '../config/env';
import { sequelize } from '../config/database';
import '../models';
import { Usuario, Producto } from '../models';
import { logger } from '../utils/logger';

const PRODUCTOS_SEED = [
  {
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Carne 100g, lechuga, tomate y salsa especial',
    precio: 3500,
    categoria: 'hamburguesas',
  },
  {
    nombre: 'Hamburguesa Doble',
    descripcion: 'Doble carne, queso cheddar y bacon',
    precio: 5200,
    categoria: 'hamburguesas',
  },
  {
    nombre: 'Hamburguesa BBQ',
    descripcion: 'Carne, cebolla caramelizada y salsa BBQ',
    precio: 4800,
    categoria: 'hamburguesas',
  },
  {
    nombre: 'Combo Familiar',
    descripcion: '4 hamburguesas clásicas + 4 papas + 4 bebidas',
    precio: 14500,
    categoria: 'combos',
  },
  {
    nombre: 'Combo Personal',
    descripcion: 'Hamburguesa clásica + papas + bebida',
    precio: 5500,
    categoria: 'combos',
  },
  {
    nombre: 'Refresco de Cola',
    descripcion: '500ml',
    precio: 1200,
    categoria: 'bebidas',
  },
  {
    nombre: 'Limonada Natural',
    descripcion: '500ml',
    precio: 1500,
    categoria: 'bebidas',
  },
  {
    nombre: 'Milkshake Vainilla',
    descripcion: '400ml',
    precio: 2200,
    categoria: 'bebidas',
  },
  {
    nombre: 'Papas Fritas',
    descripcion: 'Porción regular',
    precio: 1500,
    categoria: 'acompañamientos',
  },
  {
    nombre: 'Aros de Cebolla',
    descripcion: '8 unidades',
    precio: 1800,
    categoria: 'acompañamientos',
  },
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

    const productosCount = await Producto.unscoped().count();
    if (productosCount === 0) {
      await Producto.bulkCreate(
        PRODUCTOS_SEED.map((p) => ({ ...p, disponible: true }))
      );
      logger.info('10 productos de muestra creados');
    } else {
      logger.info('Productos ya existen, omitiendo creación');
    }

    logger.info('Seed completado exitosamente');
    process.exit(0);
  } catch (err) {
    logger.error('Error ejecutando seed', { err });
    process.exit(1);
  }
}

void seed();
