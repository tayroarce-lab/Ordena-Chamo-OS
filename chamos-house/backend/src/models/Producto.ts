import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

export class Producto extends Model<
  InferAttributes<Producto>,
  InferCreationAttributes<Producto>
> {
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare descripcion: string | null;
  declare precio: number;
  declare categoria: string | null;
  declare disponible: CreationOptional<boolean>;
  declare f_creacion: CreationOptional<Date>;

  static initialize(sequelize: Sequelize): void {
    Producto.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        nombre: {
          type: DataTypes.STRING(150),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'El nombre es obligatorio' },
            len: { args: [2, 150], msg: 'El nombre debe tener entre 2 y 150 caracteres' },
          },
        },
        descripcion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        precio: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            isDecimal: { msg: 'El precio debe ser un número decimal' },
            min: { args: [0.01], msg: 'El precio debe ser mayor a 0' },
          },
        },
        categoria: {
          type: DataTypes.STRING(80),
          allowNull: true,
          validate: {
            len: { args: [2, 80], msg: 'La categoría debe tener entre 2 y 80 caracteres' },
          },
        },
        disponible: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        f_creacion: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'productos',
        underscored: true,
        timestamps: false,
        defaultScope: {
          where: { disponible: true },
        },
        scopes: {
          all: {},
        },
      }
    );
  }
}
