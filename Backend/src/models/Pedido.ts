import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from 'sequelize';
import { Usuario } from './Usuario';
import { DetallePedido } from './DetallePedido';

export class Pedido extends Model<InferAttributes<Pedido>, InferCreationAttributes<Pedido>> {
  declare id: CreationOptional<number>;
  
  declare usuario_id: ForeignKey<Usuario['id']>;
  
  /**
   * Estado actual del pedido. Ciclo de vida unidireccional: pendiente -> en_proceso -> listo -> entregado.
   */
  declare estado: CreationOptional<'pendiente' | 'en_proceso' | 'listo' | 'entregado'>;
  
  declare metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'zelle';
  
  /**
   * Total del pedido, calculado siempre por el backend como SUM(p_unitario * cantidad) de sus detalles.
   */
  declare total: number;
  
  /**
   * Fecha de creación del pedido.
   */
  declare f_creacion: CreationOptional<Date>;

  // Relaciones tipadas para Typescript
  declare usuario?: NonAttribute<Usuario>;
  declare detalles?: NonAttribute<DetallePedido[]>;

  static initialize(sequelize: Sequelize) {
    Pedido.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'en_proceso', 'listo', 'entregado'),
        allowNull: true,
        defaultValue: 'pendiente'
      },
      metodo_pago: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'zelle'),
        allowNull: false
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      f_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'f_creacion'
      }
    }, {
      sequelize,
      tableName: 'pedidos',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: 'f_creacion'
    });
  }

  static associate(models: any) {
    Pedido.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    Pedido.hasMany(models.DetallePedido, { foreignKey: 'pedido_id', as: 'detalles' });
  }
}
