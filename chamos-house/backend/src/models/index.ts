import { sequelize } from '../config/database';
import { Usuario } from '../modules/users/user.model';
import { Producto } from '../modules/products/product.model';
import { Pedido } from '../modules/orders/order.model';
import { DetallePedido } from '../modules/orders/order-detail.model';

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
