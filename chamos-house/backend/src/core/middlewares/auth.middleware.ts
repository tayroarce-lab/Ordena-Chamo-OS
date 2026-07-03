import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import { AuthService } from '../../modules/auth/auth.service';
import { error } from '..//utils/apiResponse';
import type { RolUsuario } from '../../types';

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    error(res, 'Token de autenticación requerido', 401);
    return;
  }

  const token = authHeader.slice(7);

  if (AuthService.isTokenBlacklisted(token)) {
    error(res, 'Token inválido o expirado', 401);
    return;
  }

  try {
    const payload = AuthService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    error(res, 'Token inválido o expirado', 401);
  }
}

export function requireRole(...roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      error(res, 'No autenticado', 401);
      return;
    }

    if (!roles.includes(req.user.rol)) {
      error(res, 'No tiene permisos para realizar esta acción', 403);
      return;
    }

    next();
  };
}

export function verifyWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== env.webhookSecret) {
    error(res, 'Webhook no autorizado', 401);
    return;
  }
  next();
}
