import jwt, { type SignOptions } from 'jsonwebtoken';
import { Usuario } from '../models';
import { jwtConfig } from '../config/jwt';
import { AppError } from '../middlewares/error.middleware';
import type { JwtPayload, RolUsuario } from '../types';

const tokenBlacklist = new Set<string>();

export class AuthService {
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, jwtConfig.secret, options);
  }

  static verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      throw new AppError('Token inválido', 401);
    }
    const payload = decoded as JwtPayload;
    if (!payload.id || !payload.rol || !payload.telefono) {
      throw new AppError('Token inválido', 401);
    }
    return payload;
  }

  static isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
  }

  static blacklistToken(token: string): void {
    tokenBlacklist.add(token);
  }

  static async login(
    telefono: string,
    password: string
  ): Promise<{ token: string; user: { id: number; nombre: string | null; telefono: string; rol: RolUsuario } }> {
    const usuario = await Usuario.scope('withPassword').findOne({
      where: { telefono },
    });

    if (!usuario || !usuario.activo) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (usuario.rol === 'cliente') {
      throw new AppError('Los clientes no pueden iniciar sesión', 403);
    }

    if (!usuario.password) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isValid = await usuario.validatePassword(password);
    if (!isValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const payload: JwtPayload = {
      id: usuario.id,
      rol: usuario.rol,
      telefono: usuario.telefono,
    };

    const token = AuthService.generateToken(payload);

    return {
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        rol: usuario.rol,
      },
    };
  }

  static async getMe(userId: number): Promise<Usuario> {
    const usuario = await Usuario.findByPk(userId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return usuario;
  }
}
