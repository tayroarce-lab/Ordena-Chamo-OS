import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { Pedido } from './Pedido';
import { Producto } from './Producto';

export class DetallePedido extends Model<InferAttributes<DetallePedido>, InferCreationAttributes<DetallePedido>> {
  declare id: CreationOptional<number>;
  
  declare pedido_id: ForeignKey<Pedido['id']>;
  declare producto_id: ForeignKey<Producto['id']>;
  
  declare cantidad: CreationOptional<number>;
  
  /**
   * Snapshot del precio unitario del producto al momento exacto de la compra.
   */
  declare p_unitario: number;
  
  /**
   * Notas, extras o modificaciones específicas para este producto. Ej: { "sin_cebolla": true }
   */
  declare modificadores: Record<string, unknown> | null;

  // Relaciones tipadas para Typescript
  declare pedido?: NonAttribute<Pedido>;
  declare producto?: NonAttribute<Producto>;

  static initialize(sequelize: Sequelize) {
    DetallePedido.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      p_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      modificadores: {
        type: DataTypes.JSON,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'detalle_pedidos',
      underscored: true,
      timestamps: false
    });
  }

  static associate(models: any) {
    DetallePedido.belongsTo(models.Pedido, { foreignKey: 'pedido_id', as: 'pedido' });
    DetallePedido.belongsTo(models.Producto, { foreignKey: 'producto_id', as: 'producto' });
  }
}
