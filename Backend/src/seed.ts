import { sequelize, Producto } from './models';

async function seedProducts() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log('Insertando productos de prueba en la base de datos...');

    await Producto.bulkCreate([
      { id: 1, nombre: 'Hamburguesa Clásica', precio: 3500.00, categoria: 'Comida', disponible: true },
      { id: 2, nombre: 'Refresco de Cola', precio: 1200.00, categoria: 'Bebidas', disponible: true },
      { id: 3, nombre: 'Papas Fritas', precio: 1500.00, categoria: 'Acompañamientos', disponible: true }
    ], { updateOnDuplicate: ['nombre', 'precio', 'categoria'] }); // Para no duplicar si se corre dos veces

    console.log('✅ Productos insertados exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error insertando productos:', error);
    process.exit(1);
  }
}

seedProducts();
