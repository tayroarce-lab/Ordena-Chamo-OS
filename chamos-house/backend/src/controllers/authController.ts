import type { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { success } from '../utils/apiResponse';

export class AuthController {
  static async login(req: Request, res: Response): Promise<Response> {
    const { telefono, password } = req.body as { telefono: string; password: string };
    const result = await AuthService.login(telefono, password);
    return success(res, result, 'Inicio de sesión exitoso');
  }

  static async me(req: Request, res: Response): Promise<Response> {
    const userId = req.user!.id;
    const usuario = await AuthService.getMe(userId);
    return success(res, usuario);
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      AuthService.blacklistToken(authHeader.slice(7));
    }
    return success(res, null, 'Sesión cerrada correctamente');
  }
}
