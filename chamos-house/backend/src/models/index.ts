import { sequelize } from '../config/database';
import { Usuario } from './Usuario';
import { Producto } from './Producto';
import { Pedido } from './Pedido';
import { DetallePedido } from './DetallePedido';

Usuario.initialize(sequelize);
Producto.initialize(sequelize);
Pedido.initialize(sequelize);
DetallePedido.initialize(sequelize);

Usuario.hasMany(Pedido, { foreignKey: 'usuario_id', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });

DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id', as: 'detalles' });

export { sequelize, Usuario, Producto, Pedido, DetallePedido };
