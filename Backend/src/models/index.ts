import { sequelize } from '../config/database';
import { Usuario } from './Usuario';
import { Producto } from './Producto';
import { Pedido } from './Pedido';
import { DetallePedido } from './DetallePedido';

// Inicializar modelos
Usuario.initialize(sequelize);
Producto.initialize(sequelize);
Pedido.initialize(sequelize);
DetallePedido.initialize(sequelize);

// Objeto de modelos para pasar al método associate
const models = {
  Usuario,
  Producto,
  Pedido,
  DetallePedido
};

// Ejecutar asociaciones
Object.values(models).forEach((model: any) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

// Exportar base de datos y modelos centralizados
export {
  sequelize,
  Usuario,
  Producto,
  Pedido,
  DetallePedido,
  models
};
