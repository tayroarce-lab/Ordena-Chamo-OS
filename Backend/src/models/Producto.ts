import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Producto extends Model<InferAttributes<Producto>, InferCreationAttributes<Producto>> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  
  /**
   * Precio actual del producto. Este es el precio base consultado al crear el pedido.
   */
  declare precio: number;
  
  declare categoria: string | null;
  
  /**
   * Indica si el producto se encuentra disponible para la venta.
   */
  declare disponible: CreationOptional<boolean>;

  static initialize(sequelize: Sequelize) {
    Producto.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      categoria: {
        type: DataTypes.STRING(80),
        allowNull: true
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    }, {
      sequelize,
      tableName: 'productos',
      underscored: true,
      timestamps: false
    });
  }

  static associate(models: any) {
    Producto.hasMany(models.DetallePedido, { foreignKey: 'producto_id', as: 'detalles' });
  }
}
