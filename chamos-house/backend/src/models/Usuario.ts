import bcrypt from 'bcryptjs';
import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import type { RolUsuario } from '../types';

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: CreationOptional<number>;
  declare telefono: string;
  declare nombre: string | null;
  declare rol: RolUsuario;
  declare password: string | null;
  declare activo: CreationOptional<boolean>;
  declare f_creacion: CreationOptional<Date>;

  async validatePassword(plain: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plain, this.password);
  }

  static initialize(sequelize: Sequelize): void {
    Usuario.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        telefono: {
          type: DataTypes.STRING(20),
          unique: true,
          allowNull: false,
          validate: {
            isNumeric: { msg: 'El teléfono debe contener solo dígitos' },
            len: { args: [7, 20], msg: 'El teléfono debe tener entre 7 y 20 dígitos' },
          },
        },
        nombre: {
          type: DataTypes.STRING(100),
          allowNull: true,
          validate: {
            len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
          },
        },
        rol: {
          type: DataTypes.ENUM('cliente', 'cocina', 'admin'),
          allowNull: false,
          defaultValue: 'cliente',
          validate: {
            isIn: { args: [['cliente', 'cocina', 'admin']], msg: 'Rol inválido' },
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            len: { args: [8, 255], msg: 'La contraseña debe tener al menos 8 caracteres' },
          },
        },
        activo: {
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
        tableName: 'usuarios',
        underscored: true,
        timestamps: false,
        hooks: {
          beforeCreate: async (usuario: Usuario) => {
            await Usuario.hashPasswordIfNeeded(usuario);
          },
          beforeUpdate: async (usuario: Usuario) => {
            await Usuario.hashPasswordIfNeeded(usuario);
          },
        },
        defaultScope: {
          attributes: { exclude: ['password'] },
        },
        scopes: {
          withPassword: {
            attributes: { include: ['password'] },
          },
        },
      }
    );
  }

  private static async hashPasswordIfNeeded(usuario: Usuario): Promise<void> {
    if (!usuario.password) return;
    if (usuario.changed('password')) {
      usuario.password = await bcrypt.hash(usuario.password, 10);
    }
  }

  toJSON(): Record<string, unknown> {
    const values = { ...this.get() } as Record<string, unknown>;
    delete values.password;
    return values;
  }
}
