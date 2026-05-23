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
import type { Pedido } from './Pedido';
import type { Producto } from './Producto';

export class DetallePedido extends Model<
  InferAttributes<DetallePedido>,
  InferCreationAttributes<DetallePedido>
> {
  declare id: CreationOptional<number>;
  declare pedido_id: ForeignKey<number>;
  declare producto_id: ForeignKey<number>;
  declare cantidad: CreationOptional<number>;
  declare p_unitario: number;
  declare modificadores: Record<string, unknown> | null;
  declare f_creacion: CreationOptional<Date>;

  declare pedido?: NonAttribute<Pedido>;
  declare producto?: NonAttribute<Producto>;

  static initialize(sequelize: Sequelize): void {
    DetallePedido.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        pedido_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        producto_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        cantidad: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            isInt: { msg: 'La cantidad debe ser un entero' },
            min: { args: [1], msg: 'La cantidad mínima es 1' },
          },
        },
        p_unitario: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            isDecimal: { msg: 'El precio unitario debe ser decimal' },
            min: { args: [0.01], msg: 'El precio unitario debe ser mayor a 0' },
          },
        },
        modificadores: {
          type: DataTypes.JSON,
          allowNull: true,
          validate: {
            isValidJson(value: unknown): void {
              if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
                throw new Error('Los modificadores deben ser un objeto JSON válido');
              }
            },
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
        tableName: 'detalle_pedidos',
        underscored: true,
        timestamps: false,
      }
    );
  }
}
