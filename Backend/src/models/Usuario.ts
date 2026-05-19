import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  /**
   * ID único autoincremental del usuario.
   */
  declare id: CreationOptional<number>;
  
  /**
   * Teléfono utilizado como identificador principal del negocio con el cliente (WhatsApp).
   */
  declare telefono: string;
  
  declare nombre: string | null;
  
  declare rol: 'cliente' | 'cocina' | 'admin';
  
  /**
   * Fecha de creación del registro.
   */
  declare f_creacion: CreationOptional<Date>;

  static initialize(sequelize: Sequelize) {
    Usuario.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      telefono: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      rol: {
        type: DataTypes.ENUM('cliente', 'cocina', 'admin'),
        allowNull: false,
        defaultValue: 'cliente'
      },
      f_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'f_creacion'
      }
    }, {
      sequelize,
      tableName: 'usuarios',
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: 'f_creacion'
    });
  }

  static associate(models: any) {
    Usuario.hasMany(models.Pedido, { foreignKey: 'usuario_id', as: 'pedidos' });
  }
}
