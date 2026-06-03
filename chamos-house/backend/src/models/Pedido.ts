import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from 'sequelize';
import type { EstadoPedido, MetodoPago } from '../types';
import type { Usuario } from './Usuario';
import type { DetallePedido } from './DetallePedido';

export class Pedido extends Model<
  InferAttributes<Pedido>,
  InferCreationAttributes<Pedido>
> {
  declare id: CreationOptional<number>;
  declare usuario_id: ForeignKey<number>;
  declare estado: CreationOptional<EstadoPedido>;
  declare metodo_pago: MetodoPago;
  declare total: number;
  declare notas: string | null;
  declare f_creacion: CreationOptional<Date>;

  declare usuario?: NonAttribute<Usuario>;
  declare detalles?: NonAttribute<DetallePedido[]>;

  static initialize(sequelize: Sequelize): void {
    Pedido.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        usuario_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        estado: {
          type: DataTypes.ENUM('pendiente', 'en_proceso', 'listo', 'entregado'),
          allowNull: false,
          defaultValue: 'pendiente',
          validate: {
            isIn: {
              args: [['pendiente', 'en_proceso', 'listo', 'entregado']],
              msg: 'Estado inválido',
            },
          },
        },
        metodo_pago: {
          type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'sinpe_movil'),
          allowNull: false,
          validate: {
            isIn: {
              args: [['efectivo', 'tarjeta', 'transferencia', 'sinpe_movil']],
              msg: 'Método de pago inválido',
            },
          },
        },
        total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            isDecimal: { msg: 'El total debe ser un número decimal' },
            min: { args: [0], msg: 'El total no puede ser negativo' },
          },
        },
        notas: {
          type: DataTypes.TEXT,
          allowNull: true,
          validate: {
            len: { args: [0, 500], msg: 'Las notas no pueden exceder 500 caracteres' },
          },
        },
        f_creacion: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'pedidos',
        underscored: true,
        timestamps: false,
      }
    );
  }
}
